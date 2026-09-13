import { supabase } from "../lib/supabaseClients";

/**
 * Fetch a single order by ID
 */
export const getOrderById = async (org_id, orderId) => {
  try {
    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("org_id", org_id)
      .single();

    if (error) {
      const res = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", org_id)
        .single();

      if (res.error) throw res.error;
      data = res.data;
    }

    return data;
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    throw err;
  }
};

/**
 * Update order items (add/remove/adjust quantities) and recalculate totals
 */
export const updateOrderItems = async (org_id, orderId, { items, subtotal, tax, total }) => {
  try {
    const payload = {
      items,
      subtotal,
      tax,
      total,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId)
      .eq("org_id", org_id)
      .select();

    if (error) {
      const res = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId)
        .eq("user_id", org_id)
        .select();

      if (res.error) throw res.error;
      data = res.data;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error updating order items:", err);
    throw err;
  }
};

/**
 * Update order status
 */
export const editOrderStatus = async (org_id, orderId, status) => {
  try {
    const payload = {
      status,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId)
      .eq("org_id", org_id)
      .select();

    if (error) {
      const res = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId)
        .eq("user_id", org_id)
        .select();

      if (res.error) throw res.error;
      data = res.data;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error updating order status:", err);
    throw err;
  }
};

/**
 * Update order discount and recalculate totals
 */
export const updateOrderDiscount = async (org_id, orderId, { discount, subtotal, tax, total }) => {
  try {
    const payload = {
      discount,
      subtotal,
      tax,
      total,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId)
      .eq("org_id", org_id)
      .select();

    if (error) {
      const res = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId)
        .eq("user_id", org_id)
        .select();

      if (res.error) throw res.error;
      data = res.data;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error updating order discount:", err);
    throw err;
  }
};

/**
 * Update order payment mode and payment status
 */
export const updateOrderPaymentMode = async (
  org_id,
  orderId,
  { payment_mode, payment_status, payment_method }
) => {
  try {
    const payload = {
      payment_mode,
      payment_status,
      payment_method: payment_method || payment_mode,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId)
      .eq("org_id", org_id)
      .select();

    if (error) {
      const res = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId)
        .eq("user_id", org_id)
        .select();

      if (res.error) throw res.error;
      data = res.data;
    }

    return data?.[0];
  } catch (err) {
    console.error("Error updating order payment mode:", err);
    throw err;
  }
};