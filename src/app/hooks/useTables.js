import { useState, useEffect, useCallback } from "react";
import useOrgData from "./useOrgData";
import { getTables, addTable, updateTABLE_STATUS, updateTable, deleteTable, clearAllTables } from "../../services";


const useTables = (hookOptions = {}) => {
  const { org_id, user_role, user_id } = useOrgData();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = hookOptions?.fetchAll ?? false;

  const fetchTables = useCallback(async () => {
    if (user_role === "admin" && !fetchAll) {
      if (!user_id) return;
    } else {
      if (!org_id) return;
    }

    setLoading(true);
    try {
      const data = await getTables(org_id, { user_role, user_id, fetchAll });
      setTables(data || []);
    } catch (err) {
      console.error("useTables error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [org_id, user_role, user_id, fetchAll]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAddTable = async (tableData) => {
    if (user_role !== "admin" && !org_id) return;
    try {
      const newTable = await addTable(org_id, tableData, { user_role, user_id });
      if (newTable) {
        setTables((prev) => [...prev, newTable]);
      }
      return newTable;
    } catch (err) {
      console.error("useTables error adding:", err);
      throw err;
    }
  };

  const handleUpdateTABLE_STATUS = async (tableId, status, orderId = null) => {
    try {
      const updated = await updateTABLE_STATUS(tableId, status, orderId);
      if (updated) {
        setTables((prev) => prev.map((t) => (t.id === tableId || String(t.table_number) === String(tableId) ? updated : t)));
      }
      return updated;
    } catch (err) {
      console.error("useTables error updating status:", err);
      throw err;
    }
  };

  const handleUpdateTable = async (tableId, tableData) => {
    try {
      const updated = await updateTable(org_id, tableId, tableData);
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId || String(t.table_number) === String(tableId)
            ? { ...t, ...(updated || tableData) }
            : t
        )
      );
      return updated || { id: tableId, ...tableData };
    } catch (err) {
      console.warn("useTables handleUpdateTable error:", err);
      const fallback = { id: tableId, ...tableData };
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId || String(t.table_number) === String(tableId)
            ? { ...t, ...tableData }
            : t
        )
      );
      return fallback;
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId && String(t.table_number) !== String(tableId)));
    } catch (err) {
      console.error("useTables error deleting:", err);
      throw err;
    }
  };

  const handleClearAllTables = async () => {
    if (user_role !== "admin" && !org_id) return;
    try {
      const updated = await clearAllTables(org_id, { user_role, user_id });
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

