import { supabase } from "../lib/supabaseClients";

/**
 * Fetch all items belonging to a user
 */
export const getItems = async (org_id) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("org_id", org_id);

  if (error) {
    console.error("Error fetching items:", error.message);
    throw error;
  }
  return data || [];
};



/**
 * Fetch a single item by its ID
 */
export const getItemById = async (id) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching item with id ${id}:`, error.message);
    throw error;
  }
  return data;
};

/**
 * Add a new item to the catalog
 */
export const addItem = async (org_id, itemData) => {
  const payload = {
    org_id: org_id,
    created_by: org_id,
    ...itemData,
  };

  const { data, error } = await supabase
    .from("items")
    .insert([payload])
    .select();

  if (error) {
    console.error("Error adding item:", error.message);
    throw error;
  }
  return data?.[0] || null;
};

/**
 * Update an existing item in the catalog
 */
export const updateItem = async (org_id, id, updates) => {
  const payload = {
    org_id: org_id,
    created_by: org_id,
    ...updates,
  };

  const { data, error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) {
    console.error(`Error updating item with id ${id}:`, error.message);
    throw error;
  }
  return data?.[0] || null;
};
export const updateItemStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) {
    console.error(`Error updating item status with id ${id}:`, error.message);
    throw error;
  }

  return data?.[0] || null;
};
/**
 * Delete an item from the catalog
 */
export const deleteItem = async (org_id, id) => {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting item with id ${id}:`, error.message);
    throw error;
  }
  return true;
};
