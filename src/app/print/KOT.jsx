import React, { useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Modal, Button, Space } from "antd";
import {
  PrinterOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { printKOTSilent } from "../../services";
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
      font-family: "Courier New", Courier, monospace !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
    }

    .printable-receipt-container .receipt-header,
    .printable-receipt-container .receipt-header *,
    div[class*="ReceiptHeader"],
    div[class*="ReceiptHeader"] * {
      text-align: center !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .printable-receipt-container .dotted-divider {
      border-top: 1.5px dashed #000000 !important;
      margin: 6px 0 !important;
      width: 100% !important;
      display: block !important;
    }

    tr, .receipt-header, .receipt-meta, .dotted-divider {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  }
`;

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

  const printType = userData?.print_type || settings?.print_type || PRINT_TYPE.MODERN;
  const printConfig = PRINT_SIZE[printType] || PRINT_SIZE[PRINT_TYPE.MODERN];
  const paperWidth = settings?.paper_width || userData?.paper_width || printConfig.width;
  const modalWidth = printConfig.widthPx + 78;

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

  return (
    <>
      <PrintGlobalStyles $paperWidth={paperWidth} />
      <Modal
        open={visible}
        onCancel={onClose}
      width={modalWidth}
      centered
      footer={false}
      title={
        <TitleBox>
          <FileTextOutlined
            style={{ color: "#d97706", fontSize: 20 }}
          />
          <span>KOT</span>
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
          {businessName && (
            <ReceiptHeader className="receipt-header" style={{ textAlign: "center", width: "100%" }}>
              <p style={{ fontWeight: 600, textAlign: "center", width: "100%" }}>{businessName}</p>
            </ReceiptHeader>
          )}

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
    </>
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
  width: ${({ $paperWidth }) => ($paperWidth === "58mm" ? "220px" : "300px")};
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
