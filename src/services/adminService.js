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
  const { name, email, password, permissions, permission, role_type } = adminData || {};

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if admin with this email already exists in public.admin
  const { data: existingAdmin } = await supabase
    .from("admin")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingAdmin) {
    const err = new Error("User already registered");
    err.code = "user_already_exists";
    throw err;
  }

  // 2. Sign up in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: name,
        org_id: orgId,
        role: "admin",
      },
    },
  });

  if (authError) {
    if (
      authError.code === "user_already_exists" ||
      authError.message?.toLowerCase().includes("user already registered") ||
      authError.message?.toLowerCase().includes("already registered")
    ) {
      const err = new Error("User already registered");
      err.code = "user_already_exists";
      throw err;
    }
    throw authError;
  }

  // 3. Insert into public.admin table
  const payload = {
    name,
    email: cleanEmail,
    org_id: orgId,
    created_by: createdBy || orgId,
    permissions: permissions || permission || {},
    role_type: role_type || "admin",
  };

  const { data, error } = await supabase
    .from("admin")
    .insert([payload])
    .select();

  if (error) {
    if (error.code === "23505" || error.message?.toLowerCase().includes("unique")) {
      const err = new Error("User already registered");
      err.code = "user_already_exists";
      throw err;
    }
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
  // 1. Try calling the RPC function delete_admin_user (deletes from admin table and auth.users)
  const { error: rpcError } = await supabase.rpc("delete_admin_user", {
    p_admin_id: id,
    p_org_id: orgId,
  });

  if (!rpcError) {
    return true;
  }

  // 2. Fallback: Delete directly from public.admin table
  // (Postgres trigger on_admin_deleted_remove_auth_user will remove from auth.users)
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
