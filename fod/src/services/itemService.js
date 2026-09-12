import { supabase } from "../lib/supabaseClients";

/**
 * Fetch all items belonging to a user
 */
export const getItems = async (userId) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId);

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
export const addItem = async (userId, itemData) => {
  const payload = {
    user_id: userId,
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
export const updateItem = async (userId, id, updates) => {
  const payload = {
    user_id: userId,
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

/**
 * Delete an item from the catalog
 */
export const deleteItem = async (userId, id) => {
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
