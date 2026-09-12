import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getInventory, adjustStock, addInventoryItem, deleteInventoryItem } from "../../services";

const useInventory = () => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getInventory(userId);
      setInventory(data || []);
    } catch (err) {
      console.error("useInventory error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustStock = async (invId, amount) => {
    if (!userId) return;
    try {
      const updated = await adjustStock(userId, invId, amount);
      setInventory((prev) => prev.map((inv) => (inv.id === invId ? updated : inv)));
      return updated;
    } catch (err) {
      console.error("useInventory error adjusting stock:", err);
      throw err;
    }
  };

  const handleAddItem = async (itemData) => {
    if (!userId) return;
    try {
      const created = await addInventoryItem(userId, itemData);
      setInventory((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("useInventory error adding inventory item:", err);
      throw err;
    }
  };

  const handleDeleteItem = async (invId) => {
    if (!userId) return;
    try {
      await deleteInventoryItem(userId, invId);
      setInventory((prev) => prev.filter((inv) => inv.id !== invId));
    } catch (err) {
      console.error("useInventory error deleting inventory item:", err);
      throw err;
    }
  };

  return {
    inventory,
    loading,
    refetch: fetchInventory,
    adjustStock: handleAdjustStock,
    addInventoryItem: handleAddItem,
    deleteInventoryItem: handleDeleteItem,
  };
};

export default useInventory;
