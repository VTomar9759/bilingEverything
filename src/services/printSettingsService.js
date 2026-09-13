import { supabase } from "../lib/supabaseClients";

export const DEFAULT_PRINT_SETTINGS = {
  print_size: "A4",
  copy_print: true,
  number_of_copies: 1,
  logo_visible: true,
  logo_size: 80,
  business_name_visible: true,
  address_visible: true,
  phone_visible: true,
  email_visible: false,
  gst_number_visible: true,
  gst_breakup_visible: true,
  invoice_number_visible: true,
  invoice_date_visible: true,
  order_number_visible: true,
  table_name_visible: true,
  customer_name_visible: true,
  customer_phone_visible: false,
  customer_address_visible: false,
  item_code_visible: false,
  item_description_visible: false,
  item_quantity_visible: true,
  item_rate_visible: true,
  item_discount_visible: true,
  subtotal_visible: true,
  discount_visible: true,
  tax_visible: true,
  service_charge_visible: false,
  grand_total_visible: true,
  payment_method_visible: true,
  payment_status_visible: false,
  footer_visible: true,
  footer_text: "Thank you for dining with us! Please visit again.",
  qr_code_visible: false,
  barcode_visible: false,
  printer_name: "",
  auto_print: false,
  is_active: true,
};

/**
 * Fetch print settings for an organization
 * @param {string} orgId
 */
export const getPrintSettings = async (orgId) => {
  if (!orgId) return null;
  try {
    const { data, error } = await supabase
      .from("print_settings")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching print settings:", error.message);
      throw error;
    }

    if (!data) {
      return { ...DEFAULT_PRINT_SETTINGS, org_id: orgId };
    }

    return data;
  } catch (err) {
    console.error("getPrintSettings error:", err);
    throw err;
  }
};

/**
 * Save or update print settings for an organization (Upsert)
 * @param {string} orgId
 * @param {object} settingsData
 * @param {string} [createdBy]
 */
export const savePrintSettings = async (orgId, settingsData, createdBy) => {
  if (!orgId) throw new Error("Organization ID is required.");

  try {
    const payload = {
      ...settingsData,
      org_id: orgId,
      updated_at: new Date().toISOString(),
    };

    if (createdBy) {
      payload.created_by = createdBy;
    }

    // Sanitize constraints
    if (payload.logo_size !== undefined) {
      payload.logo_size = Math.min(300, Math.max(20, Number(payload.logo_size) || 80));
    }
    if (payload.number_of_copies !== undefined) {
      payload.number_of_copies = Math.min(5, Math.max(1, Number(payload.number_of_copies) || 1));
    }

    const { data, error } = await supabase
      .from("print_settings")
      .upsert(payload, { onConflict: "org_id" })
      .select()
      .single();

    if (error) {
      console.error("Error saving print settings:", error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("savePrintSettings error:", err);
    throw err;
  }
};
