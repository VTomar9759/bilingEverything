import qz from "qz-tray";
import { message } from "antd";
import { PRINT_TYPE, PRINT_SIZE } from "../utils/constant";

/**
 * Connect to QZ Tray WebSocket if inactive
 */
export async function connectPrinter() {
  if (!qz.websocket.isActive()) {
    const connectPromise = qz.websocket.connect({ retries: 0, delay: 0 });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("QZ Tray connection timeout")), 1500)
    );
    await Promise.race([connectPromise, timeoutPromise]);
  }
}

/**
 * Print fallback via browser print dialog (iframe)
 */
export const printViaBrowser = (htmlContent, copies = 1) => {
  return new Promise((resolve) => {
    let iframe = document.getElementById("thermal-print-iframe");
    if (iframe) {
      iframe.remove();
    }
    iframe = document.createElement("iframe");
    iframe.id = "thermal-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    let finalContent = htmlContent;
    if (copies > 1) {
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        const bodyContent = bodyMatch[1];
        const duplicated = Array(copies)
          .fill(`<div style="page-break-after: always;">${bodyContent}</div>`)
          .join('');
        finalContent = htmlContent.replace(bodyMatch[0], `<body>${duplicated}</body>`);
      }
    }

    doc.write(finalContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        resolve({ success: true, method: "browser" });
      } catch (err) {
        console.error("Browser print failed:", err);
        resolve({ success: false, error: err });
      }
    }, 300);
  });
};

/**
 * Generate formatted HTML string for thermal receipt
 * Uses print settings (ps) visibility flags to control what is shown
 */
export const generateReceiptHTML = (order, settings = {}) => {
  if (!order) return "";

  const ps = settings?.printSettings || {};
  const printType = ps?.print_size || settings?.print_type || order?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || ps?.paper_width || printConfig.width;
  const currency = settings?.currency || "₹";
  const logoImage = settings?.logo_image || settings?.logo || settings?.logo_url || "";
  const logoSize = ps?.logo_size || 80;

  const restaurantName =
    settings?.restaurant_name ||
    settings?.business_name ||
    settings?.legal_name ||
    "Role Express";
  const address = settings?.address || "Address not set";
  const phone = settings?.phone || "";
  const email = settings?.email || "";
  const gstin = settings?.gstin || settings?.gst_number || "";
  const hasGst = Boolean(gstin && String(gstin).trim().length > 0);
  const footerNote = ps?.footer_text || settings?.invoice_footer || "Thank You For Dining With Us!";

  const orderNum = order.order_number ?? order.order_no ?? order.id ?? "";
  const invoicePrefix = settings?.invoice_prefix || "INV";
  const invoiceNumber = order.invoice_number || order.invoice_no || `${invoicePrefix}-${new Date().getFullYear()}-${String(orderNum).padStart(4, '0')}`;
  const tableCode = order.table_code || order.table_number || order.table_no || order.table_name || "";
  const customerName = order.customer_name || order.customer?.name || "";
  const customerPhone = order.customer_phone || order.customer?.phone || "";
  const customerAddress = order.customer_address || order.customer?.address || "";
  const dateStr =
    order.created_at && !isNaN(new Date(order.created_at).getTime())
      ? (() => {
          const d = new Date(order.created_at);
          return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        })()
      : (() => {
          const d = new Date();
          return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        })();

  // Item discount helpers
  const getItemDiscount = (item) => {
    if (item.discount && Number(item.discount) > 0) return Number(item.discount);
    if (item.item_discount && Number(item.item_discount) > 0) return Number(item.item_discount);
    return 0;
  };
  const getItemTotal = (item) => {
    const base = (item.price || 0) * (item.quantity || 0);
    return base - getItemDiscount(item);
  };

  // Build items HTML with visibility flags
  const showQty = ps?.item_quantity_visible !== false;
  const showRate = ps?.item_rate_visible !== false;
  const showDisc = ps?.item_discount_visible !== false;
  const showDesc = ps?.item_description_visible === true;

  const itemsHTML = (order.items || [])
    .map((item) => {
      const disc = getItemDiscount(item);
      const total = getItemTotal(item);

      return `
      <tr>
        <td style="text-align: left; vertical-align: top; padding: 4px 0; font-size: 11px; color: #000000; word-break: break-word;">
          ${item.name}${showDesc && item.description ? `<br/><span style="font-size: 9px; color: #666;">${item.description}</span>` : ''}
        </td>
        ${showQty ? `<td style="text-align: center; vertical-align: top; padding: 4px 0; font-size: 11px; color: #000000;">${item.quantity}</td>` : ''}
        ${showRate ? `<td style="text-align: right; vertical-align: top; padding: 4px 0; font-size: 11px; color: #000000;">${currency}${item.price}</td>` : ''}
        ${showDisc ? `<td style="text-align: right; vertical-align: top; padding: 4px 0; font-size: 11px; color: #000000;">${disc > 0 ? `${currency}${disc}` : '-'}</td>` : ''}
        <td style="text-align: right; vertical-align: top; padding: 4px 0; font-size: 11px; color: #000000;">${currency}${total}</td>
      </tr>
    `;
    })
    .join("");

  // Column count for table header
  let colCount = 2; // Item + Total always
  if (showQty) colCount++;
  if (showRate) colCount++;
  if (showDisc) colCount++;

  // Tax calculations
  const taxAmount = Number(order.tax || 0);
  const halfTax = (taxAmount / 2).toFixed(2);
  const showGstBreakup = ps?.gst_breakup_visible !== false && hasGst && taxAmount > 0;
  const showTaxLine = ps?.tax_visible !== false && !showGstBreakup && taxAmount > 0;

  // Build customer section
  let customerHTML = '';
  if ((ps?.customer_name_visible || ps?.customer_phone_visible || ps?.customer_address_visible) &&
      (customerName || customerPhone || customerAddress)) {
    customerHTML = `<div class="dotted-divider"></div><div class="receipt-meta">`;
    if (ps?.customer_name_visible && customerName) customerHTML += `<div><strong>Customer:</strong> ${customerName}</div>`;
    if (ps?.customer_phone_visible && customerPhone) customerHTML += `<div><strong>Contact:</strong> ${customerPhone}</div>`;
    if (ps?.customer_address_visible && customerAddress) customerHTML += `<div><strong>Address:</strong> ${customerAddress}</div>`;
    customerHTML += `</div>`;
  }

  const isA4 = paperWidth === "210mm" || printType === PRINT_TYPE.A4;
  const pageCss = isA4
    ? `@page { size: A4; margin: 10mm; }`
    : `@page { size: ${paperWidth} auto; margin: 0mm; }`;
  const baseFontSize = isA4 ? "14px" : "11px";
  const headerFontSize = isA4 ? "20px" : "15px";
  const subFontSize = isA4 ? "12px" : "10.5px";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt #${orderNum}</title>
        <style>
          ${pageCss}
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: ${baseFontSize};
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .receipt {
            width: ${paperWidth};
            max-width: 100%;
            margin: 0 auto;
            padding: 4mm 7mm 25mm 7mm;
            box-sizing: border-box;
            background: #ffffff;
          }
          .receipt-header {
            text-align: center !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 4px !important;
          }
          .receipt-header img {
            max-height: ${Math.min(logoSize, 120)}px !important;
            max-width: 140px !important;
            object-fit: contain !important;
            margin: 0 auto 6px auto !important;
            display: block !important;
          }
          .receipt-header h3 {
            font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
            font-size: ${headerFontSize} !important;
            font-weight: 800 !important;
            margin: 0 0 2px 0 !important;
            text-align: center !important;
            color: #000000 !important;
            text-transform: uppercase !important;
            width: 100% !important;
          }
          .receipt-header p {
            font-size: ${subFontSize} !important;
            margin: 1px 0 !important;
            text-align: center !important;
            color: #555555 !important;
            width: 100% !important;
          }
          .dotted-divider {
            border-top: 1.5px dashed #999999 !important;
            margin: 6px 0 !important;
            width: 100% !important;
            display: block !important;
          }
          .receipt-meta {
            font-size: ${baseFontSize} !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            color: #000000 !important;
            width: 100% !important;
          }
          .receipt-meta div strong {
            font-weight: 700 !important;
          }
          .items-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: ${baseFontSize} !important;
            table-layout: fixed !important;
            color: #000000 !important;
            margin: 4px 0 !important;
          }
          .items-table th {
            font-weight: 700 !important;
            font-size: ${baseFontSize} !important;
            padding-bottom: 4px !important;
            border-bottom: 1.5px dashed #999999 !important;
            color: #000000 !important;
          }
          .items-table td {
            font-size: ${baseFontSize} !important;
            color: #000000 !important;
          }
          .totals-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: ${baseFontSize} !important;
            color: #000000 !important;
            margin-top: 2px !important;
          }
          .totals-table td {
            padding: 2px 0 !important;
            color: #000000 !important;
          }
          .receipt-footer {
            text-align: center !important;
            font-size: ${baseFontSize} !important;
            color: #000000 !important;
            margin-top: 6px !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .receipt-footer p {
            margin: 2px 0 !important;
            text-align: center !important;
            width: 100% !important;
          }
          tr, .receipt-header, .receipt-meta, .totals-table, .receipt-footer, .dotted-divider {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="receipt-wrapper">
          <div id="receipt" class="receipt">
            <div class="receipt-header" style="text-align: center; width: 100%;">
              ${ps?.logo_visible !== false && logoImage ? `<img src="${logoImage}" alt="Logo" style="display: block; margin: 0 auto 6px auto; max-height: ${Math.min(logoSize, 120)}px; max-width: 140px;" />` : ""}
              ${ps?.business_name_visible !== false ? `<h3 style="text-align: center; width: 100%; margin: 0 0 2px 0;">${restaurantName}</h3>` : ""}
              ${ps?.address_visible !== false ? `<p style="text-align: center; width: 100%; margin: 1px 0;">${address}</p>` : ""}
              ${ps?.phone_visible !== false && phone ? `<p style="text-align: center; width: 100%; margin: 1px 0;">Phone: ${phone}</p>` : ""}
              ${ps?.email_visible !== false && email ? `<p style="text-align: center; width: 100%; margin: 1px 0;">Email: ${email}</p>` : ""}
              ${ps?.gst_number_visible !== false && hasGst && gstin ? `<p style="text-align: center; width: 100%; margin: 1px 0; font-weight: 700;">GSTIN: ${gstin}</p>` : ""}
            </div>

            <div class="dotted-divider"></div>

            <div class="receipt-meta">
              ${ps?.invoice_number_visible !== false ? `<div><strong>Invoice:</strong> ${invoiceNumber}</div>` : ""}
              ${ps?.order_number_visible !== false ? `<div><strong>Order:</strong> #${orderNum}</div>` : ""}
              <div><strong>Date:</strong> ${dateStr}</div>
              ${ps?.table_name_visible !== false && tableCode ? `<div><strong>Table:</strong> ${tableCode}</div>` : ""}
            </div>

            ${customerHTML}

            <div class="dotted-divider"></div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left; width: 40%;">Item</th>
                  ${showQty ? '<th style="text-align: center; width: 10%;">Qty</th>' : ''}
                  ${showRate ? '<th style="text-align: right; width: 18%;">Rate</th>' : ''}
                  ${showDisc ? '<th style="text-align: right; width: 14%;">Disc</th>' : ''}
                  <th style="text-align: right; width: 18%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="dotted-divider"></div>

            <table class="totals-table">
              ${ps?.subtotal_visible !== false ? `
              <tr>
                <td style="text-align: left;">Subtotal</td>
                <td style="text-align: right;">${currency}${Number(order.subtotal || 0).toFixed(2)}</td>
              </tr>` : ""}
              ${ps?.discount_visible !== false && order.discount > 0 ? `
              <tr>
                <td style="text-align: left;">Discount</td>
                <td style="text-align: right;">-${currency}${Number(order.discount || 0).toFixed(2)}</td>
              </tr>` : ""}
              ${ps?.service_charge_visible && order.service_charge > 0 ? `
              <tr>
                <td style="text-align: left;">Service Charge</td>
                <td style="text-align: right;">${currency}${Number(order.service_charge || 0).toFixed(2)}</td>
              </tr>` : ""}
              ${showGstBreakup ? `
              <tr>
                <td style="text-align: left;">CGST (2.5%)</td>
                <td style="text-align: right;">${currency}${halfTax}</td>
              </tr>
              <tr>
                <td style="text-align: left;">SGST (2.5%)</td>
                <td style="text-align: right;">${currency}${halfTax}</td>
              </tr>` : ""}
              ${showTaxLine ? `
              <tr>
                <td style="text-align: left;">Tax / GST (5%)</td>
                <td style="text-align: right;">${currency}${taxAmount.toFixed(2)}</td>
              </tr>` : ""}
              ${ps?.grand_total_visible !== false ? `
              <tr>
                <td colspan="2" style="padding: 2px 0;">
                  <div class="dotted-divider" style="margin: 3px 0;"></div>
                </td>
              </tr>
              <tr style="font-size: 14px; font-weight: 800;">
                <td style="text-align: left; padding: 2px 0;">GRAND TOTAL</td>
                <td style="text-align: right; padding: 2px 0;">${currency}${Number(order.total || 0).toFixed(2)}</td>
              </tr>` : ""}
              ${ps?.payment_method_visible !== false && (order.payment_mode || order.payment_method) ? `
              <tr>
                <td style="text-align: left;">Payment Mode</td>
                <td style="text-align: right;">${order.payment_mode || order.payment_method}</td>
              </tr>` : ""}
              ${ps?.payment_status_visible ? `
              <tr>
                <td style="text-align: left;">Status</td>
                <td style="text-align: right; font-weight: 700;">${order.payment_status || (order.status === "Served" ? "PAID" : "UNPAID")}</td>
              </tr>` : ""}
            </table>

            <div class="dotted-divider"></div>

            ${ps?.footer_visible !== false ? `
            <div class="receipt-footer" style="text-align: center; width: 100%;">
              <p style="text-align: center; width: 100%; margin: 2px 0; font-weight: 600; font-style: italic; color: #d97706;">${footerNote}</p>
            </div>
            <div class="dotted-divider" style="margin: 8px 0 12px 0;"></div>` : ""}
            <div style="height: 35px; width: 100%;" class="cut-spacer"></div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Print thermal invoice directly via QZ Tray
 */
export const printInvoiceSilent = async ({ order, settings = {}, copies = 2, receiptElement = null }) => {
  let receiptData;
  if (receiptElement) {
    const rawHtml = receiptElement.outerHTML;
    const paperWidth = settings?.paper_width || settings?.printSettings?.paper_width || "80mm";
    receiptData = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice</title>
          <style>
            @page {
              size: ${paperWidth} auto;
              margin: 0mm;
            }
            html, body {
              width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #000000;
              font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-header, .receipt-header *, div[class*="ReceiptHeader"], div[class*="ReceiptHeader"] * {
              text-align: center !important;
              width: 100% !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .receipt-header img, div[class*="ReceiptHeader"] img {
              display: block !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .receipt-footer, .receipt-footer *, div[class*="ReceiptFooter"], div[class*="ReceiptFooter"] * {
              text-align: center !important;
              width: 100% !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .dotted-divider {
              border-top: 1.5px dashed #999999 !important;
              margin: 6px 0 !important;
              width: 100% !important;
              display: block !important;
            }
            .items-table, .totals-table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; display: flex; justify-content: center; padding-bottom: 15mm;">
            ${rawHtml}
          </div>
        </body>
      </html>
    `;
  } else {
    receiptData = generateReceiptHTML(order, settings);
  }

  try {
    await connectPrinter();

    let printer;
    try {
      if (settings?.printer_name) {
        printer = await qz.printers.find(settings.printer_name);
      } else if (settings?.printSettings?.printer_name) {
        printer = await qz.printers.find(settings.printSettings.printer_name);
      } else {
        printer = await qz.printers.find("EPSON");
      }
    } catch (e) {
      printer = await qz.printers.getDefault();
    }

    const config = qz.configs.create(printer, {
      copies: copies,
      margins: 0,
    });

    const data = [
      {
        type: "html",
        format: "plain",
        data: receiptData,
      },
    ];

    await qz.print(config, data);
    message.success(`Invoice printed via QZ Tray (${copies} copies)`);
    return { success: true, method: "qz-tray" };
  } catch (qzError) {
    console.warn("QZ Tray connection failed, falling back to browser print:", qzError);
    await printViaBrowser(receiptData, copies);
    message.info("Printed invoice using browser print dialog (QZ Tray app not active).");
    return { success: true, method: "browser" };
  }
};

/**
 * Generate formatted HTML string for KOT thermal print
 */
export const generateKOTHTML = (order, settings = {}) => {
  if (!order) return "";

  const ps = settings?.printSettings || {};
  const printType = ps?.print_size || settings?.print_type || order?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || ps?.paper_width || printConfig.width;

  const getCleanName = (name) => {
    if (!name || typeof name !== "string") return "";
    if (name.includes("@")) return "";
    return name.trim();
  };

  const rawName =
    settings?.restaurant_name ||
    settings?.business_name ||
    settings?.legal_name;

  const restaurantName = getCleanName(rawName);

  const orderNum = order.order_number ?? order.order_no ?? order.id ?? "";
  const dateStr =
    order.created_at && !isNaN(new Date(order.created_at).getTime())
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

  const itemsHTML = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="width: 75%; text-align: left; vertical-align: top; padding: 4px 0; font-weight: bold; font-size: 11px; word-break: break-word;">
          ${item.name}
        </td>
        <td style="width: 25%; text-align: center; vertical-align: top; padding: 4px 0; font-weight: bold; font-size: 13px;">
          x${item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>KOT #${orderNum}</title>
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0mm;
          }
          html, body {
            width: ${paperWidth};
            margin: 0 auto;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .kot {
            width: ${paperWidth};
            padding: 4mm 7mm 25mm 7mm;
            box-sizing: border-box;
            background: #ffffff;
          }
          .header {
            text-align: center;
          }
          .header h3 {
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 800;
            margin: 0 0 2px;
            color: #000;
            text-transform: uppercase;
          }
          .header p {
            font-size: 11px;
            margin: 2px 0;
            color: #333;
            font-weight: 600;
          }
          .divider {
            border-top: 1.5px dashed #000;
            margin: 5px 0;
            width: 100%;
          }
          .meta {
            font-size: 11px;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .meta div strong {
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            table-layout: fixed;
          }
          th {
            font-weight: 700;
            padding-bottom: 4px;
            border-bottom: 1.5px dashed #000;
          }
          tr, .header, .meta, .divider {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div id="kot" class="kot">
          ${restaurantName ? `<div class="header"><p>${restaurantName}</p></div><div class="divider"></div>` : ""}

          <div class="meta">
            <div><strong>Order No:</strong> #${orderNum}</div>
            <div><strong>Table:</strong> ${order.table_name || "Takeaway"}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 75%; text-align: left;">Item</th>
                <th style="width: 25%; text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="divider" style="margin: 8px 0 4px 0;"></div>
          <p style="text-align: center; font-weight: 700; font-size: 12px; margin: 4px 0 6px 0; color: #000; text-transform: uppercase;">
            -- Order Completed --
          </p>
          <div class="divider" style="margin: 4px 0 12px 0;"></div>
          <div style="height: 35px; width: 100%;" class="cut-spacer"></div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Print KOT thermal ticket directly via QZ Tray
 */
export const printKOTSilent = async ({
  order,
  settings = {},
  copies = 1,
  receiptElement = null,
}) => {
  let kotData;
  if (receiptElement) {
    const rawHtml = receiptElement.outerHTML;
    const paperWidth = settings?.paper_width || "80mm";
    kotData = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>KOT</title>
          <style>
            @page {
              size: ${paperWidth} auto;
              margin: 0mm;
            }
            html, body {
              width: 100%;
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #000000;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.3;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-header, .receipt-header *, div[class*="ReceiptHeader"], div[class*="ReceiptHeader"] * {
              text-align: center !important;
              width: 100% !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .dotted-divider {
              border-top: 1.5px dashed #000000 !important;
              margin: 6px 0 !important;
              width: 100% !important;
              display: block !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; display: flex; justify-content: center; padding-bottom: 15mm;">
            ${rawHtml}
          </div>
        </body>
      </html>
    `;
  } else {
    kotData = generateKOTHTML(order, settings);
  }

  try {
    await connectPrinter();

    let printer;
    try {
      if (settings?.printer_name) {
        printer = await qz.printers.find(settings.printer_name);
      } else {
        printer = await qz.printers.find("EPSON");
      }
    } catch (e) {
      printer = await qz.printers.getDefault();
    }

    const config = qz.configs.create(printer, {
      copies: copies,
      margins: 0,
    });

    const data = [
      {
        type: "html",
        format: "plain",
        data: kotData,
      },
    ];

    await qz.print(config, data);
    message.success(`KOT printed via QZ Tray (${copies} copies)`);
    return { success: true, method: "qz-tray" };
  } catch (qzError) {
    console.warn("QZ Tray connection failed, falling back to browser print:", qzError);
    await printViaBrowser(kotData, copies);
    message.info("Printed KOT using browser print dialog (QZ Tray app not active).");
    return { success: true, method: "browser" };
  }
};
