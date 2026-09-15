import { useState, useEffect, useCallback, useRef } from "react";
import useOrgData from "./useOrgData";
import { supabase } from "../../lib/supabaseClients";

// Statuses that qualify an order for the queue display
const QUEUE_STATUSES = ["Preparing", "Ready"];

const useQueue = () => {
  const { org_id, user_role, user_id } = useOrgData();
  const [queueListing, setQueueListing] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef(0);

  // ── helpers ────────────────────────────────────────────────────────
  const isQueueOrder = (order) =>
    order &&
    order.table_name &&
    order.table_name !== "" &&
    QUEUE_STATUSES.includes(order.status);

  // ── full fetch (initial + fallback) ────────────────────────────────
  const fetchQueue = useCallback(
    async (isSilent = false) => {
      if (!org_id) return;
      if (!isSilent) setLoading(true);

      try {
        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();

        let query = supabase
          .from("orders")
          .select("*")
          .eq("org_id", org_id)
          .not("table_name", "is", null)
          .neq("table_name", "")
          .in("status", QUEUE_STATUSES)
          .gte("created_at", tenHoursAgo);

        if (user_role === "admin" && user_id) {
          query = query.eq("created_by", user_id);
        }

        let { data, error } = await query.order("created_at", { ascending: false });

        // Fallback to user_id if org_id column doesn't exist
        if (error) {
          let fallbackQuery = supabase
            .from("orders")
            .select("*")
            .eq("user_id", org_id)
            .not("table_name", "is", null)
            .neq("table_name", "")
            .in("status", QUEUE_STATUSES)
            .gte("created_at", tenHoursAgo);

          if (user_role !== "admin" && user_id) {
            fallbackQuery = fallbackQuery.eq("created_by", user_id);
          }

          const res = await fallbackQuery.order("created_at", { ascending: false });

          if (res.error) throw res.error;
          data = res.data;
        }

        setQueueListing(data || []);
        lastFetchRef.current = Date.now();
      } catch (err) {
        console.error("useQueue error fetching:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [org_id]
  );

  // ── debounced refetch — avoids hammering the API on rapid changes ──
  const debounceTimer = useRef(null);
  const debouncedFetch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchQueue(true);
    }, 300);
  }, [fetchQueue]);

  // ── realtime handler: patch local state instantly ──────────────────
  const handleOrderChange = useCallback(
    (payload) => {
      const { eventType, new: newRow, old: oldRow } = payload;

      // ✅ GUARD: only process events for THIS org — ignore all others
      const rowOrgId = newRow?.org_id || newRow?.user_id || oldRow?.org_id || oldRow?.user_id;
      if (rowOrgId && rowOrgId !== org_id) return;

      switch (eventType) {
        case "INSERT": {
          if (isQueueOrder(newRow)) {
            setQueueListing((prev) => [newRow, ...prev]);
          }
          break;
        }

        case "UPDATE": {
          if (isQueueOrder(newRow)) {
            setQueueListing((prev) => {
              const idx = prev.findIndex((o) => o.id === newRow.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = newRow;
                return updated;
              }
              return [newRow, ...prev];
            });
          } else {
            setQueueListing((prev) =>
              prev.filter((o) => o.id !== (newRow?.id || oldRow?.id))
            );
          }
          break;
        }

        case "DELETE": {
          const removedId = oldRow?.id;
          if (removedId) {
            setQueueListing((prev) =>
              prev.filter((o) => o.id !== removedId)
            );
          }
          break;
        }

        default:
          debouncedFetch();
      }
    },
    [org_id, debouncedFetch]
  );


  // ── subscribe to realtime channels ─────────────────────────────────
  useEffect(() => {
    fetchQueue();

    // Fallback interval sync (silent, less frequent since realtime handles it)
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 20000);

    const channels = [];

    if (org_id) {
      // ── Channel 1: orders table — listen to every change ──────────
      const ordersChannel = supabase
        .channel(`queue_orders_${org_id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `org_id=eq.${org_id}`,
          },
          handleOrderChange
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `org_id=eq.${org_id}`,
          },
          handleOrderChange
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "orders",
          },
          handleOrderChange
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.warn("useQueue: orders channel error, will rely on polling");
          }
        });

      channels.push(ordersChannel);

      // ── Channel 2: dining_tables — refetch when a table changes ───
      //    (e.g. table renamed, status toggled — the order's table_name
      //     might need re-evaluation)
      const tablesChannel = supabase
        .channel(`queue_tables_${org_id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "dining_tables",
            filter: `org_id=eq.${org_id}`,
          },
          () => {
            debouncedFetch();
          }
        )
        .subscribe();

      channels.push(tablesChannel);
    }

    return () => {
      clearInterval(interval);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [org_id, fetchQueue, handleOrderChange, debouncedFetch]);

  return [queueListing, loading, () => fetchQueue(false)];
};

export default useQueue;
