import { supabase } from "../lib/supabaseClients";
import { getCategories, addCategory } from "./categoryService";
import { getItems } from "./itemService";

/**
 * Standard CSV Column Headers
 */
export const CSV_COLUMNS = [
  "name",
  "code",
  "category",
  "price",
  "title",
  "description",
  "image",
  "status",
  "gst_status",
];

/**
 * Generate and download a blank/sample CSV template for items
 */
export const downloadCSVTemplate = () => {
  const headers = CSV_COLUMNS.join(",");
  const sampleRow1 = [
    '"Wireless Headphones"',
    '"PRD-001"',
    '"Electronics"',
    '"1499.00"',
    '"Premium Audio"',
    '"High quality noise canceling headphones"',
    '""',
    '"active"',
    '"true"',
  ].join(",");

  const sampleRow2 = [
    '"Cotton T-Shirt"',
    '"PRD-002"',
    '"Apparel"',
    '"499.00"',
    '"Casual Wear"',
    '"100% pure cotton breathable t-shirt"',
    '""',
    '"active"',
    '"true"',
  ].join(",");

  const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
  triggerDownload(csvContent, "item_upload_template.csv");
};

/**
 * Fetch all items and categories for orgId, format as CSV, and trigger download
 */
export const downloadAllItemsCSV = async (orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required to export items.");
  }

  // Fetch items & categories
  const [items, categories] = await Promise.all([
    getItems(orgId),
    getCategories(orgId),
  ]);

  // Map category_id -> category_name
  const categoryMap = new Map();
  if (Array.isArray(categories)) {
    categories.forEach((cat) => {
      if (cat && cat.id) {
        categoryMap.set(String(cat.id), cat.name || "");
      }
    });
  }

  const rows = [CSV_COLUMNS.join(",")];

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const categoryName = item.category_id
        ? categoryMap.get(String(item.category_id)) || ""
        : "";
      const statusStr = item.status === false ? "deactivated" : "active";
      const gstStr = item.gst_status === false ? "false" : "true";

      const rowData = [
        escapeCSVField(item.name || ""),
        escapeCSVField(item.code || ""),
        escapeCSVField(categoryName),
        escapeCSVField(
          item.price !== null && item.price !== undefined ? item.price : ""
        ),
        escapeCSVField(item.title || ""),
        escapeCSVField(item.description || ""),
        escapeCSVField(item.image || ""),
        escapeCSVField(statusStr),
        escapeCSVField(gstStr),
      ];

      rows.push(rowData.join(","));
    });
  }

  const csvContent = rows.join("\n");
  const filename = `all_items_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvContent, filename);
};

/**
 * Parse CSV text into array of row objects
 */
export const parseCSVText = (csvText) => {
  if (!csvText) return [];

  // Strip UTF-8 BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return [];

  const lines = parseCSVLines(cleanText);
  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    // Skip empty lines
    if (values.length === 0 || (values.length === 1 && !values[0].trim())) {
      continue;
    }

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index].trim() : "";
    });
    rows.push(rowObj);
  }

  return rows;
};

/**
 * Handle CSV processing workflow:
 * 1. Category Handling FIRST (extract, deduplicate, check existing DB, create missing)
 * 2. Item Handling AFTER (match category ID, format items, bulk insert into DB)
 */
export const processBulkItemsCSV = async (orgId, csvText) => {
  if (!orgId) {
    throw new Error("Organization ID is required for bulk add.");
  }

  const rows = parseCSVText(csvText);
  if (!rows || rows.length === 0) {
    throw new Error("CSV file is empty or missing valid data rows.");
  }

  // Verify header presence
  const sampleRowKeys = Object.keys(rows[0]);
  if (!sampleRowKeys.includes("name") || !sampleRowKeys.includes("price")) {
    throw new Error(
      "CSV missing required column headers. 'name' and 'price' are required."
    );
  }

  // --- STEP 1: Category Handling FIRST ---
  // Extract all category names from CSV (ignoring empty/null)
  const rawCategories = rows
    .map((r) => r.category)
    .filter((cat) => cat && String(cat).trim().length > 0);

  // Remove duplicate category names (case-insensitive deduplication, keeping trimmed name)
  const uniqueCategoryMap = new Map(); // normalized -> original trimmed string
  rawCategories.forEach((catStr) => {
    const trimmed = String(catStr).trim();
    const normalized = trimmed.toLowerCase();
    if (!uniqueCategoryMap.has(normalized)) {
      uniqueCategoryMap.set(normalized, trimmed);
    }
  });

  // Check categories table for each category within the current org_id
  const existingCategories = await getCategories(orgId);
  const existingCatMap = new Map(); // normalized name -> category record

  if (Array.isArray(existingCategories)) {
    existingCategories.forEach((cat) => {
      if (cat && cat.name) {
        existingCatMap.set(String(cat.name).trim().toLowerCase(), cat);
      }
    });
  }

  let createdCategoriesCount = 0;

  // If category does not exist, insert it into categories table
  for (const [normalizedName, originalName] of uniqueCategoryMap.entries()) {
    if (!existingCatMap.has(normalizedName)) {
      try {
        const newCat = await addCategory(orgId, { name: originalName });
        if (newCat) {
          existingCatMap.set(normalizedName, newCat);
          createdCategoriesCount++;
        }
      } catch (catErr) {
        console.error(`Failed to create category '${originalName}':`, catErr);
      }
    }
  }

  // Re-fetch all categories to ensure accurate category ID lookup
  const refreshedCategories = await getCategories(orgId);
  const finalCategoryLookup = new Map();
  if (Array.isArray(refreshedCategories)) {
    refreshedCategories.forEach((cat) => {
      if (cat && cat.name && cat.id) {
        finalCategoryLookup.set(String(cat.name).trim().toLowerCase(), cat.id);
      }
    });
  }

  // --- STEP 2: Item/Product Handling AFTER ---
  const itemsToInsert = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Line number including header
    const name = row.name ? String(row.name).trim() : "";
    const rawPrice = row.price;

    if (!name) {
      errors.push(`Row ${rowNum}: Name is required.`);
      return;
    }

    if (rawPrice === "" || rawPrice === undefined || rawPrice === null) {
      errors.push(`Row ${rowNum}: Price is required for item '${name}'.`);
      return;
    }

    const priceNum = parseFloat(rawPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push(`Row ${rowNum}: Price must be 0 or greater for item '${name}'.`);
      return;
    }

    // Find category ID for item's category name
    const catName = row.category ? String(row.category).trim() : "";
    const categoryId = catName
      ? finalCategoryLookup.get(catName.toLowerCase()) || null
      : null;

    // Status parsing: active / deactivated / true / false
    const rawStatus = row.status ? String(row.status).trim().toLowerCase() : "active";
    const status = !(
      rawStatus === "deactivated" ||
      rawStatus === "false" ||
      rawStatus === "0" ||
      rawStatus === "inactive"
    );

    // GST Status parsing
    const rawGst = row.gst_status
      ? String(row.gst_status).trim().toLowerCase()
      : "true";
    const gstStatus = !(
      rawGst === "exempt" ||
      rawGst === "false" ||
      rawGst === "0" ||
      rawGst === "no"
    );

    itemsToInsert.push({
      org_id: orgId,
      created_by: orgId,
      name: name,
      code: row.code
        ? String(row.code).trim()
        : `PRD-${Date.now().toString().slice(-4)}${index}`,
      category_id: categoryId,
      price: String(priceNum),
      title: row.title ? String(row.title).trim() : null,
      description: row.description ? String(row.description).trim() : null,
      image: row.image ? String(row.image).trim() : null,
      status: status,
      gst_status: gstStatus,
    });
  });

  if (itemsToInsert.length === 0) {
    if (errors.length > 0) {
      throw new Error(`Failed to process rows:\n${errors.join("\n")}`);
    }
    throw new Error("No valid items found in CSV file.");
  }

  // Insert items in batches of 50
  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let i = 0; i < itemsToInsert.length; i += BATCH_SIZE) {
    const batch = itemsToInsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("items").insert(batch).select();
    if (error) {
      console.error("Supabase item bulk insert error:", error);
      throw new Error(`Error saving items to database: ${error.message}`);
    }
    insertedCount += data ? data.length : batch.length;
  }

  return {
    totalRows: rows.length,
    insertedCount,
    createdCategoriesCount,
    errors,
  };
};

/* --- Helpers --- */

function escapeCSVField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function triggerDownload(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVLines(text) {
  const lines = [];
  let curLine = [];
  let curVal = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          curVal += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        curVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        curLine.push(curVal);
        curVal = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        curLine.push(curVal);
        lines.push(curLine);
        curLine = [];
        curVal = "";
      } else if (char === "\n") {
        curLine.push(curVal);
        lines.push(curLine);
        curLine = [];
        curVal = "";
      } else {
        curVal += char;
      }
    }
  }

  if (curVal || curLine.length > 0) {
    curLine.push(curVal);
    lines.push(curLine);
  }

  return lines;
}
