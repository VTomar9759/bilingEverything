import { useState, useEffect, useCallback } from "react";
import useOrgData from "./useOrgData";
import {
  getAdmins,
  createAdmin as createAdminService,
  updateAdmin as updateAdminService,
  deleteAdmin as deleteAdminService,
} from "../../services";

const useAdmins = () => {
  const { org_id: effectiveOrgId, userData } = useOrgData();

  // Derive created_by / currentUserId
  const currentUserId = userData?.id || effectiveOrgId;

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    if (!effectiveOrgId) return;
    setLoading(true);
    try {
      const data = await getAdmins(effectiveOrgId);
      setAdmins(data || []);
    } catch (err) {
      console.error("useAdmins fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId]);

  useEffect(() => {
    if (effectiveOrgId) {
      fetchAdmins();
    }
  }, [effectiveOrgId, fetchAdmins]);

  const addAdmin = async (adminData) => {
    if (!effectiveOrgId) {
      throw new Error("Organization ID is missing.");
    }
    setSaving(true);
    try {
      const newAdmin = await createAdminService(
        effectiveOrgId,
        currentUserId,
        adminData
      );
      if (newAdmin) {
        setAdmins((prev) => [newAdmin, ...prev]);
      }
      return newAdmin;
    } catch (err) {
      console.error("useAdmins addAdmin error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateAdmin = async (id, updates) => {
    if (!effectiveOrgId) return;
    setSaving(true);
    try {
      const updated = await updateAdminService(effectiveOrgId, id, updates);
      if (updated) {
        setAdmins((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
      }
      return updated;
    } catch (err) {
      console.error("useAdmins updateAdmin error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (idOrAdmin) => {
    if (!effectiveOrgId) return;
    const targetId = typeof idOrAdmin === "object" ? idOrAdmin.id : idOrAdmin;
    setSaving(true);
    try {
      await deleteAdminService(effectiveOrgId, idOrAdmin);
      setAdmins((prev) => prev.filter((item) => item.id !== targetId));
      return true;
    } catch (err) {
      console.error("useAdmins deleteAdmin error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    admins,
    loading,
    saving,
    orgId: effectiveOrgId,
    createdBy: currentUserId,
    refetch: fetchAdmins,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  };
};

export default useAdmins;
