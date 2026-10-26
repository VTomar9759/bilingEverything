import { supabase } from "../lib/supabaseClients";

/**
 * Fetch all active subscription plans from the public.subscription_plan table
 * @returns {Promise<Array>} List of active subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching subscription plans:", error.message);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("getSubscriptionPlans service error:", err);
    throw err;
  }
};

/**
 * Fetch a single subscription plan by ID
 * @param {number|string} id - Plan ID
 * @returns {Promise<Object|null>} Plan object or null
 */
export const getSubscriptionPlanById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching subscription plan with id ${id}:`, error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("getSubscriptionPlanById service error:", err);
    throw err;
  }
};
