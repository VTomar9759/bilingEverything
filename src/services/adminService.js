import { supabase } from "../lib/supabaseClients";

/**
 * Fetch all admins belonging to an organization
 * @param {string} orgId
 */
export const getAdmins = async (orgId) => {
  if (!orgId) return [];
  try {
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admins:", error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error("getAdmins error:", err);
    throw err;
  }
};

/**
 * Create a new Admin user
 * @param {string} orgId - Organization UUID
 * @param {string} createdBy - User UUID creating this admin
 * @param {object} adminData - { name, email, password, permissions }
 */
export const createAdmin = async (orgId, createdBy, adminData) => {
  const { name, email, password, permissions, permission } = adminData || {};

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  // 1. Optionally sign up in Supabase Auth (or proceed if auth user already exists / sign up fails on existing user)
  let authUserId = null;
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          org_id: orgId,
          role: "admin",
        },
      },
    });

    if (authError && !authError.message?.includes("User already registered")) {
      console.warn("Supabase Auth signUp note:", authError.message);
    }
    if (authData?.user?.id) {
      authUserId = authData.user.id;
    }
  } catch (authErr) {
    console.warn("Auth signup error (continuing DB insert):", authErr);
  }

  // 2. Insert into public.admin table
  const payload = {
    name,
    email,
    org_id: orgId,
    created_by: createdBy || orgId,
    permissions: permissions || permission || {},
  };

  const { data, error } = await supabase
    .from("admin")
    .insert([payload])
    .select();

  if (error) {
    console.error("Error creating admin record:", error.message);
    throw error;
  }

  return data?.[0] || null;
};

/**
 * Update an existing admin record
 * @param {string} orgId
 * @param {string} id - Admin UUID
 * @param {object} updates
 */
export const updateAdmin = async (orgId, id, updates) => {
  const { permission, ...restUpdates } = updates || {};
  const payload = {
    updated_at: new Date().toISOString(),
    ...restUpdates,
  };
  if (permission && !payload.permissions) {
    payload.permissions = permission;
  }

  const { data, error } = await supabase
    .from("admin")
    .update(payload)
    .eq("id", id)
    .eq("org_id", orgId)
    .select();

  if (error) {
    console.error(`Error updating admin ${id}:`, error.message);
    throw error;
  }
  return data?.[0] || null;
};

/**
 * Delete an admin by ID
 * @param {string} orgId
 * @param {string} id
 */
export const deleteAdmin = async (orgId, id) => {
  const { error } = await supabase
    .from("admin")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    console.error(`Error deleting admin ${id}:`, error.message);
    throw error;
  }
  return true;
};
