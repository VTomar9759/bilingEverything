import React, { useMemo } from "react";
import styled from "styled-components";
import { Button, Table } from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { formatCurrency, exportToCSV, triggerPrintReport } from "../utils/reportUtils";

const GstTaxReport = ({ orders = [], currency = "₹", gstin = "" }) => {
  const gstData = useMemo(() => {
    let taxableSales = 0;
    let gstCollected = 0;
    let nonTaxableSales = 0;

    const list = [];

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const total = Number(o.total || 0);
      const tax = Number(o.tax || 0);
      const sub = Number(o.subtotal || total - tax);

      if (tax > 0) {
        taxableSales += sub;
        gstCollected += tax;
      } else {
        nonTaxableSales += total;
      }

      const cgst = tax / 2;
      const sgst = tax / 2;
      const igst = 0;

      const invNo = o.invoice_number || o.invoice_no || `INV-${o.id || o.order_number}`;
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString() : "-";

      list.push({
        key: o.id || invNo,
        invoice: invNo,
        date: dateStr,
        taxableAmount: sub,
        cgst,
        sgst,
        igst,
        totalGst: tax,
        totalInvoice: total,
      });
    });

    const cgst = gstCollected / 2;
    const sgst = gstCollected / 2;
    const igst = 0;

    return {
      taxableSales,
      gstCollected,
      cgst,
      sgst,
      igst,
      nonTaxableSales,
      list,
    };
  }, [orders]);

  const handleExportCSV = () => {
    const headers = [
      "Invoice #",
      "Date",
      "Taxable Amount",
      "CGST (2.5%)",
      "SGST (2.5%)",
      "Total GST",
      "Total Invoice",
    ];
    const rows = gstData.list.map((r) => [
      r.invoice,
      r.date,
      r.taxableAmount.toFixed(2),
      r.cgst.toFixed(2),
      r.sgst.toFixed(2),
      r.totalGst.toFixed(2),
      r.totalInvoice.toFixed(2),
    ]);
    exportToCSV("GST_Tax_Report", headers, rows);
  };

  const handlePrint = () => {
    triggerPrintReport("GST & Tax Report", "gst-report-table-area");
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoice",
      key: "invoice",
      render: (inv) => <strong>{inv}</strong>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Taxable Amount",
      dataIndex: "taxableAmount",
      key: "taxableAmount",
      align: "right",
      render: (v) => formatCurrency(v, currency),
    },
    {
      title: "CGST (2.5%)",
      dataIndex: "cgst",
      key: "cgst",
      align: "right",
      render: (v) => formatCurrency(v, currency),
    },
    {
      title: "SGST (2.5%)",
      dataIndex: "sgst",
      key: "sgst",
      align: "right",
      render: (v) => formatCurrency(v, currency),
    },
    {
      title: "Total GST",
      dataIndex: "totalGst",
      key: "totalGst",
      align: "right",
      render: (v) => <strong style={{ color: "#f59e0b" }}>{formatCurrency(v, currency)}</strong>,
    },
    {
      title: "Total Invoice",
      dataIndex: "totalInvoice",
      key: "totalInvoice",
      align: "right",
      render: (v) => <strong>{formatCurrency(v, currency)}</strong>,
    },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>GST & Tax Report</Title>
          <SubTitle>GSTIN: {gstin || "Not Registered"} | Breakdown of taxable sales & tax liability</SubTitle>
        </div>
        <ActionButtons>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export GST Report
          </Button>
          <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint} style={{ background: "#01514b" }}>
            Print GST Report
          </Button>
        </ActionButtons>
      </CardHeader>

      <MetricsGrid>
        <MetricBox>
          <Label>Taxable Sales</Label>
          <Val>{formatCurrency(gstData.taxableSales, currency)}</Val>
        </MetricBox>
        <MetricBox $color="#f59e0b">
          <Label>Total GST Collected</Label>
          <Val>{formatCurrency(gstData.gstCollected, currency)}</Val>
        </MetricBox>
        <MetricBox>
          <Label>CGST (2.5%)</Label>
          <Val>{formatCurrency(gstData.cgst, currency)}</Val>
        </MetricBox>
        <MetricBox>
          <Label>SGST (2.5%)</Label>
          <Val>{formatCurrency(gstData.sgst, currency)}</Val>
        </MetricBox>
        <MetricBox>
          <Label>IGST</Label>
          <Val>{formatCurrency(gstData.igst, currency)}</Val>
        </MetricBox>
        <MetricBox>
          <Label>Non-Taxable Sales</Label>
          <Val>{formatCurrency(gstData.nonTaxableSales, currency)}</Val>
        </MetricBox>
      </MetricsGrid>

      <div id="gst-report-table-area">
        <Table
          dataSource={gstData.list}
          columns={columns}
          pagination={{ pageSize: 8 }}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </div>
    </CardContainer>
  );
};

export default GstTaxReport;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  @media (max-width: 720px) {
    padding: 12px 10px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 11.5px;
  color: #64748b;
  margin: 2px 0 0 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
`;

const Label = styled.span`
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
  display: block;
`;

const Val = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${({ $color }) => $color || "#0f172a"};
  margin-top: 2px;
`;
