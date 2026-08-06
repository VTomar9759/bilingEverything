import { supabase } from "../lib/supabaseClients";
import { TABLE_STATUS } from "../app/utils/constant";


/**
 * Fetch all active dining tables from Supabase dining_tables.
 */
export const getTables = async (org_id) => {
  try {
    let query = supabase
      .from("dining_tables")
      .select("*")
      .eq("is_active", true);

    if (org_id) {
      query = query.eq("org_id", org_id);
    }

    const { data, error } = await query.order("table_number", { ascending: true });

    if (error) throw error;
    if (data) return data;
    return [];
  } catch (err) {
    console.error("Error fetching tables from Supabase:", err);
    throw err;
  }
};

/**
 * Create/Add a new dining table.
 */
export const addTable = async (org_id, tableData) => {
  const dbPayload = {
    ...tableData,
    org_id: org_id || null,
  };
  try {
    const { data, error } = await supabase
      .from("dining_tables")
      .insert([dbPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error("Error adding table in Supabase:", err);
    throw err;
  }
};

/**
 * Update the status of a dining table (e.g. available, occupied, reserved, billed, cleaning).
 */
export const updateTABLE_STATUS = async (tableId, status, currentOrderId = null) => {
  const dbStatus = status.toLowerCase();

  try {
    const updates = {
      status: dbStatus,
      current_order_id: currentOrderId,
    };

    // Auto-release resets bill
    if (dbStatus === TABLE_STATUS.available) {
      updates.current_bill_amount = 0;
      updates.is_reserved = false;
      updates.reserved_by = "";
      updates.reservation_time = null;
    }

    const { data, error } = await supabase
      .from("dining_tables")
      .update(updates)
      .eq("id", tableId)
      .select();

    if (error) throw error;
    if (data && data.length > 0) return data[0];
    throw new Error("Table not found for status update");
  } catch (err) {
    console.error("Error updating table status in Supabase:", err);
    throw err;
  }
};

/**
 * Update full properties of a dining table (Full CRUD - Update).
 */
export const updateTable = async (org_id, tableId, tableData) => {
  const dbPayload = {
    ...tableData,
    updated_by: org_id || null
  };

  try {
    const { data, error } = await supabase
      .from("dining_tables")
      .update(dbPayload)
      .eq("id", tableId)
      .select();

    if (error) throw error;
    if (data && data.length > 0) return data[0];
    throw new Error("Table not found for update");
  } catch (err) {
    console.error("Error updating table properties in Supabase:", err);
    throw err;
  }
};

/**
 * Delete a dining table (Full CRUD - Delete).
 */
export const deleteTable = async (org_id, tableId) => {
  try {
    const { error } = await supabase
      .from("dining_tables")
      .delete()
      .eq("id", tableId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting table from Supabase:", err);
    throw err;
  }
};

/**
 * Reset all active dining tables to status "available".
 */
export const clearAllTables = async (org_id) => {
  try {
    const updates = {
      status: TABLE_STATUS.available,
      current_order_id: null,
      current_bill_amount: 0,
      is_reserved: false,
      reserved_by: "",
      reservation_time: null,
    };

    let query = supabase
      .from("dining_tables")
      .update(updates)
      .eq("is_active", true);

    if (org_id) {
      query = query.eq("org_id", org_id);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error clearing all tables in Supabase:", err);
    throw err;
  }
};

