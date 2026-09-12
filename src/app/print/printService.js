import qz from "qz-tray";
import { message } from "antd";

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
 * Generate formatted HTML string for 80mm thermal receipt
 */
export const generateReceiptHTML = (order, settings = {}) => {
  if (!order) return "";

  const paperWidth = settings?.paper_width || "80mm";
  const currency = settings?.currency || "₹";

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
        <td style="width: 45%; text-align: left; vertical-align: top; padding: 3.5px 0; word-break: break-word;">
          ${item.name}${isItemGst ? '<br/><span style="font-size: 8.5px; opacity: 0.75; color: #555;">(5% GST)</span>' : ''}
        </td>
        <td style="width: 12%; text-align: center; vertical-align: top; padding: 3.5px 0;">${item.quantity}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3.5px 0;">${currency} ${item.price}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3.5px 0;">${currency} ${item.price * item.quantity}</td>
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
            width: ${paperWidth};
            margin: 0 auto;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: 'Courier New', Courier, monospace;
            font-size: 10.5px;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt {
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
            font-weight: 700;
            margin: 0 0 2px;
            color: #000;
          }
          .header p {
            font-size: 10.5px;
            margin: 2px 0;
            color: #333;
          }
          .divider {
            border-top: 1.5px dashed #666;
            margin: 5px 0;
            width: 100%;
          }
          .meta {
            font-size: 10.5px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .meta div strong {
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            table-layout: fixed;
          }
          th {
            font-weight: 700;
            padding-bottom: 4px;
            border-bottom: 1.5px dashed #666;
          }
          .totals {
            display: flex;
            flex-direction: column;
            gap: 3.5px;
            font-size: 11px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
          }
          .grand-total {
            font-size: 14px;
            font-weight: 700;
            color: #000000;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #4b5563;
            margin-top: 4px;
          }
          .footer p {
            margin: 2px 0;
          }
          tr, .header, .meta, .totals, .footer, .divider {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div id="receipt" class="receipt">
          <div class="header">
            <h3>${restaurantName}</h3>
            <p>${address}</p>
            ${hasGst ? `<p>GSTIN: ${gstin}</p>` : ""}
          </div>

          <div class="divider"></div>

          <div class="meta">
            <div><strong>Order No:</strong> #${orderNum}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
            ${order.table_name ? `<div><strong>Table:</strong> ${order.table_name}</div>` : ""}
            <div><strong>Status:</strong> INVOICED</div>
            <div><strong>Payment:</strong> ${order.payment_status || (order.status === "Served" ? "Paid" : "Unpaid")}${(order.payment_mode || order.payment_method) ? ` (${order.payment_mode || order.payment_method})` : ""}</div>
          </div>

          <div class="divider"></div>

          <table>
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

          <div class="divider"></div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${currency} ${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            ${order.discount > 0
      ? `<div class="total-row" style="color: #10b981;">
                    <span>Discount Applied</span>
                    <span>-${currency} ${Number(order.discount || 0).toFixed(2)}</span>
                  </div>`
      : ""
    }
            ${hasGst
      ? `<div class="total-row">
                    <span>CGST & SGST (5%)</span>
                    <span>${currency} ${Number(order.tax || 0).toFixed(2)}</span>
                  </div>`
      : ""
    }
            <div class="divider" style="margin: 5px 0;"></div>
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>${currency} ${Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p>${footerNote}</p>
            <p style="font-size: 9px; opacity: 0.75; margin-top: 4px;">Powered by Systems</p>
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

