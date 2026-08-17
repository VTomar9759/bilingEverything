import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClients";

/**
 * A highly reusable and generic React hook to perform CRUD operations
 * on any Supabase table with automatic tenant (user_id) filtering.
 * 
 * @param {string} tableName - The name of the Supabase table
 * @param {object} options - Options such as defaultSortCol, ascending, and extraFilters
 */
const useSupabaseTable = (tableName, options = {}) => {
  const { defaultSortCol = "id", ascending = true, extraFilters = null } = options;
  const { userId } = useSelector((state) => state?.authSlice || {});
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!userId || !tableName) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(tableName).select("*");
      
      // Auto-partition by tenant user_id
      query = query.eq("user_id", userId);
      
      // Apply extra filter rules if provided (e.g. status, active)
      if (extraFilters && typeof extraFilters === "object") {
        Object.entries(extraFilters).forEach(([col, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            query = query.eq(col, val);
          }
        });
      }

      // Apply default sorting
      if (defaultSortCol) {
        query = query.order(defaultSortCol, { ascending });
      }

      const { data: result, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setData(result || []);
    } catch (err) {
      console.error(`useSupabaseTable select error on '${tableName}':`, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, tableName, defaultSortCol, ascending, extraFilters]);

  // Trigger load on userId or dependency changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create a record
  const addRow = async (rowPayload) => {
    if (!userId) throw new Error("Unauthenticated user");
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        ...rowPayload
      };
      const { data: newRow, error: addErr } = await supabase
        .from(tableName)
        .insert([payload])
        .select();

      if (addErr) throw addErr;
      
      const addedRecord = newRow?.[0] || payload;
      setData((prev) => [...prev, addedRecord]);
      return addedRecord;
    } catch (err) {
      console.error(`useSupabaseTable insert error on '${tableName}':`, err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a record
  const updateRow = async (rowId, updates) => {
    if (!userId) throw new Error("Unauthenticated user");
    setLoading(true);
    try {
      const { data: updatedRows, error: updateErr } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", rowId)
        .eq("user_id", userId)
        .select();

      if (updateErr) throw updateErr;

      const updatedRecord = updatedRows?.[0] || { id: rowId, ...updates };
      setData((prev) => prev.map((item) => (item.id === rowId ? { ...item, ...updatedRecord } : item)));
      return updatedRecord;
    } catch (err) {
      console.error(`useSupabaseTable update error on '${tableName}':`, err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a record
  const deleteRow = async (rowId) => {
    if (!userId) throw new Error("Unauthenticated user");
    setLoading(true);
    try {
      const { error: deleteErr } = await supabase
        .from(tableName)
        .delete()
        .eq("id", rowId)
        .eq("user_id", userId);

      if (deleteErr) throw deleteErr;

      setData((prev) => prev.filter((item) => item.id !== rowId));
      return true;
    } catch (err) {
      console.error(`useSupabaseTable delete error on '${tableName}':`, err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    addRow,
    updateRow,
    deleteRow
  };
};

export default useSupabaseTable;
