import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getTables, addTable, updateTABLE_STATUS, updateTable, deleteTable } from "../../services";


const useTables = () => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getTables(userId);
      setTables(data || []);
    } catch (err) {
      console.error("useTables error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAddTable = async (tableData) => {
    if (!userId) return;
    try {
      const newTable = await addTable(userId, tableData);
      setTables((prev) => [...prev, newTable]);
      return newTable;
    } catch (err) {
      console.error("useTables error adding:", err);
      throw err;
    }
  };

  const handleUpdateTABLE_STATUS = async (tableId, status, orderId = null) => {
    if (!userId) return;
    try {
      const updated = await updateTABLE_STATUS(userId, tableId, status, orderId);
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("useTables error updating status:", err);
      throw err;
    }
  };

  const handleUpdateTable = async (tableId, tableData) => {
    if (!userId) return;
    try {
      const updated = await updateTable(userId, tableId, tableData);
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("useTables error updating table:", err);
      throw err;
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!userId) return;
    try {
      await deleteTable(userId, tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err) {
      console.error("useTables error deleting:", err);
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
  };
};

export default useTables;

