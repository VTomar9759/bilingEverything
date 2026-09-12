import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getSettings, saveSettings } from "../../services";

const useSettings = () => {
  const { userId } = useSelector((state) => state?.authSlice || {});
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getSettings(userId);
      setSettings(data || {});
    } catch (err) {
      console.error("useSettings error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async (settingsData) => {
    if (!userId) return;
    setLoading(true);
    try {
      const updated = await saveSettings(userId, settingsData);
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error("useSettings error saving:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    refetch: fetchSettings,
    saveSettings: handleSaveSettings,
  };
};

export default useSettings;
