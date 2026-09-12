import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Modal, Button, Space } from "antd";
import {
  PrinterOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { printKOTSilent } from "../../services";
import useOrgData from "../hooks/useOrgData";

const KOT = ({ visible, onClose, order, settings }) => {
  const receiptRef = useRef();
  const [loadingPrint, setLoadingPrint] = useState(false);
  const { userData } = useOrgData();

  if (!order) return null;

  const getCleanName = (name) => {
    if (!name || typeof name !== "string") return "";
    if (name.includes("@")) return "";
    return name.trim();
  };

  const rawBusinessName =
    userData?.business_name ||
    userData?.legal_name ||
    settings?.restaurant_name ||
    settings?.business_name;

  const businessName = getCleanName(rawBusinessName);

  const paperWidth = settings?.paper_width || userData?.paper_width || "80mm";

  const getFormattedOrderNo = () => {
    if (!order) return "";
    return order.order_number ?? order.order_no ?? order.id ?? "";
  };

  const handlePrint = async () => {
    setLoadingPrint(true);
    await printKOTSilent({
      order,
      settings: {
        ...settings,
        restaurant_name: businessName,
        paper_width: paperWidth,
      },
      copies: 1,
      receiptElement: receiptRef.current,
    });
    setLoadingPrint(false);
  };

  const handleDownloadText = () => {
    if (!order) return;
    let text = "";
    text += "=========================================\n";
    text += `       KITCHEN ORDER TICKET (KOT)\n`;
    if (businessName) {
      text += `       ${businessName}\n`;
    }
    text += "=========================================\n\n";
    text += `Order No:   #${getFormattedOrderNo()}\n`;
    text += `Table:      ${order.table_name || "Takeaway"}\n`;
    text += `Date:       ${
      order.created_at && !isNaN(new Date(order.created_at).getTime())
        ? new Date(order.created_at).toLocaleString()
        : new Date().toLocaleString()
    }\n`;
    text += "-----------------------------------------\n";
    text += "Item Name                              Qty\n";
    text += "-----------------------------------------\n";
    order.items?.forEach((item) => {
      const name = (item.name || "").padEnd(32).substring(0, 32);
      const qty = (item.quantity || 0).toString().padStart(6);
      text += `${name} ${qty}\n`;
    });
    text += "-----------------------------------------\n";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KOT_${getFormattedOrderNo()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={360}
      centered
      footer={false}
      title={
        <TitleBox>
          <FileTextOutlined
            style={{ color: "#d97706", fontSize: 20 }}
          />
          <span>Kitchen Order Ticket (KOT)</span>
        </TitleBox>
      }
    >
      <ReceiptOuter>
        <ReceiptPaper
          ref={receiptRef}
          id="kot-receipt"
          className="printable-receipt-container"
          $paperWidth={paperWidth}
        >
          <ReceiptHeader className="receipt-header">
            <h3 style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
              KITCHEN ORDER TICKET
            </h3>
            {businessName && <p style={{ fontWeight: 600 }}>{businessName}</p>}
          </ReceiptHeader>

          <DottedDivider className="dotted-divider" />

          <ReceiptMeta className="receipt-meta">
            <div>
              <strong>Order No:</strong> #{getFormattedOrderNo()}
            </div>
            <div>
              <strong>Table:</strong> {order.table_number ? `Table ${order.table_number}` : (order.table_name || "Takeaway")}
            </div>
            <div>
              <strong>Date:</strong>{" "}
              {order.created_at && !isNaN(new Date(order.created_at).getTime())
                ? new Date(order.created_at).toLocaleString()
                : new Date().toLocaleString()}
            </div>
          </ReceiptMeta>

          <DottedDivider className="dotted-divider" />

          <ItemsTable>
            <thead>
              <tr>
                <th align="left" style={{ width: "75%" }}>
                  Item
                </th>
                <th align="center" style={{ width: "25%" }}>
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td
                    align="center"
                    style={{ fontWeight: 700, fontSize: "12px" }}
                  >
                    x{item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </ItemsTable>

          <DottedDivider className="dotted-divider" />
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
            borderColor: "#f59e0b",
            color: "#d97706",
          }}
        >
          Download KOT
        </Button>
        <Button
          key="print"
          type="primary"
          loading={loadingPrint}
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ background: "#d97706", borderColor: "#d97706" }}
        >
          Print KOT
        </Button>
      </Space>
    </Modal>
  );
};

export default KOT;

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
    padding: 4px 0;
    color: #1f2937;
    vertical-align: top;
    word-break: break-word;
    font-family: "Courier New", Courier, monospace;
  }
`;
