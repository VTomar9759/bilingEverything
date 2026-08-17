import { supabase } from "../lib/supabaseClients";
import { updateTABLE_STATUS } from "./tableService";

const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;

export const getOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data;
    throw new Error("No orders found in Supabase");
  } catch (err) {
    const key = `r_orders_${userId}`;
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);
    return defaultOrders;
  }
};

export const saveOrdersLocal = (userId, orders) => {
  localStorage.setItem(`r_orders_${userId}`, JSON.stringify(orders));
};

export const createOrder = async (userId, orderData) => {
  const newOrder = {
    id: generateId(),
    user_id: userId,
    created_at: new Date().toISOString(),
    status: "Pending",
    payment_status: "Unpaid",
    ...orderData
  };

  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .insert([newOrder])
      .select();
    
    if (error) throw error;
    if (newOrder.table_id) {
      await updateTABLE_STATUS(userId, newOrder.table_id, "Occupied", newOrder.id);
    }
    return data[0];
  } catch (err) {
    const orders = await getOrders(userId);
    const updatedOrders = [newOrder, ...orders];
    saveOrdersLocal(userId, updatedOrders);

    if (newOrder.table_id) {
      await updateTABLE_STATUS(userId, newOrder.table_id, "Occupied", newOrder.id);
    }
    return newOrder;
  }
};

export const updateOrderStatus = async (userId, orderId, status) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .update({ status })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select();
    
    if (error) throw error;
    
    if (status === "Cancelled") {
      const orders = await getOrders(userId);
      const currentOrder = orders.find((o) => o.id === orderId);
      if (currentOrder && currentOrder.table_id) {
        await updateTABLE_STATUS(userId, currentOrder.table_id, "Available", null);
      }
    }
    return data[0];
  } catch (err) {
    const orders = await getOrders(userId);
    const currentOrder = orders.find((o) => o.id === orderId);
    
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status } : o
    );
    saveOrdersLocal(userId, updated);

    if (status === "Cancelled" && currentOrder && currentOrder.table_id) {
      await updateTABLE_STATUS(userId, currentOrder.table_id, "Available", null);
    }
    return updated.find((o) => o.id === orderId);
  }
};

export const settleOrder = async (userId, orderId, paymentMethod, financialDetails = {}) => {
  const updates = {
    payment_method: paymentMethod,
    payment_status: "Paid",
    status: "Served",
    ...financialDetails
  };

  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .update(updates)
      .eq("id", orderId)
      .eq("user_id", userId)
      .select();
    
    if (error) throw error;
    
    if (data && data.length > 0 && data[0].table_id) {
      await updateTABLE_STATUS(userId, data[0].table_id, "Available", null);
    }
    return data[0];
  } catch (err) {
    const orders = await getOrders(userId);
    const order = orders.find((o) => o.id === orderId);

    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, ...updates } : o
    );
    saveOrdersLocal(userId, updated);

    if (order && order.table_id) {
      await updateTABLE_STATUS(userId, order.table_id, "Available", null);
    }
    return updated.find((o) => o.id === orderId);
  }
};

export const deleteOrder = async (userId, orderId) => {
  try {
    const { error } = await supabase
      .from("restaurant_orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (err) {
    const orders = await getOrders(userId);
    const updated = orders.filter((o) => o.id !== orderId);
    saveOrdersLocal(userId, updated);
    return true;
  }
};
