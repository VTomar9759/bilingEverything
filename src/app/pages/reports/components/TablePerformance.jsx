import React, { useMemo } from "react";
import styled from "styled-components";
import { Table } from "antd";
import { formatCurrency } from "../utils/reportUtils";

const TablePerformance = ({ orders = [], tables = [], currency = "₹" }) => {
  const tableStats = useMemo(() => {
    const map = {};

    (tables || []).forEach((t) => {
      const name = t.name || t.table_no || t.code || `Table ${t.id}`;
      map[name] = {
        name,
        ordersCount: 0,
        revenue: 0,
        usageCount: 0,
      };
    });

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const tName = o.table_name || o.table_code || o.table_no || "Takeaway / Direct";
      if (!map[tName]) {
        map[tName] = {
          name: tName,
          ordersCount: 0,
          revenue: 0,
          usageCount: 0,
        };
      }
      map[tName].ordersCount++;
      map[tName].revenue += Number(o.total || 0);
      map[tName].usageCount++;
    });

    const list = Object.values(map).map((t) => {
      const avgBill = t.ordersCount > 0 ? t.revenue / t.ordersCount : 0;
      const turnover = t.ordersCount; // turnover count
      return {
        ...t,
        avgBill,
        turnover,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const highestRevenueTable = list[0] || { name: "-", revenue: 0 };
    const mostUsedTable = [...list].sort((a, b) => b.ordersCount - a.ordersCount)[0] || { name: "-", ordersCount: 0 };

    const totalTableOrders = list.reduce((acc, c) => acc + c.ordersCount, 0);
    const totalTablesCount = Math.max(list.length, 1);
    const avgTableOccupancy = Math.round(totalTableOrders / totalTablesCount);

    return {
      list,
      highestRevenueTable,
      mostUsedTable,
      avgTableOccupancy,
    };
  }, [orders, tables]);

  const columns = [
    {
      title: "Table Number / Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: "Orders",
      dataIndex: "ordersCount",
      key: "ordersCount",
      align: "center",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (val) => formatCurrency(val, currency),
    },
    {
      title: "Average Bill Value",
      dataIndex: "avgBill",
      key: "avgBill",
      align: "right",
      render: (val) => formatCurrency(val, currency),
    },
    {
      title: "Usage Count",
      dataIndex: "usageCount",
      key: "usageCount",
      align: "center",
    },
    {
      title: "Table Turnover",
      dataIndex: "turnover",
      key: "turnover",
      align: "center",
      render: (val) => `${val} turns`,
    },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Table Performance</Title>
          <SubTitle>Metrics on revenue, turnover, and utilization across dining tables</SubTitle>
        </div>
      </CardHeader>

      <HighlightRow>
        <HighlightCard $color="#01514b">
          <CardLabel>🏆 Highest Revenue Table</CardLabel>
          <CardVal>{tableStats.highestRevenueTable.name}</CardVal>
          <SubText>{formatCurrency(tableStats.highestRevenueTable.revenue, currency)}</SubText>
        </HighlightCard>
        <HighlightCard $color="#3b82f6">
          <CardLabel>🔥 Most Used Table</CardLabel>
          <CardVal>{tableStats.mostUsedTable.name}</CardVal>
          <SubText>{tableStats.mostUsedTable.ordersCount} Orders</SubText>
        </HighlightCard>
        <HighlightCard $color="#10b981">
          <CardLabel>📊 Average Table Turnover</CardLabel>
          <CardVal>{tableStats.avgTableOccupancy} Orders / Table</CardVal>
          <SubText>Average utilization</SubText>
        </HighlightCard>
      </HighlightRow>

      <Table
        dataSource={tableStats.list}
        columns={columns}
        rowKey="name"
        pagination={{ pageSize: 8 }}
        size="small"
      />
    </CardContainer>
  );
};

export default TablePerformance;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  margin-bottom: 16px;
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

const HighlightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  background: #f8fafc;
  border-top: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
  padding: 12px 14px;
  border-right: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const CardLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const CardVal = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
`;

const SubText = styled.span`
  font-size: 11px;
  color: #01514b;
  font-weight: 600;
`;
