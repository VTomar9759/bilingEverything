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
export const printViaBrowser = (htmlContent) => {
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
    doc.write(htmlContent);
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
 */
export const generateReceiptHTML = (order, settings = {}) => {
  if (!order) return "";

  const printType = settings?.print_type || order?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || printConfig.width;
  const currency = settings?.currency || "₹";
  const logoImage = settings?.logo_image || settings?.logo || settings?.logo_url || "";

  const restaurantName =
    settings?.restaurant_name ||
    settings?.business_name ||
    settings?.legal_name ||
    "Role Express";
  const address = settings?.address || "Address not set";
  const gstin = settings?.gstin || settings?.gst_number || "";
  const hasGst = Boolean(gstin && String(gstin).trim().length > 0);
  const footerNote = settings?.invoice_footer || "Thank You For Dining With Us!";

  const orderNum = order.order_number ?? order.order_no ?? order.id ?? "";
  const tableCode = order.table_code || order.table_number || order.table_no || order.table_name || "";
  const dateStr =
    order.created_at && !isNaN(new Date(order.created_at).getTime())
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

  const itemsHTML = (order.items || [])
    .map((item) => {
      const isItemGst =
        hasGst &&
        item?.gst_status !== false &&
        String(item?.gst_status) !== "false";

      return `
      <tr>
        <td style="width: 45%; text-align: left; vertical-align: top; padding: 3px 0; word-break: break-word; font-size: 9.5px; color: #000000;">
          ${item.name}${isItemGst ? '<br/><span style="font-size: 8.5px; font-weight: 600; color: #000000;">(5% GST)</span>' : ''}
        </td>
        <td style="width: 12%; text-align: center; vertical-align: top; padding: 3px 0; font-size: 9.5px; color: #000000;">${item.quantity}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3px 0; font-size: 9.5px; color: #000000;">${currency} ${item.price}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3px 0; font-size: 9.5px; color: #000000;">${currency} ${item.price * item.quantity}</td>
      </tr>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt #${orderNum}</title>
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
            font-size: 10.5px;
            line-height: 1.3;
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
            padding: 4mm 3mm;
            box-sizing: border-box;
            background: #ffffff;
          }
          .header, .receipt-header {
            text-align: center !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 6px !important;
          }
          .header img, .receipt-header img {
            max-height: 55px !important;
            max-width: 130px !important;
            object-fit: contain !important;
            margin: 0 auto 6px auto !important;
            display: block !important;
          }
          .header h3, .receipt-header h3 {
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            margin: 0 0 2px 0 !important;
            text-align: center !important;
            color: #000000 !important;
            text-transform: uppercase !important;
            width: 100% !important;
          }
          .header p, .receipt-header p {
            font-size: 10.5px !important;
            margin: 2px 0 !important;
            text-align: center !important;
            color: #000000 !important;
            width: 100% !important;
          }
          .divider, .dotted-divider {
            border-top: 1.5px dashed #000000 !important;
            margin: 6px 0 !important;
            width: 100% !important;
            display: block !important;
          }
          .meta, .receipt-meta {
            font-size: 10.5px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            color: #000000 !important;
            width: 100% !important;
          }
          .meta div strong, .receipt-meta div strong {
            font-weight: 700 !important;
          }
          .items-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9.5px !important;
            table-layout: fixed !important;
            color: #000000 !important;
            margin: 4px 0 !important;
          }
          .items-table th {
            font-weight: 700 !important;
            font-size: 9.5px !important;
            padding-bottom: 4px !important;
            border-bottom: 1.5px dashed #000000 !important;
            color: #000000 !important;
          }
          .items-table td {
            font-size: 9.5px !important;
            color: #000000 !important;
          }
          .totals-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10.5px !important;
            color: #000000 !important;
            margin-top: 2px !important;
          }
          .totals-table td {
            padding: 2px 0 !important;
            color: #000000 !important;
          }
          .footer, .receipt-footer {
            text-align: center !important;
            font-size: 10px !important;
            color: #000000 !important;
            margin-top: 6px !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .footer p, .receipt-footer p {
            margin: 2px 0 !important;
            text-align: center !important;
            width: 100% !important;
          }
          tr, .header, .receipt-header, .meta, .receipt-meta, .totals-table, .footer, .receipt-footer, .divider, .dotted-divider {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="receipt-wrapper">
          <div id="receipt" class="receipt">
            <div class="receipt-header">
              ${logoImage ? `<img src="${logoImage}" alt="Logo" />` : ""}
              <h3>${restaurantName}</h3>
              <p>${address}</p>
              ${hasGst && gstin ? `<p style="font-weight: 700;">GSTIN: ${gstin}</p>` : ""}
            </div>

            <div class="dotted-divider"></div>

            <div class="receipt-meta">
              <div><strong>Order No:</strong> #${orderNum}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
              ${tableCode ? `<div><strong>Table:</strong> ${tableCode}</div>` : ""}
              <div><strong>Status:</strong> INVOICED</div>
              <div><strong>Payment:</strong> ${order.payment_status || (order.status === "Served" ? "Paid" : "Unpaid")}${(order.payment_mode || order.payment_method) ? ` (${order.payment_mode || order.payment_method})` : ""}</div>
            </div>

            <div class="dotted-divider"></div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 45%; text-align: left;">Item</th>
                  <th style="width: 12%; text-align: center;">Qty</th>
                  <th style="width: 21.5%; text-align: right;">Price</th>
                  <th style="width: 21.5%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="dotted-divider"></div>

            <table class="totals-table">
              <tr>
                <td style="text-align: left;">Subtotal</td>
                <td style="text-align: right; font-weight: 600;">${currency} ${Number(order.subtotal || 0).toFixed(2)}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td style="text-align: left;">Discount Applied</td>
                <td style="text-align: right; font-weight: 600;">-${currency} ${Number(order.discount || 0).toFixed(2)}</td>
              </tr>` : ""}
              ${hasGst && order.tax > 0 ? `
              <tr>
                <td style="text-align: left;">CGST & SGST (5%)</td>
                <td style="text-align: right; font-weight: 600;">${currency} ${Number(order.tax || 0).toFixed(2)}</td>
              </tr>` : ""}
              <tr>
                <td colspan="2" style="padding: 2px 0;">
                  <div class="dotted-divider" style="margin: 3px 0;"></div>
                </td>
              </tr>
              <tr style="font-size: 13px; font-weight: 800;">
                <td style="text-align: left; padding: 2px 0;">Grand Total</td>
                <td style="text-align: right; padding: 2px 0;">${currency} ${Number(order.total || 0).toFixed(2)}</td>
              </tr>
            </table>

            <div class="dotted-divider"></div>

            <div class="receipt-footer">
              <p style="font-weight: 600;">${footerNote}</p>
              <p style="font-size: 9px; margin-top: 4px;">Powered by Systems</p>
            </div>
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
  const receiptData = receiptElement ? receiptElement.outerHTML : generateReceiptHTML(order, settings);

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
        data: receiptData,
      },
    ];

    await qz.print(config, data);
    message.success(`Invoice printed via QZ Tray (${copies} copies)`);
    return { success: true, method: "qz-tray" };
  } catch (qzError) {
    console.warn("QZ Tray connection failed, falling back to browser print:", qzError);
    await printViaBrowser(receiptData);
    message.info("Printed invoice using browser print dialog (QZ Tray app not active).");
    return { success: true, method: "browser" };
  }
};

/**
 * Generate formatted HTML string for KOT thermal print
 */
export const generateKOTHTML = (order, settings = {}) => {
  if (!order) return "";

  const paperWidth = settings?.paper_width || "80mm";

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
            padding: 4mm 3mm;
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

          <div class="divider"></div>
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
  const kotData = receiptElement
    ? receiptElement.outerHTML
    : generateKOTHTML(order, settings);

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
    await printViaBrowser(kotData);
    message.info("Printed KOT using browser print dialog (QZ Tray app not active).");
    return { success: true, method: "browser" };
  }
};

