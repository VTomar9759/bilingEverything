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

// const PrintGlobalStyles = createGlobalStyle`
//   @media print {
//     @page {
//       size: ${({ $paperWidth }) => $paperWidth || "80mm"} auto;
//       margin: 0mm;
//     }

//     html, body {
//       width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
//       margin: 0 !important;
//       padding: 0 !important;
//       background: #ffffff !important;
//       color: #000000 !important;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     /* Hide unnecessary UI elements during printing */
//     body * {
//       visibility: hidden !important;
//     }

//     /* Show only the receipt container and its children */
//     .printable-receipt-container,
//     .printable-receipt-container * {
//       visibility: visible !important;
//     }

//     .printable-receipt-container {
//       position: absolute !important;
//       left: 0 !important;
//       top: 0 !important;
//       width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
//       max-width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
//       min-width: ${({ $paperWidth }) => $paperWidth || "80mm"} !important;
//       margin: 0 !important;
//       padding: 4mm 3mm !important;
//       box-sizing: border-box !important;
//       background: #ffffff !important;
//       color: #000000 !important;
//       font-family: 'Courier New', Courier, monospace !important;
//       box-shadow: none !important;
//       border: none !important;
//       border-radius: 0 !important;
//     }

//     .printable-receipt-container .grand-total {
//       color: #000000 !important;
//     }

//     /* Ensure continuous flow and clean page breaks across multiple pages */
//     tr, .receipt-header, .receipt-meta, .totals-section, .receipt-footer, .dotted-divider {
//       break-inside: avoid !important;
//       page-break-inside: avoid !important;
//     }
//   }
// `;

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

  const invoicePrefix = userData?.invoice_prefix || settings?.invoice_prefix || "INV";
  const paperWidth = settings?.paper_width || userData?.paper_width || "80mm";
  const currency = userData?.currency || settings?.currency || "₹";

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
      {/* <PrintGlobalStyles $paperWidth={paperWidth} /> */}
      <Modal
        open={visible}
        onCancel={onClose}
        width={360}
        centered
        footer={false}
        title={
          <TitleBox>
            <FileTextOutlined
              style={{ color: "var(--color-primary-light)", fontSize: 20 }}
            />
            <span>Order Invoice</span>
          </TitleBox>
        }
      >
        <ReceiptOuter>
          <ReceiptPaper ref={receiptRef} id="receipt" className="printable-receipt-container" $paperWidth={paperWidth}>
            <ReceiptHeader className="receipt-header">
              <h3>{businessName}</h3>
              <p>{address}</p>
              {hasGst && <p>GSTIN: {gstNumber}</p>}
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
              {order.table_name && (
                <div>
                  <strong>Table:</strong> {order.table_name}
                </div>
              )}
              <div>
                <strong>Status:</strong> INVOICED
              </div>
            </ReceiptMeta>

            <DottedDivider className="dotted-divider" />

            <ItemsTable>
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
                          <span style={{ fontSize: "8.5px", opacity: 0.75, display: "block", color: "#666" }}>
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

            <TotalsSection className="totals-section">
              <TotalRow>
                <span>Subtotal</span>
                <span>
                  {currency} {order.subtotal?.toFixed(2)}
                </span>
              </TotalRow>
              {order.discount > 0 && (
                <TotalRow $discount>
                  <span>Discount Applied</span>
                  <span>
                    -{currency} {order.discount?.toFixed(2)}
                  </span>
                </TotalRow>
              )}
              {hasGst && (
                <TotalRow>
                  <span>CGST & SGST (5%)</span>
                  <span>
                    {currency} {Number(order.tax || 0).toFixed(2)}
                  </span>
                </TotalRow>
              )}
              <DottedDivider className="dotted-divider" style={{ margin: "5px 0" }} />
              <TotalRow
                className="totals grand-total"
                style={{ fontSize: 14, color: "var(--color-primary)" }}
              >
                <span>Grand Total</span>
                <span>
                  {currency} {order.total?.toFixed(2)}
                </span>
              </TotalRow>
            </TotalsSection>

            <DottedDivider className="dotted-divider" />

            <ReceiptFooter className="receipt-footer">
              <p>{invoiceFooter}</p>
              <p style={{ fontSize: "9px", opacity: 0.75, marginTop: "4px" }}>Powered by Systems</p>
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

const TotalsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3.5px;
  font-size: 11px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-weight: ${({ className }) =>
    className?.includes("totals") ? "700" : "500"};
  color: ${({ $discount }) => ($discount ? "#10b981" : "#1f2937")};
`;

const ReceiptFooter = styled.div`
  text-align: center;
  font-size: 10px;
  color: #4b5563;
  p {
    margin: 2px 0;
  }
`;
