import { supabase } from "../lib/supabaseClients";
import { updateTABLE_STATUS } from "./tableService";

const formatStartDate = (startDate) => {
  if (!startDate) return null;
  if (startDate.includes("T")) return startDate;
  const d = new Date(`${startDate}T00:00:00`);
  return isNaN(d.getTime()) ? `${startDate}T00:00:00` : d.toISOString();
};

const formatEndDate = (endDate) => {
  if (!endDate) return null;
  if (endDate.includes("T")) return endDate;
  const d = new Date(`${endDate}T23:59:59.999`);
  return isNaN(d.getTime()) ? `${endDate}T23:59:59.999` : d.toISOString();
};

export const getOrders = async (params) => {
  let org_id, page, limit, startDate, endDate, status, orderId;
  let isPaginated = false;

  if (typeof params === "string") {
    org_id = params;
  } else if (params && typeof params === "object") {
    org_id = params.org_id;
    page = params.page ?? 1;
    limit = params.limit ?? 30;
    startDate = params.startDate;
    endDate = params.endDate;
    status = params.status;
    orderId = params.orderId || params.orderId;
    isPaginated = true;
  }

  try {
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("org_id", org_id)
      .order("created_at", { ascending: false });

    if (isPaginated) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    // Filter by start date
    if (startDate) {
      const formattedStartDate = formatStartDate(startDate);
      query = query.gte("created_at", formattedStartDate);
    }

    // Filter by end date
    if (endDate) {
      const formattedEndDate = formatEndDate(endDate);
      query = query.lte("created_at", formattedEndDate);
    }

    // Filter by status
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    // Filter by order ID
    if (orderId) {
      query = query.eq("id", orderId);
    }

    let { data, error, count } = await query;

    // Fallback to user_id if query with org_id fails (e.g. legacy schema where column is user_id)
    if (error) {
      let fallbackQuery = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", org_id)
        .order("created_at", { ascending: false });

      if (isPaginated) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        fallbackQuery = fallbackQuery.range(from, to);
      }
      if (startDate) {
        const formattedStartDate = formatStartDate(startDate);
        fallbackQuery = fallbackQuery.gte("created_at", formattedStartDate);
      }
      if (endDate) {
        const formattedEndDate = formatEndDate(endDate);
        fallbackQuery = fallbackQuery.lte("created_at", formattedEndDate);
      }
      if (status && status !== "All") {
        fallbackQuery = fallbackQuery.eq("status", status);
      }
      if (orderId) {
        fallbackQuery = fallbackQuery.eq("id", orderId);
      }

      const res = await fallbackQuery;
      if (res.error) throw res.error;
      data = res.data;
      count = res.count;
    }

    const result = data || [];
    result.total = count || 0;
    result.page = page ?? 1;
    result.limit = limit ?? (count || 0);
    result.totalPages = limit ? Math.ceil((count || 0) / limit) : 1;
    return result;
  } catch (err) {
    console.error("Supabase getOrders failed:", err);
    throw err;
  }
};

export const generateOrderNumber = async (org_id) => {
  const now = new Date();

  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  const prefix = `${mm}${dd}${yy}A`;

  const { data, error } = await supabase
    .from("orders")
    .select("order_number")
    .eq("org_id", org_id)
    .like("order_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;

  let next = 1;

  if (data.length) {
    const last = data[0].order_number; // e.g. 080626A200
    next = parseInt(last.replace(prefix, ""), 10) + 1;
  }

  return `${prefix}${next}`;
};

export const createOrder = async (org_id, orderData) => {
  let targetOrgId = org_id;
  let targetOrderData = orderData;

  if (typeof org_id === "object" && !orderData) {
    targetOrderData = org_id;
    targetOrgId = targetOrderData.org_id || targetOrderData.user_id;
  }

  const baseOrder = {
    org_id: targetOrgId,
    created_by: targetOrgId,
    created_at: new Date().toISOString(),
    status: "Pending",
    payment_status: "Unpaid",
    ...targetOrderData,
  };

  let attempts = 0;

  while (attempts < 5) {
    try {
      const orderNumber =
        attempts === 0 && targetOrderData?.order_number
          ? targetOrderData.order_number
          : await generateOrderNumber(targetOrgId);

      const insertPayload = {
        ...baseOrder,
        order_number: orderNumber,
      };

      if (!targetOrderData?.id) {
        delete insertPayload.id;
      }

      let { data, error } = await supabase
        .from("orders")
        .insert([insertPayload])
        .select();

      if (error) {
        // Retry without org_id if schema doesn't have org_id column
        const fallbackPayload = { ...insertPayload };
        delete fallbackPayload.org_id;

        const res = await supabase
          .from("orders")
          .insert([fallbackPayload])
          .select();

        if (res.error) {
          // Retry without user_id if schema only has org_id column
          const fallbackPayload2 = { ...insertPayload };
          delete fallbackPayload2.user_id;

          const res2 = await supabase
            .from("orders")
            .insert([fallbackPayload2])
            .select();

          if (res2.error) {
            error = res2.error;
          } else {
            data = res2.data;
            error = null;
          }
        } else {
          data = res.data;
          error = null;
        }
      }

      if (!error && data && data.length > 0) {
        const createdOrder = data[0];
        if (createdOrder.table_id) {
          await updateTABLE_STATUS(
            createdOrder.table_id,
            "Occupied",
            createdOrder.id,
          );
        }
        return createdOrder;
      }

      if (error && error.code !== "23505") {
        throw error;
      }

      attempts++;
    } catch (err) {
      if (err.code !== "23505") {
        console.error("Error creating order in Supabase:", err);
        throw err;
      }
      attempts++;
    }
  }

  throw new Error(
    "Failed to create order after 5 attempts due to duplicate order number.",
  );
};

export const updateOrderStatus = async (org_id, orderId, status) => {
  try {
    let { data, error } = await supabase
      .from("orders")
      .update({ status: status })
      .eq("id", orderId)
      .eq("org_id", org_id)
      .select();

    if (error) {
      const res = await supabase
        .from("orders")
        .update({ status: status })
        .eq("id", orderId)
        .eq("user_id", org_id)
        .select();

      if (res.error) throw res.error;
      data = res.data;
    }

    if (status === "Cancelled") {
      const orders = await getOrders(org_id);
      const currentOrder = orders.find((o) => o.id === orderId);
      if (currentOrder && currentOrder.table_id) {
        await updateTABLE_STATUS(
          currentOrder.table_id,
          "Available",
          null,
        );
      }
    }
    return data[0];
  } catch (err) {
    console.error("Error updating order status in Supabase:", err);
    throw err;
  }
};


