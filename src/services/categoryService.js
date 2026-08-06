import { supabase } from "../lib/supabaseClients";

/**
 * Fetch all categories belonging to an organization from categories table
 */
export const getCategories = async (orgId) => {
  try {
    // 1. Primary query using org_id (actual column in database schema)
    let { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });

    // 2. Fallback to user_id only if org_id query fails (e.g. legacy schema)
    if (error) {
      const res = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", orgId)
        .order("created_at", { ascending: true });

      if (res.error) throw res.error;
      data = res.data;
    }
    return data || [];
  } catch (err) {
    console.error("getCategories error:", err);
    throw err;
  }
};

/**
 * Add a new category for an organization
 */
export const addCategory = async (orgId, categoryData) => {
  const payload = {
    org_id: orgId,
    created_by: orgId,
    ...categoryData,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert([payload])
    .select();

  if (error) {
    // Retry with user_id if schema has user_id instead of org_id
    const { data: d2, error: e2 } = await supabase
      .from("categories")
      .insert([{ user_id: orgId, created_by: orgId, ...categoryData }])
      .select();

    if (e2) {
      console.error("Error adding category:", e2.message);
      throw e2;
    }
    return d2?.[0] || null;
  }
  return data?.[0] || null;
};

/**
 * Update an existing category
 */
export const updateCategory = async (orgId, id, updates) => {
  const payload = {
    created_by: orgId,
    ...updates,
  };

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) {
    console.error(`Error updating category with id ${id}:`, error.message);
    throw error;
  }
  return data?.[0] || null;
};

/**
 * Delete a category by ID
 */
export const deleteCategory = async (orgId, id) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting category with id ${id}:`, error.message);
    throw error;
  }
  return true;
};
