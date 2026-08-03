import { supabase } from "../lib/supabaseClients";
import { updateTABLE_STATUS } from "./tableService";

export const getOrders = async (params) => {
  let userId, page, limit, startDate, endDate, status, orderId;
  let isPaginated = false;

  if (typeof params === "string") {
    userId = params;
  } else if (params && typeof params === "object") {
    userId = params.userId;
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (isPaginated) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    // Filter by start date
    if (startDate) {
      const formattedStartDate = startDate.includes("T") ? startDate : `${startDate}T00:00:00`;
      query = query.gte("created_at", formattedStartDate);
    }

    // Filter by end date
    if (endDate) {
      const formattedEndDate = endDate.includes("T") ? endDate : `${endDate}T23:59:59`;
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

    const { data, error, count } = await query;

    if (error) throw error;

    const result = data || [];
    result.total = count || 0;
    result.page = page ?? 1;
    result.limit = limit ?? (count || 0);
    result.totalPages = limit ? Math.ceil((count || 0) / limit) : 1;
    return result;
  } catch (err) {
    console.error("Supabase getOrders failed:", err);

    try {
      const queryParams = new URLSearchParams({
        userId: userId || "",
        ...(isPaginated && {
          page: String(page),
          limit: String(limit),
        }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && status !== "All" && { status }),
        ...(orderId && { orderId }),
      });

      const response = await fetch(`/api/offline/orders?${queryParams}`);

      if (!response.ok) {
        throw new Error("Offline API failed");
      }

      const result = await response.json();
      const offlineData = result?.data || [];
      const offlineTotal = result?.total || offlineData.length;
      
      const ordersArray = Array.isArray(result) ? result : offlineData;
      const finalResult = ordersArray || [];
      finalResult.total = offlineTotal;
      finalResult.page = page ?? 1;
      finalResult.limit = limit ?? finalResult.length;
      finalResult.totalPages = limit ? Math.ceil(offlineTotal / limit) : 1;
      return finalResult;
    } catch (offlineErr) {
      console.error("Offline API getOrders failed:", offlineErr);

      const emptyResult = [];
      emptyResult.total = 0;
      emptyResult.page = page ?? 1;
      emptyResult.limit = limit ?? 30;
      emptyResult.totalPages = 0;
      return emptyResult;
    }
  }
};

export const createOrder = async (userId, orderData) => {
  const baseOrder = {
    user_id: userId,
    created_at: new Date().toISOString(),
    status: "Pending",
    payment_status: "Unpaid",
    ...orderData,
  };

  try {
    // If orderData doesn't explicitly provide an id, omit it so PostgreSQL/Supabase
    // uses DEFAULT gen_random_uuid()
    const insertPayload = { ...baseOrder };
    if (!orderData.id) {
      delete insertPayload.id;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([insertPayload])
      .select();

    if (error) throw error;

    const createdOrder = data[0];
    if (createdOrder.table_id) {
      await updateTABLE_STATUS(
        userId,
        createdOrder.table_id,
        "Occupied",
        createdOrder.id,
      );
    }
    return createdOrder;
  } catch (err) {
    try {
      const response = await fetch("/api/offline/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, ...baseOrder }),
      });
      if (!response.ok) throw new Error("Offline API failed");
      const createdOrder = await response.json();
      if (createdOrder.table_id) {
        await updateTABLE_STATUS(
          userId,
          createdOrder.table_id,
          "Occupied",
          createdOrder.id,
        );
      }
      return createdOrder;
    } catch (offlineErr) {
      console.error("Offline API createOrder failed:", offlineErr);
      const offlineOrder = {
        id: orderData.id || `offline-${Date.now()}`,
        ...baseOrder,
      };
      if (offlineOrder.table_id) {
        await updateTABLE_STATUS(
          userId,
          offlineOrder.table_id,
          "Occupied",
          offlineOrder.id,
        );
      }
      return offlineOrder;
    }
  }
};

export const updateOrderStatus = async (userId, orderId, status) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: status })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    if (status === "Cancelled") {
      const orders = await getOrders(userId);
      const currentOrder = orders.find((o) => o.id === orderId);
      if (currentOrder && currentOrder.table_id) {
        await updateTABLE_STATUS(
          userId,
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


