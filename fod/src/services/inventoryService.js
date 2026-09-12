import { supabase } from "../lib/supabaseClients";

const generateId = () => `I-${Math.random().toString(36).substr(2, 9)}`;

export const getInventory = async (userId, catalogItems = []) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_inventory")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (data && data.length > 0) return data;
    throw new Error("No inventory found in Supabase");
  } catch (err) {
    const key = `r_inventory_${userId}`;
    const local = localStorage.getItem(key);
    let inventory = local ? JSON.parse(local) : [];

    // Auto-sync with current item catalog if catalogItems list is provided
    if (catalogItems.length > 0) {
      let isChanged = false;
      const synced = catalogItems.map((item) => {
        const existing = inventory.find((inv) => inv.item_id === item.id);
        if (existing) {
          if (existing.item_name !== item.name) {
            existing.item_name = item.name;
            isChanged = true;
          }
          return existing;
        } else {
          isChanged = true;
          return {
            id: generateId(),
            user_id: userId,
            item_id: item.id,
            item_name: item.name,
            stock: 80, // Default stock
            min_level: 15,
            unit: "pcs",
            updated_at: new Date().toISOString()
          };
        }
      });

      // Filter out inventory items that no longer exist in catalog
      const finalInventory = synced.filter((inv) =>
        catalogItems.some((cat) => cat.id === inv.item_id)
      );

      if (isChanged || finalInventory.length !== inventory.length) {
        inventory = finalInventory;
        localStorage.setItem(key, JSON.stringify(inventory));
      }
    }

    // Seed default if still empty
    if (inventory.length === 0) {
      inventory = [
        { id: "I1", user_id: userId, item_id: "item-11", item_name: "Margherita Pizza", stock: 45, min_level: 10, unit: "pcs", updated_at: new Date().toISOString() },
        { id: "I2", user_id: userId, item_id: "item-12", item_name: "Mint Mojito", stock: 12, min_level: 15, unit: "pcs", updated_at: new Date().toISOString() },
        { id: "I3", user_id: userId, item_id: "item-13", item_name: "Paneer Tikka Platter", stock: 55, min_level: 12, unit: "pcs", updated_at: new Date().toISOString() },
        { id: "I4", user_id: userId, item_id: "item-14", item_name: "Sizzler Special", stock: 8, min_level: 10, unit: "pcs", updated_at: new Date().toISOString() }
      ];
      localStorage.setItem(key, JSON.stringify(inventory));
    }

    return inventory;
  }
};

export const adjustStock = async (userId, invId, amount) => {
  try {
    const { data: current, error: getErr } = await supabase
      .from("restaurant_inventory")
      .select("stock")
      .eq("id", invId)
      .single();
    if (getErr) throw getErr;

    const newStock = Math.max(0, (current?.stock || 0) + amount);

    const { data, error } = await supabase
      .from("restaurant_inventory")
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq("id", invId)
      .eq("user_id", userId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (err) {
    const key = `r_inventory_${userId}`;
    const inventory = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = inventory.map((inv) =>
      inv.id === invId
        ? { ...inv, stock: Math.max(0, inv.stock + amount), updated_at: new Date().toISOString() }
        : inv
    );
    localStorage.setItem(key, JSON.stringify(updated));
    return updated.find((inv) => inv.id === invId);
  }
};

export const addInventoryItem = async (userId, data) => {
  const newItem = {
    id: generateId(),
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...data
  };

  try {
    const { data: res, error } = await supabase
      .from("restaurant_inventory")
      .insert([newItem])
      .select();

    if (error) throw error;
    return res?.[0] || newItem;
  } catch (err) {
    const key = `r_inventory_${userId}`;
    const inventory = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [...inventory, newItem];
    localStorage.setItem(key, JSON.stringify(updated));
    return newItem;
  }
};

export const deleteInventoryItem = async (userId, invId) => {
  try {
    const { error } = await supabase
      .from("restaurant_inventory")
      .delete()
      .eq("id", invId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (err) {
    const key = `r_inventory_${userId}`;
    const inventory = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = inventory.filter((inv) => inv.id !== invId);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  }
};
