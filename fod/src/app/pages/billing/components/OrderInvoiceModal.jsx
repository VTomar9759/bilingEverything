import React, { useRef } from "react";
import styled from "styled-components";
import { Modal, Button } from "antd";
import { PrinterOutlined, CheckCircleOutlined } from "@ant-design/icons";

const OrderInvoiceModal = ({ visible, onClose, order, settings }) => {
  const receiptRef = useRef();

  if (!order) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Create printable window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0 0 5px; }
            .header p { margin: 2px 0; font-size: 12px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; }
            td { padding: 4px 0; }
            .text-right { text-align: right; }
            .totals { font-weight: bold; font-size: 13px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div>${printContent}</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currency = settings?.currency || "Rs.";
  const taxRate = settings?.tax_rate || 18;
  const serviceRate = settings?.service_charge_rate || 5;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ background: "var(--color-primary-light)" }}
        >
          Print Invoice
        </Button>
      ]}
      width={400}
      centered
      title={
        <TitleBox>
          <CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} />
          <span>Receipt Settle Success</span>
        </TitleBox>
      }
    >
      <ReceiptOuter>
        <ReceiptPaper ref={receiptRef}>
          <ReceiptHeader className="header">
            <h3>{settings?.restaurant_name || "Delight Cafe"}</h3>
            <p>{settings?.address || "101, Gourmet Ave, Food District"}</p>
            <p>GSTIN: 07AAAAA1111A1Z1</p>
          </ReceiptHeader>

          <DottedDivider className="divider" />

          <ReceiptMeta>
            <div>
              <strong>Order ID:</strong> #{order.id}
            </div>
            <div>
              <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
            </div>
            {order.table_name && (
              <div>
                <strong>Table:</strong> {order.table_name}
              </div>
            )}
            <div>
              <strong>Status:</strong> PAID ({order.payment_method})
            </div>
          </ReceiptMeta>

          <DottedDivider className="divider" />

          <ItemsTable>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="center">Qty</th>
                <th align="right" className="text-right">Price</th>
                <th align="right" className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td align="center">{item.quantity}</td>
                  <td align="right" className="text-right">
                    {currency} {item.price}
                  </td>
                  <td align="right" className="text-right">
                    {currency} {item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </ItemsTable>

          <DottedDivider className="divider" />

          <TotalsSection>
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
            <TotalRow>
              <span>CGST & SGST ({taxRate}%)</span>
              <span>
                {currency} {order.tax?.toFixed(2)}
              </span>
            </TotalRow>
            {serviceRate > 0 && (
              <TotalRow>
                <span>Service Charge ({serviceRate}%)</span>
                <span>
                  {currency} {order.service_charge?.toFixed(2)}
                </span>
              </TotalRow>
            )}
            <DottedDivider className="divider" style={{ margin: "5px 0" }} />
            <TotalRow className="totals" style={{ fontSize: 16, color: "var(--color-primary)" }}>
              <span>Grand Total</span>
              <span>
                {currency} {order.total?.toFixed(2)}
              </span>
            </TotalRow>
          </TotalsSection>

          <DottedDivider className="divider" />

          <ReceiptFooter className="footer">
            <p>Thank You For Dining With Us!</p>
            <p>Power by Systems</p>
          </ReceiptFooter>
        </ReceiptPaper>
      </ReceiptOuter>
    </Modal>
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
  background: var(--color-bg);
  padding: 16px;
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: center;
`;

const ReceiptPaper = styled.div`
  background: white;
  width: 100%;
  max-width: 320px;
  padding: 24px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: "Courier New", Courier, monospace;
  color: #1f2937;
  border-radius: 4px;
  position: relative;
`;

const ReceiptHeader = styled.div`
  text-align: center;
  h3 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #111827;
  }
  p {
    font-size: 11px;
    margin: 2px 0;
    color: #6b7280;
  }
`;

const DottedDivider = styled.div`
  border-top: 1.5px dashed #d1d5db;
  margin: 12px 0;
  width: 100%;
`;

const ReceiptMeta = styled.div`
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #374151;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  th {
    font-weight: 700;
    padding-bottom: 6px;
    color: #111827;
  }
  td {
    padding: 6px 0;
    color: #374151;
    vertical-align: top;
  }
  .text-right {
    text-align: right;
  }
`;

const TotalsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: ${({ className }) => (className?.includes("totals") ? "700" : "500")};
  color: ${({ $discount }) => ($discount ? "#10b981" : "#374151")};
`;

const ReceiptFooter = styled.div`
  text-align: center;
  font-size: 10px;
  color: #6b7280;
  p {
    margin: 2px 0;
  }
`;
