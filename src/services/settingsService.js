export const getSettings = async (org_id) => {
  const key = `r_settings_${org_id}`;
  const local = localStorage.getItem(key);
  if (local) return JSON.parse(local);

  const defaultSettings = {
    user_id: org_id,
    restaurant_name: "Delight Cafe",
    address: "204, Foodie Boulevard, Connaught Place, New Delhi",
    tax_rate: 5.00,
    currency: "Rs."
  };
  localStorage.setItem(key, JSON.stringify(defaultSettings));
  return defaultSettings;
};

export const saveSettings = async (org_id, settingsData) => {
  const key = `r_settings_${org_id}`;
  const current = JSON.parse(localStorage.getItem(key) || "{}");
  const updated = { ...current, ...settingsData, updated_at: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
};
