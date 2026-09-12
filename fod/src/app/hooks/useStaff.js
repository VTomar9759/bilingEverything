import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getStaff, addStaff, updateStaff, deleteStaff } from "../../services";

const useStaff = () => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getStaff(userId);
      setStaff(data || []);
    } catch (err) {
      console.error("useStaff error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = async (staffMember) => {
    if (!userId) return;
    try {
      const created = await addStaff(userId, staffMember);
      setStaff((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("useStaff error adding staff:", err);
      throw err;
    }
  };

  const handleUpdateStaff = async (id, updates) => {
    if (!userId) return;
    try {
      const updated = await updateStaff(userId, id, updates);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      console.error("useStaff error updating staff:", err);
      throw err;
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!userId) return;
    try {
      await deleteStaff(userId, id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("useStaff error deleting staff:", err);
      throw err;
    }
  };

  return {
    staff,
    loading,
    refetch: fetchStaff,
    addStaff: handleAddStaff,
    updateStaff: handleUpdateStaff,
    deleteStaff: handleDeleteStaff,
  };
};

export default useStaff;
