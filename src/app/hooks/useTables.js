import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getTables, addTable, updateTABLE_STATUS, updateTable, deleteTable, clearAllTables } from "../../services";


const useTables = () => {
  const { org_id } = useSelector((state) => state?.authSlice || {});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!org_id) return;
    setLoading(true);
    try {
      const data = await getTables(org_id);
      setTables(data || []);
    } catch (err) {
      console.error("useTables error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [org_id]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAddTable = async (tableData) => {
    if (!org_id) return;
    try {
      const newTable = await addTable(org_id, tableData);
      setTables((prev) => [...prev, newTable]);
      return newTable;
    } catch (err) {
      console.error("useTables error adding:", err);
      throw err;
    }
  };

  const handleUpdateTABLE_STATUS = async (tableId, status, orderId = null) => {
    try {
      const updated = await updateTABLE_STATUS(tableId, status, orderId);
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("useTables error updating status:", err);
      throw err;
    }
  };

  const handleUpdateTable = async (tableId, tableData) => {
    try {
      const updated = await updateTable(tableId, tableData);
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("useTables error updating table:", err);
      throw err;
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err) {
      console.error("useTables error deleting:", err);
      throw err;
    }
  };

  const handleClearAllTables = async () => {
    if (!org_id) return;
    try {
      const updated = await clearAllTables(org_id);
      setTables(updated || []);
      return updated;
    } catch (err) {
      console.error("useTables error clearing tables:", err);
      throw err;
    }
  };

  return {
    tables,
    loading,
    refetch: fetchTables,
    addTable: handleAddTable,
    updateTABLE_STATUS: handleUpdateTABLE_STATUS,
    updateTable: handleUpdateTable,
    deleteTable: handleDeleteTable,
    clearAllTables: handleClearAllTables,
  };
};

export default useTables;

