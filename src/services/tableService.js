import { supabase } from "../lib/supabaseClients";
import { TABLE_STATUS } from "../app/utils/constant";


/**
 * Fetch all active dining tables from Supabase dining_tables.
 */
export const getTables = async (org_id, options = {}) => {
  let user_role, user_id, fetchAll;

  if (typeof options === "object" && options !== null) {
    user_role = options.user_role;
    user_id = options.user_id;
    fetchAll = options.fetchAll;
  } else if (arguments.length > 1) {
    user_role = arguments[1];
    user_id = arguments[2];
  }

  try {
    let query = supabase
      .from("dining_tables")
      .select("*")
      .eq("is_active", true);

    if (user_role === "admin" && !fetchAll) {
      if (user_id) {
        query = query.eq("branch_permission", user_id);
      }
    } else {
      if (org_id) {
        query = query.eq("org_id", org_id);
      }
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
export const addTable = async (org_id, tableData, options = {}) => {
  let targetOrgId = org_id;
  let targetData = tableData;
  let user_role, user_id;

  if (typeof org_id === "object" && !tableData) {
    targetData = org_id;
    targetOrgId = targetData?.org_id || null;
    user_role = options?.user_role;
    user_id = options?.user_id;
  } else if (typeof options === "object" && options !== null) {
    user_role = options.user_role;
    user_id = options.user_id;
  } else if (arguments.length > 2) {
    user_role = arguments[2];
    user_id = arguments[3];
  }

  const dbPayload = {
    ...targetData,
    org_id: targetOrgId || null,
    created_by: targetOrgId || null,
  };

  if (user_role === "admin" && user_id && !dbPayload.branch_permission) {
    dbPayload.branch_permission = user_id;
  }

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
export const updateTABLE_STATUS = async (tableIdInput, status, currentOrderId = null) => {
  if (!tableIdInput) return null;

  let tableId = tableIdInput;
  if (typeof tableIdInput === "object" && tableIdInput !== null) {
    tableId = tableIdInput.id || tableIdInput.table_id || tableIdInput.table_number;
  }
  if (!tableId) return null;

  const dbStatus = status ? String(status).toLowerCase() : TABLE_STATUS.available;

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

    // Try updating by table primary ID first
    let { data, error } = await supabase
      .from("dining_tables")
      .update(updates)
      .eq("id", tableId)
      .select();

    // Fallback: If no row updated by ID, try updating by table_number
    if ((!data || data.length === 0) && !error) {
      const res = await supabase
        .from("dining_tables")
        .update(updates)
        .eq("table_number", String(tableId))
        .select();
      data = res.data;
      error = res.error;
    }

    if (error) throw error;
    if (data && data.length > 0) return data[0];
    return null;
  } catch (err) {
    console.error("Error updating table status in Supabase:", err);
    throw err;
  }
};

/**
 * Update full properties of a dining table (Full CRUD - Update).
 */
export const updateTable = async (arg1, arg2, arg3) => {
  let tableId, tableData, org_id;

  if (arg3 !== undefined) {
    org_id = arg1;
    tableId = arg2;
    tableData = arg3;
  } else {
    tableId = arg1;
    tableData = arg2;
    org_id = null;
  }

  if (!tableId) {
    throw new Error("Table ID is required for table update");
  }

  const dbPayload = {
    ...tableData,
  };
  if (org_id && !dbPayload.updated_by) {
    dbPayload.updated_by = org_id;
  }

  try {
    let { data, error } = await supabase
      .from("dining_tables")
      .update(dbPayload)
      .eq("id", tableId)
      .select();

    if (error) throw error;
    if (data && data.length > 0) return data[0];

    // Only attempt table_number fallback if tableId is NOT a UUID format string
    const isUuid =
      typeof tableId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tableId);

    if (!isUuid) {
      const res = await supabase
        .from("dining_tables")
        .update(dbPayload)
        .eq("table_number", String(tableId))
        .select();

      if (res.error) throw res.error;
      if (res.data && res.data.length > 0) return res.data[0];
    }

    // Return fallback updated table object if select returned no rows
    return { id: tableId, ...dbPayload };
  } catch (err) {
    console.warn("Table update notice:", err?.message || err);
    return { id: tableId, ...dbPayload };
  }
};

/**
 * Delete a dining table (Full CRUD - Delete).
 */
export const deleteTable = async (arg1, arg2) => {
  let tableId;

  if (arg2 !== undefined) {
    tableId = arg2;
  } else {
    tableId = arg1;
  }

  if (!tableId) {
    throw new Error("Table ID is required for table deletion");
  }

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
export const clearAllTables = async (org_id, options = {}, roleArg) => {
  let user_role, user_id;

  if (typeof options === "object" && options !== null) {
    user_role = options.user_role;
    user_id = options.user_id;
  } else {
    user_id = options;
    user_role = roleArg;
  }

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

    if (user_role === "admin") {
      if (user_id) {
        query = query.eq("branch_permission", user_id);
      }
    } else {
      if (org_id) {
        query = query.eq("org_id", org_id);
      }
    }

    const { data, error } = await query.select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error clearing all tables in Supabase:", err);
    throw err;
  }
};

