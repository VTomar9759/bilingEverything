import React, { useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Modal, Button, Space } from "antd";
import {
  PrinterOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { printInvoiceSilent } from "../../services";
import useOrgData from "../hooks/useOrgData";
import { PRINT_TYPE, PRINT_SIZE } from "../utils/constant";

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

    /* Hide unnecessary UI elements during printing */
    body * {
      visibility: hidden !important;
    }

    /* Show only the receipt container and its children */
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
      font-family: 'Courier New', Courier, monospace !important;
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
      width: 100% !important;
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
      font-size: 9.5px !important;
      color: #000000 !important;
    }

    .printable-receipt-container .totals-table {
      width: 100% !important;
      font-size: 10.5px !important;
      color: #000000 !important;
    }

    .printable-receipt-container .grand-total {
      color: #000000 !important;
    }

    /* Ensure continuous flow and clean page breaks across multiple pages */
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

  const gstNumber = userData?.gst_number || settings?.gstin || settings?.gst_number;
  const hasGst = orgHasGst;

  const invoiceFooter =
    userData?.invoice_footer ||
    settings?.invoice_footer ||
    "Thank You For Dining With Us!";

  const printType = userData?.print_type || settings?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || userData?.paper_width || printConfig.width;
  const modalWidth = printConfig.widthPx + 78;
  const currency = userData?.currency || settings?.currency || "₹";

  const logoImage = userData?.logo_image || settings?.logo_image || settings?.logo || "";
  const tableCode = order.table_code || order.table_number || order.table_no || order.table_name || "";

  const getFormattedOrderNo = () => {
    if (!order) return "";
    return order.order_number ?? order.order_no ?? order.id ?? "";
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
      },
      copies: 2,
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
    if (gstNumber) text += `  GSTIN: ${gstNumber}\n`;
    text += "=========================================\n\n";
    text += `Order No:   #${getFormattedOrderNo()}\n`;
    text += `Date:       ${order.created_at && !isNaN(new Date(order.created_at).getTime())
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString()
      }\n`;
    if (order.table_name) {
      text += `Table:      ${order.table_name}\n`;
    }
    text += "Status:     INVOICED\n";
    text += "-----------------------------------------\n";
    text += "Item                 Qty    Price   Total\n";
    text += "-----------------------------------------\n";
    order.items?.forEach((item) => {
      const isItemGst =
        hasGst &&
        item?.gst_status !== false &&
        String(item?.gst_status) !== "false";
      const displayName = isItemGst ? `${item.name} (5% GST)` : item.name;
      const name = (displayName || "").padEnd(20).substring(0, 20);
      const qty = (item.quantity || 0).toString().padStart(3);
      const price = `${currency} ${item.price}`.padStart(9);
      const total = `${currency} ${item.price * item.quantity}`.padStart(9);
      text += `${name} ${qty} ${price} ${total}\n`;
    });
    text += "-----------------------------------------\n";
    text += `Subtotal:                  ${currency} ${(order.subtotal || 0).toFixed(2)}\n`;
    if (order.discount > 0) {
      text += `Discount Applied:         -${currency} ${(order.discount || 0).toFixed(2)}\n`;
    }
    if (hasGst) {
      text += `CGST & SGST (5%):        ${currency} ${(order.tax || 0).toFixed(2)}\n`;
    }
    text += "-----------------------------------------\n";
    text += `GRAND TOTAL:               ${currency} ${(order.total || 0).toFixed(2)}\n`;
    text += "=========================================\n";
    text += `       ${invoiceFooter}\n`;
    text += "            Powered by Systems\n";
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
            <ReceiptHeader className="receipt-header">
              {logoImage && (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{
                    maxHeight: 55,
                    maxWidth: 130,
                    objectFit: "contain",
                    margin: "0 auto 6px auto",
                    display: "block",
                  }}
                />
              )}
              <h3>{businessName}</h3>
              <p>{address}</p>
              {hasGst && gstNumber && <p style={{ fontWeight: 700 }}>GSTIN: {gstNumber}</p>}
            </ReceiptHeader>

            <DottedDivider className="dotted-divider" />

            <ReceiptMeta className="receipt-meta">
              <div>
                <strong>Order No:</strong> #{getFormattedOrderNo()}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {order.created_at && !isNaN(new Date(order.created_at).getTime())
                  ? new Date(order.created_at).toLocaleString()
                  : new Date().toLocaleString()}
              </div>
              {tableCode && (
                <div>
                  <strong>Table:</strong> {tableCode}
                </div>
              )}
              <div>
                <strong>Status:</strong> INVOICED
              </div>
              <div>
                <strong>Payment:</strong> {order.payment_status || (order.status === "Served" ? "Paid" : "Unpaid")}
                {(order.payment_mode || order.payment_method) && ` (${order.payment_mode || order.payment_method})`}
              </div>
            </ReceiptMeta>

            <DottedDivider className="dotted-divider" />

            <ItemsTable className="items-table">
              <thead>
                <tr>
                  <th align="left" style={{ width: "45%" }}>Item</th>
                  <th align="center" style={{ width: "12%" }}>Qty</th>
                  <th align="right" className="text-right" style={{ width: "21.5%" }}>
                    Price
                  </th>
                  <th align="right" className="text-right" style={{ width: "21.5%" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => {
                  const isItemGst =
                    hasGst &&
                    item?.gst_status !== false &&
                    String(item?.gst_status) !== "false";

                  return (
                    <tr key={idx}>
                      <td>
                        {item.name}
                        {isItemGst && (
                          <span style={{ fontSize: "8.5px", fontWeight: 600, display: "block", color: "#000" }}>
                            (5% GST)
                          </span>
                        )}
                      </td>
                      <td align="center">{item.quantity}</td>
                      <td align="right" className="text-right">
                        {currency} {item.price}
                      </td>
                      <td align="right" className="text-right">
                        {currency} {item.price * item.quantity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </ItemsTable>

            <DottedDivider className="dotted-divider" />

            <TotalsTable className="totals-table">
              <tbody>
                <tr>
                  <td align="left">Subtotal</td>
                  <td align="right" style={{ fontWeight: 600 }}>
                    {currency} {order.subtotal?.toFixed(2)}
                  </td>
                </tr>
                {order.discount > 0 && (
                  <tr style={{ color: "#10b981" }}>
                    <td align="left">Discount Applied</td>
                    <td align="right" style={{ fontWeight: 600 }}>
                      -{currency} {order.discount?.toFixed(2)}
                    </td>
                  </tr>
                )}
                {hasGst && order.tax > 0 && (
                  <tr>
                    <td align="left">CGST & SGST (5%)</td>
                    <td align="right" style={{ fontWeight: 600 }}>
                      {currency} {Number(order.tax || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ padding: "2px 0" }}>
                    <DottedDivider className="dotted-divider" style={{ margin: "3px 0" }} />
                  </td>
                </tr>
                <tr className="totals grand-total" style={{ fontSize: 13, fontWeight: 800 }}>
                  <td align="left">Grand Total</td>
                  <td align="right">
                    {currency} {order.total?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </TotalsTable>

            <DottedDivider className="dotted-divider" />

            <ReceiptFooter className="receipt-footer">
              <p style={{ fontWeight: 600 }}>{invoiceFooter}</p>
              <p style={{ fontSize: "9px", marginTop: "4px" }}>Powered by Systems</p>
            </ReceiptFooter>
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

const TitleBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
`;

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
  width: ${({ $paperWidth }) => ($paperWidth === "58mm" ? "220px" : "280px")};
  max-width: 100%;
  padding: 0 6px;
  font-family: "Courier New", Courier, monospace;
  color: #1f2937;
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
`;

const ReceiptHeader = styled.div`
  text-align: center;
  h3 {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 2px;
  }
  p {
    font-size: 10.5px;
    margin: 2px 0;
    color: #4b5563;
    word-wrap: break-word;
  }
`;

const DottedDivider = styled.div`
  border-top: 1.5px dashed #a1a1aa;
  margin: 5px 0;
  width: 100%;
`;

const ReceiptMeta = styled.div`
  font-size: 10.5px;
  display: flex;
  flex-direction: column;
  gap: 2.5px;
  color: #1f2937;
  strong {
    font-weight: 700;
    color: #000;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  table-layout: fixed;
  th {
    font-weight: 700;
    padding-bottom: 4px;
    color: #111827;
    font-family: "Courier New", Courier, monospace;
  }
  td {
    padding: 3.5px 0;
    color: #1f2937;
    vertical-align: top;
    word-break: break-word;
    font-family: "Courier New", Courier, monospace;
  }
  .text-right {
    text-align: right;
  }
`;

const TotalsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  font-family: "Courier New", Courier, monospace;
  color: #1f2937;

  td {
    padding: 2px 0;
  }
`;

const ReceiptFooter = styled.div`
  text-align: center;
  font-size: 10px;
  color: #4b5563;
  p {
    margin: 2px 0;
  }
`;
