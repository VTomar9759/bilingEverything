import qz from "qz-tray";
import { message } from "antd";

/**
 * Connect to QZ Tray WebSocket if inactive
 */
export async function connectPrinter() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

/**
 * Generate formatted HTML string for 80mm thermal receipt
 */
export const generateReceiptHTML = (order, settings = {}) => {
  if (!order) return "";

  const paperWidth = settings?.paper_width || "80mm";
  const currency = settings?.currency || "Rs.";
  const taxRate = settings?.tax_rate || 18;
  const serviceRate = settings?.service_charge_rate || 5;

  const restaurantName = settings?.restaurant_name || "Delight Cafe";
  const address =
    settings?.address || "204, Foodie Boulevard, Connaught Place, New Delhi";
  const gstin = settings?.gstin || "07AAAAA1111A1Z1";

  const orderNum = order.order_number || order.id;
  const dateStr =
    order.created_at && !isNaN(new Date(order.created_at).getTime())
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

  const itemsHTML = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="width: 45%; text-align: left; vertical-align: top; padding: 3.5px 0; word-break: break-word;">${item.name}</td>
        <td style="width: 12%; text-align: center; vertical-align: top; padding: 3.5px 0;">${item.quantity}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3.5px 0;">${currency} ${item.price}</td>
        <td style="width: 21.5%; text-align: right; vertical-align: top; padding: 3.5px 0;">${currency} ${item.price * item.quantity}</td>
      </tr>
    `
    )
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
            <p>GSTIN: ${gstin}</p>
          </div>

          <div class="divider"></div>

          <div class="meta">
            <div><strong>Order No:</strong> #${orderNum}</div>
            <div><strong>Date:</strong> ${dateStr}</div>
            ${order.table_name ? `<div><strong>Table:</strong> ${order.table_name}</div>` : ""}
            <div><strong>Status:</strong> INVOICED</div>
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
            <div class="total-row">
              <span>CGST & SGST (${taxRate}%)</span>
              <span>${currency} ${Number(order.tax || 0).toFixed(2)}</span>
            </div>
            ${serviceRate > 0
      ? `<div class="total-row">
                    <span>Service Charge (${serviceRate}%)</span>
                    <span>${currency} ${Number(order.service_charge || 0).toFixed(2)}</span>
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
            <p>Thank You For Dining With Us!</p>
            <p>Power by Systems</p>
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

    const receiptData = receiptElement ? receiptElement.outerHTML : generateReceiptHTML(order, settings);

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
    console.warn("QZ Tray connection / print error:", qzError);
    message.error("Could not connect to QZ Tray. Please ensure QZ Tray app is running on this PC.");
    return { success: false, error: qzError };
  }
};
