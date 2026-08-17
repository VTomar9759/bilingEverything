import { supabase } from "../lib/supabaseClients";

export const getSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (data) return data;
    throw new Error("No settings found in Supabase");
  } catch (err) {
    const key = `r_settings_${userId}`;
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);

    const defaultSettings = {
      user_id: userId,
      restaurant_name: "Delight Cafe",
      address: "204, Foodie Boulevard, Connaught Place, New Delhi",
      tax_rate: 18.00,
      service_charge_rate: 5.00,
      currency: "Rs."
    };
    localStorage.setItem(key, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
};

export const saveSettings = async (userId, settingsData) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_settings")
      .upsert({ user_id: userId, ...settingsData, updated_at: new Date().toISOString() })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (err) {
    const key = `r_settings_${userId}`;
    const current = JSON.parse(localStorage.getItem(key) || "{}");
    const updated = { ...current, ...settingsData };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }
};
