import { supabase } from "../lib/supabaseClients";

const generateId = () => `S-${Math.random().toString(36).substr(2, 9)}`;

export const getStaff = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_staff")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data;
    throw new Error("No staff found in Supabase");
  } catch (err) {
    const key = `r_staff_${userId}`;
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);

    const defaultStaff = [
      { id: "S1", user_id: userId, name: "Kunal Sharma", role: "Chef", status: "Active", phone: "+91 98765 43210", email: "kunal@d.com", shift: "Morning" },
      { id: "S2", user_id: userId, name: "Amit Patel", role: "Waiter", status: "Active", phone: "+91 87654 32109", email: "amit@d.com", shift: "Evening" },
      { id: "S3", user_id: userId, name: "Pooja Roy", role: "Cashier", status: "Active", phone: "+91 76543 21098", email: "pooja@d.com", shift: "Morning" },
      { id: "S4", user_id: userId, name: "Vikram Malhotra", role: "Manager", status: "Active", phone: "+91 65432 10987", email: "vikram@d.com", shift: "Morning" },
      { id: "S5", user_id: userId, name: "Suresh Kumar", role: "Chef", status: "On Break", phone: "+91 54321 09876", email: "suresh@d.com", shift: "Evening" }
    ];
    localStorage.setItem(key, JSON.stringify(defaultStaff));
    return defaultStaff;
  }
};

export const saveStaffLocal = (userId, staff) => {
  localStorage.setItem(`r_staff_${userId}`, JSON.stringify(staff));
};

export const addStaff = async (userId, staffMember) => {
  const newStaff = {
    id: generateId(),
    user_id: userId,
    ...staffMember
  };

  try {
    const { data, error } = await supabase
      .from("restaurant_staff")
      .insert([newStaff])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (err) {
    const staff = await getStaff(userId);
    const updated = [...staff, newStaff];
    saveStaffLocal(userId, updated);
    return newStaff;
  }
};

export const updateStaff = async (userId, id, updates) => {
  try {
    const { data, error } = await supabase
      .from("restaurant_staff")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (err) {
    const staff = await getStaff(userId);
    const updated = staff.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveStaffLocal(userId, updated);
    return updated.find((s) => s.id === id);
  }
};

export const deleteStaff = async (userId, id) => {
  try {
    const { error } = await supabase
      .from("restaurant_staff")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    const staff = await getStaff(userId);
    const updated = staff.filter((s) => s.id !== id);
    saveStaffLocal(userId, updated);
    return true;
  }
};
