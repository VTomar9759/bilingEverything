import { supabase } from "../lib/supabaseClients";

const formatStartDate = (startDate) => {
  if (!startDate) return null;
  if (startDate.includes("T")) return startDate;
  const d = new Date(`${startDate}T00:00:00`);
  return isNaN(d.getTime()) ? `${startDate}T00:00:00` : d.toISOString();
};

const formatEndDate = (endDate) => {
  if (!endDate) return null;
  if (endDate.includes("T")) return endDate;
  const d = new Date(`${endDate}T23:59:59.999`);
  return isNaN(d.getTime()) ? `${endDate}T23:59:59.999` : d.toISOString();
};

/**
 * Fetch expenses for an organization with optional date & category filters
 */
export const getExpenses = async (org_id, params = {}) => {
  if (!org_id) return [];
  const { startDate, endDate, category } = params;

  try {
    let query = supabase
      .from("expenses")
      .select("*")
      .eq("org_id", org_id)
      .order("expense_date", { ascending: false });

    if (startDate) {
      query = query.gte("expense_date", formatStartDate(startDate));
    }
    if (endDate) {
      query = query.lte("expense_date", formatEndDate(endDate));
    }
    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Expenses table fetch warning (checking fallback):", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getExpenses error:", err);
    return [];
  }
};

/**
 * Add new expense
 */
export const addExpense = async (org_id, created_by, expenseData) => {
  const payload = {
    org_id,
    created_by: created_by || org_id,
    expense_date: expenseData.expense_date || new Date().toISOString(),
    category: expenseData.category || "Other",
    amount: Number(expenseData.amount || 0),
    payment_method: expenseData.payment_method || "Cash",
    description: expenseData.description || "",
    notes: expenseData.notes || "",
    receipt_url: expenseData.receipt_url || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert([payload])
    .select();

  if (error) {
    console.error("Error adding expense to Supabase:", error.message);
    throw error;
  }
  return data?.[0] || null;
};

/**
 * Update expense
 */
export const updateExpense = async (id, expenseData) => {
  const payload = {
    ...expenseData,
    amount: Number(expenseData.amount || 0),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating expense:", error.message);
    throw error;
  }
  return data?.[0] || null;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error.message);
    throw error;
  }
  return true;
};
