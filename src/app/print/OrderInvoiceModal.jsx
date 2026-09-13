import React, { useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Modal, Button, Space } from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { printInvoiceSilent } from "../../services";
import useOrgData from "../hooks/useOrgData";
import { PRINT_TYPE, PRINT_SIZE } from "../utils/constant";
import { useSelector } from "react-redux";
import { selectPrintSettings } from "../store/slices/printSettingSlice";

const PrintGlobalStyles = createGlobalStyle`
  @media print {
    @page {
      size: ${({ $paperWidth }) => $paperWidth || "80mm"} auto;
      margin: 0mm;
    }

    html, body {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body * {
      visibility: hidden !important;
    }

    .printable-receipt-container,
    .printable-receipt-container * {
      visibility: visible !important;
    }

    .printable-receipt-container {
      position: relative !important;
      margin: 0 auto !important;
      left: 0 !important;
      right: 0 !important;
      top: 0 !important;
      width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
      max-width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
      padding: 4mm 3mm !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
    }

    .printable-receipt-container .receipt-header {
      text-align: center !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .printable-receipt-container .receipt-header h3,
    .printable-receipt-container .receipt-header p,
    .printable-receipt-container .receipt-header img {
      text-align: center !important;
      margin-left: auto !important;
      margin-right: auto !important;
      width: auto !important;
    }

    .printable-receipt-container .receipt-footer {
      text-align: center !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .printable-receipt-container .receipt-footer p {
      text-align: center !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .printable-receipt-container .dotted-divider {
      border-top: 1.5px dashed #000000 !important;
      margin: 6px 0 !important;
      width: 100% !important;
      display: block !important;
    }

    .printable-receipt-container .items-table,
    .printable-receipt-container .items-table th,
    .printable-receipt-container .items-table td {
      font-size: 11px !important;
      color: #000000 !important;
    }

    .printable-receipt-container .totals-table {
      width: 100% !important;
      font-size: 11px !important;
      color: #000000 !important;
    }

    .printable-receipt-container .grand-total {
      color: #000000 !important;
    }

    tr, .receipt-header, .receipt-meta, .totals-table, .receipt-footer, .dotted-divider {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`;

const OrderInvoiceModal = ({ visible, onClose, order, settings }) => {
  const receiptRef = useRef();
  const [loadingPrint, setLoadingPrint] = useState(false);
  const { userData, hasGst: orgHasGst } = useOrgData();
  const ps = useSelector(selectPrintSettings);

  if (!order) return null;

  const businessName =
    userData?.business_name ||
    userData?.legal_name ||
    userData?.full_name ||
    settings?.restaurant_name ||
    settings?.business_name ||
    "Role Express";

  // Build full address string dynamically
  const addressParts = [];
  const primaryAddress = userData?.address || settings?.address;
  if (primaryAddress) addressParts.push(primaryAddress);
  if (userData?.city) addressParts.push(userData.city);
  if (userData?.state) addressParts.push(userData.state);
  if (userData?.pincode) addressParts.push(userData.pincode);

  const address =
    addressParts.length > 0
      ? addressParts.join(", ")
      : "Address not set";

  const phone = userData?.phone || settings?.phone || "";
  const email = userData?.email || settings?.email || "";
  const gstNumber = userData?.gst_number || settings?.gstin || settings?.gst_number;
  const hasGst = orgHasGst;

  const invoiceFooter =
    ps?.footer_text ||
    userData?.invoice_footer ||
    settings?.invoice_footer ||
    "Thank You For Dining With Us!";

  const printType = userData?.print_type || settings?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || userData?.paper_width || printConfig.width;
  const modalWidth = printConfig.widthPx + 78;
  const currency = userData?.currency || settings?.currency || "₹";

  const logoImage = userData?.logo_image || settings?.logo_image || settings?.logo || "";
  const logoSize = ps?.logo_size || 80;
  const tableCode = order.table_code || order.table_number || order.table_no || order.table_name || "";
  const customerName = order.customer_name || order.customer?.name || "";
  const customerPhone = order.customer_phone || order.customer?.phone || "";
  const customerAddress = order.customer_address || order.customer?.address || "";

  const invoiceNumber = order.invoice_number || order.invoice_no || "";
  const invoicePrefix = userData?.invoice_prefix || "INV";

  const getFormattedOrderNo = () => {
    if (!order) return "";
    return order.order_number ?? order.order_no ?? order.id ?? "";
  };

  const getFormattedInvoiceNo = () => {
    if (invoiceNumber) return invoiceNumber;
    return `${invoicePrefix}-${new Date().getFullYear()}-${String(getFormattedOrderNo()).padStart(4, '0')}`;
  };

  const getFormattedDate = () => {
    if (order.created_at && !isNaN(new Date(order.created_at).getTime())) {
      const d = new Date(order.created_at);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    const d = new Date();
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Calculate item discount
  const getItemDiscount = (item) => {
    if (item.discount && Number(item.discount) > 0) return Number(item.discount);
    if (item.item_discount && Number(item.item_discount) > 0) return Number(item.item_discount);
    return 0;
  };

  // Calculate item total after discount
  const getItemTotal = (item) => {
    const base = (item.price || 0) * (item.quantity || 0);
    const disc = getItemDiscount(item);
    return base - disc;
  };

  const handlePrint = async () => {
    setLoadingPrint(true);
    await printInvoiceSilent({
      order,
      settings: {
        ...settings,
        restaurant_name: businessName,
        address,
        gstin: hasGst ? gstNumber : "",
        currency,
        paper_width: paperWidth,
        print_type: printType,
        logo_image: logoImage,
        phone,
        printSettings: ps,
      },
      copies: ps?.number_of_copies || 2,
      receiptElement: receiptRef.current,
    });
    setLoadingPrint(false);
  };

  const handleDownloadText = () => {
    if (!order) return;
    let text = "";
    text += "=========================================\n";
    text += `       ${businessName}\n`;
    text += `  ${address}\n`;
    if (phone) text += `  Phone: ${phone}\n`;
    if (gstNumber) text += `  GSTIN: ${gstNumber}\n`;
    text += "=========================================\n\n";
    if (ps?.invoice_number_visible !== false) text += `Invoice:    ${getFormattedInvoiceNo()}\n`;
    text += `Order No:   #${getFormattedOrderNo()}\n`;
    text += `Date:       ${getFormattedDate()}\n`;
    if (order.table_name) {
      text += `Table:      ${order.table_name}\n`;
    }
    text += "-----------------------------------------\n";
    text += "Item                 Qty    Price   Total\n";
    text += "-----------------------------------------\n";
    order.items?.forEach((item) => {
      const name = (item.name || "").padEnd(20).substring(0, 20);
      const qty = (item.quantity || 0).toString().padStart(3);
      const price = `${currency}${item.price}`.padStart(9);
      const total = `${currency}${getItemTotal(item)}`.padStart(9);
      text += `${name} ${qty} ${price} ${total}\n`;
    });
    text += "-----------------------------------------\n";
    text += `Subtotal:                  ${currency}${(order.subtotal || 0).toFixed(2)}\n`;
    if (order.discount > 0) {
      text += `Discount:                 -${currency}${(order.discount || 0).toFixed(2)}\n`;
    }
    if (hasGst && order.tax > 0) {
      const halfTax = (Number(order.tax || 0) / 2).toFixed(2);
      text += `CGST (2.5%):               ${currency}${halfTax}\n`;
      text += `SGST (2.5%):               ${currency}${halfTax}\n`;
    }
    text += "-----------------------------------------\n";
    text += `GRAND TOTAL:               ${currency}${(order.total || 0).toFixed(2)}\n`;
    if (order.payment_mode || order.payment_method) {
      text += `Payment Mode:              ${order.payment_mode || order.payment_method}\n`;
    }
    text += "=========================================\n";
    text += `       ${invoiceFooter}\n`;
    text += "=========================================\n";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${getFormattedOrderNo()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine tax display
  const taxAmount = Number(order.tax || 0);
  const halfTax = (taxAmount / 2).toFixed(2);
  const showGstBreakup = ps?.gst_breakup_visible !== false && hasGst && taxAmount > 0;
  const showTaxLine = ps?.tax_visible !== false && !showGstBreakup && taxAmount > 0;

  return (
    <>
      <PrintGlobalStyles $paperWidth={paperWidth} />
      <Modal
        open={visible}
        onCancel={onClose}
        width={modalWidth}
        centered
        footer={false}
        title={null}
      >
        <ReceiptOuter>
          <ReceiptPaper ref={receiptRef} id="receipt" className="printable-receipt-container" $paperWidth={paperWidth}>
            {/* ─── HEADER ─── */}
            <ReceiptHeader className="receipt-header">
              {ps?.logo_visible !== false && logoImage && (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{
                    maxHeight: Math.min(logoSize, 120),
                    maxWidth: 140,
                    objectFit: "contain",
                    margin: "0 auto 6px auto",
                    display: "block",
                  }}
                />
              )}
              {ps?.business_name_visible !== false && (
                <h3>{businessName}</h3>
              )}
              {ps?.address_visible !== false && (
                <p>{address}</p>
              )}
              {ps?.phone_visible !== false && phone && (
                <p>Phone: {phone}</p>
              )}
              {ps?.email_visible !== false && email && (
                <p>Email: {email}</p>
              )}
              {ps?.gst_number_visible !== false && hasGst && gstNumber && (
                <p style={{ fontWeight: 700 }}>GSTIN: {gstNumber}</p>
              )}
            </ReceiptHeader>

            <DottedDivider className="dotted-divider" />

            {/* ─── META ─── */}
            <ReceiptMeta className="receipt-meta">
              {ps?.invoice_number_visible !== false && (
                <div>
                  <strong>Invoice:</strong> {getFormattedInvoiceNo()}
                </div>
              )}
              {ps?.order_number_visible !== false && (
                <div>
                  <strong>Order:</strong> #{getFormattedOrderNo()}
                </div>
              )}
              {ps?.invoice_date_visible !== false && (
                <div>
                  <strong>Date:</strong> {getFormattedDate()}
                </div>
              )}
              {ps?.table_name_visible !== false && tableCode && (
                <div>
                  <strong>Table:</strong> {tableCode}
                </div>
              )}
            </ReceiptMeta>

            {/* ─── CUSTOMER ─── */}
            {(ps?.customer_name_visible || ps?.customer_phone_visible || ps?.customer_address_visible) &&
              (customerName || customerPhone || customerAddress) && (
              <>
                <DottedDivider className="dotted-divider" />
                <ReceiptMeta className="receipt-meta">
                  {ps?.customer_name_visible && customerName && (
                    <div><strong>Customer:</strong> {customerName}</div>
                  )}
                  {ps?.customer_phone_visible && customerPhone && (
                    <div><strong>Contact:</strong> {customerPhone}</div>
                  )}
                  {ps?.customer_address_visible && customerAddress && (
                    <div><strong>Address:</strong> {customerAddress}</div>
                  )}
                </ReceiptMeta>
              </>
            )}

            <DottedDivider className="dotted-divider" />

            {/* ─── ITEMS TABLE ─── */}
            <ItemsTable className="items-table">
              <thead>
                <tr>
                  <th align="left" style={{ width: "40%", textAlign: "left" }}>Item</th>
                  {ps?.item_quantity_visible !== false && (
                    <th align="center" style={{ width: "10%", textAlign: "center" }}>Qty</th>
                  )}
                  {ps?.item_rate_visible !== false && (
                    <th align="right" style={{ width: "18%", textAlign: "right" }}>Rate</th>
                  )}
                  {ps?.item_discount_visible !== false && (
                    <th align="right" style={{ width: "14%", textAlign: "right" }}>Disc</th>
                  )}
                  <th align="right" style={{ width: "18%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => {
                  const disc = getItemDiscount(item);
                  const total = getItemTotal(item);

                  return (
                    <tr key={idx}>
                      <td>
                        {item.name}
                        {ps?.item_description_visible && item.description && (
                          <span style={{ fontSize: "8.5px", display: "block", color: "#666" }}>
                            {item.description}
                          </span>
                        )}
                      </td>
                      {ps?.item_quantity_visible !== false && (
                        <td align="center" style={{ textAlign: "center" }}>{item.quantity}</td>
                      )}
                      {ps?.item_rate_visible !== false && (
                        <td align="right" style={{ textAlign: "right" }}>{currency}{item.price}</td>
                      )}
                      {ps?.item_discount_visible !== false && (
                        <td align="right" style={{ textAlign: "right" }}>
                          {disc > 0 ? `${currency}${disc}` : "-"}
                        </td>
                      )}
                      <td align="right" style={{ textAlign: "right" }}>{currency}{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </ItemsTable>

            <DottedDivider className="dotted-divider" />

            {/* ─── TOTALS ─── */}
            <TotalsTable className="totals-table">
              <tbody>
                {ps?.subtotal_visible !== false && (
                  <tr>
                    <td>Subtotal</td>
                    <td align="right" style={{ textAlign: "right" }}>
                      {currency}{Number(order.subtotal || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {ps?.discount_visible !== false && order.discount > 0 && (
                  <tr>
                    <td>Discount</td>
                    <td align="right" style={{ textAlign: "right" }}>
                      -{currency}{Number(order.discount || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {ps?.service_charge_visible && order.service_charge > 0 && (
                  <tr>
                    <td>Service Charge</td>
                    <td align="right" style={{ textAlign: "right" }}>
                      {currency}{Number(order.service_charge || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {showGstBreakup && (
                  <>
                    <tr>
                      <td>CGST (2.5%)</td>
                      <td align="right" style={{ textAlign: "right" }}>
                        {currency}{halfTax}
                      </td>
                    </tr>
                    <tr>
                      <td>SGST (2.5%)</td>
                      <td align="right" style={{ textAlign: "right" }}>
                        {currency}{halfTax}
                      </td>
                    </tr>
                  </>
                )}
                {showTaxLine && (
                  <tr>
                    <td>Tax / GST (5%)</td>
                    <td align="right" style={{ textAlign: "right" }}>
                      {currency}{taxAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                {ps?.grand_total_visible !== false && (
                  <>
                    <tr>
                      <td colSpan={2} style={{ padding: "2px 0" }}>
                        <DottedDivider className="dotted-divider" style={{ margin: "3px 0" }} />
                      </td>
                    </tr>
                    <tr className="totals grand-total" style={{ fontSize: 14, fontWeight: 800 }}>
                      <td>GRAND TOTAL</td>
                      <td align="right" style={{ textAlign: "right" }}>
                        {currency}{Number(order.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
                {ps?.payment_method_visible !== false && (order.payment_mode || order.payment_method) && (
                  <tr>
                    <td>Payment Mode</td>
                    <td align="right" style={{ textAlign: "right" }}>
                      {order.payment_mode || order.payment_method}
                    </td>
                  </tr>
                )}
                {ps?.payment_status_visible && (
                  <tr>
                    <td>Status</td>
                    <td align="right" style={{ textAlign: "right", color: "#16a34a", fontWeight: 700 }}>
                      {order.payment_status || (order.status === "Served" ? "PAID" : "UNPAID")}
                    </td>
                  </tr>
                )}
              </tbody>
            </TotalsTable>

            <DottedDivider className="dotted-divider" />

            {/* ─── FOOTER ─── */}
            {ps?.footer_visible !== false && (
              <ReceiptFooter className="receipt-footer">
                <p style={{ fontWeight: 600, fontStyle: "italic", color: "#d97706" }}>
                  {invoiceFooter}
                </p>
              </ReceiptFooter>
            )}
          </ReceiptPaper>
        </ReceiptOuter>
        <Space
          style={{
            display: "flex",
            marginTop: "12px",
            justifyContent: "end",
            alignItems: "end",
          }}
        >
          <Button
            key="download"
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleDownloadText}
            style={{
              borderColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
            }}
          >
            Download Invoice
          </Button>
          <Button
            key="print"
            type="primary"
            loading={loadingPrint}
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ background: "var(--color-primary-light)" }}
          >
            Print Invoice
          </Button>
        </Space>
      </Modal>
    </>
  );
};

export default OrderInvoiceModal;

const ReceiptOuter = styled.div`
  padding: 10px;
  border: 1px solid var(--color-border);
  display: flex;
  border-radius: 8px;
  justify-content: center;
  background: #fdfdfd;
`;

const ReceiptPaper = styled.div`
  background: white;
  width: ${({ $paperWidth }) => ($paperWidth === "58mm" ? "220px" : "300px")};
  max-width: 100%;
  padding: 12px 10px;
  font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
  font-size: 11px;
  line-height: 1.4;
`;

const ReceiptHeader = styled.div`
  text-align: center;
  h3 {
    font-family: 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 2px;
    text-transform: uppercase;
  }
  p {
    font-size: 10.5px;
    margin: 1px 0;
    color: #64748b;
    word-wrap: break-word;
  }
`;

const DottedDivider = styled.div`
  border-top: 1.5px dashed #94a3b8;
  margin: 6px 0;
  width: 100%;
`;

const ReceiptMeta = styled.div`
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #334155;
  strong {
    font-weight: 700;
    color: #0f172a;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  table-layout: fixed;
  th {
    font-weight: 700;
    padding-bottom: 4px;
    color: #0f172a;
    font-size: 11px;
    border-bottom: 1.5px dashed #94a3b8;
  }
  td {
    padding: 4px 0;
    color: #1e293b;
    vertical-align: top;
    word-break: break-word;
    font-size: 11px;
  }
`;

const TotalsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  color: #1e293b;

  td {
    padding: 2px 0;
  }
`;

const ReceiptFooter = styled.div`
  text-align: center;
  font-size: 10.5px;
  color: #d97706;
  p {
    margin: 2px 0;
  }
`;
