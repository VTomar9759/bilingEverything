import React, { useMemo } from "react";
import styled from "styled-components";
import { Table } from "antd";
import { formatCurrency } from "../utils/reportUtils";

export const getTableDisplayName = (item) => {
  if (!item) return "Takeaway / Direct";

  const num = String(item.table_number || item.table_no || item.table_code || item.code || "").trim();
  let name = String(item.table_name || item.name || "").trim();

  // If name contains raw UUID like "Table 80153d7b-639d-4ba4-a450-55729e8c3a34", strip it out
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(name)) {
    name = "";
  }

  if (num && name) {
    const numLower = num.toLowerCase();
    const nameLower = name.toLowerCase();

    if (nameLower === numLower || nameLower.startsWith(numLower + " ") || nameLower.startsWith(numLower + "-")) {
      return name;
    }
    return `${num} ${name}`;
  }

  if (num) return num;
  if (name) return name;

  if (item.id && typeof item.id === "string" && !uuidPattern.test(item.id)) {
    return `Table ${item.id}`;
  }

  return "Table";
};

const TablePerformance = ({ orders = [], tables = [], currency = "₹" }) => {
  const tableStats = useMemo(() => {
    const map = {};
    const tableById = {};
    const tableByNum = {};

    (tables || []).forEach((t) => {
      const displayName = getTableDisplayName(t);
      const entry = {
        id: t.id,
        name: displayName,
        ordersCount: 0,
        revenue: 0,
        usageCount: 0,
      };
      const mapKey = t.id || displayName;
      map[mapKey] = entry;

      if (t.id) tableById[t.id] = entry;
      const numKey = (t.table_number || t.table_no || t.code || "").trim();
      if (numKey) tableByNum[numKey] = entry;
      const nameKey = (t.table_name || t.name || "").trim();
      if (nameKey) tableByNum[nameKey] = entry;
    });

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;

      let targetEntry = null;

      if (o.table_id && tableById[o.table_id]) {
        targetEntry = tableById[o.table_id];
      } else {
        const oNum = (o.table_number || o.table_no || o.table_code || "").trim();
        const oName = (o.table_name || "").trim();

        if (oNum && tableByNum[oNum]) {
          targetEntry = tableByNum[oNum];
        } else if (oName && tableByNum[oName]) {
          targetEntry = tableByNum[oName];
        }
      }

      if (!targetEntry) {
        const isTakeaway =
          !o.table_id &&
          !o.table_name &&
          !o.table_number &&
          !o.table_no &&
          !o.table_code;

        const displayName = isTakeaway
          ? "Takeaway / Direct"
          : getTableDisplayName(o);

        const key = o.table_id || displayName;
        if (!map[key]) {
          map[key] = {
            id: o.table_id,
            name: displayName,
            ordersCount: 0,
            revenue: 0,
            usageCount: 0,
          };
        }
        targetEntry = map[key];
      }

      targetEntry.ordersCount++;
      targetEntry.revenue += Number(o.total || 0);
      targetEntry.usageCount++;
    });

    const list = Object.values(map)
      .map((t) => {
        const avgBill = t.ordersCount > 0 ? t.revenue / t.ordersCount : 0;
        const turnover = t.ordersCount; // turnover count
        return {
          ...t,
          avgBill,
          turnover,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const highestRevenueTable = list[0] || { name: "-", revenue: 0 };
    const mostUsedTable =
      [...list].sort((a, b) => b.ordersCount - a.ordersCount)[0] || {
        name: "-",
        ordersCount: 0,
      };

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

      {/* Desktop Table View */}
      <DesktopTableView>
        <Table
          dataSource={tableStats.list}
          columns={columns}
          rowKey={(record, index) => record.id || record.name || index}
          pagination={{ pageSize: 8 }}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </DesktopTableView>

      {/* Mobile Cards View */}
      <MobileCardView>
        {tableStats.list.length === 0 ? (
          <NoDataNotice>No table metrics available</NoDataNotice>
        ) : (
          tableStats.list.map((tableItem, idx) => (
            <TableMobileCard key={idx}>
              <CardTopRow>
                <TableNameGroup>
                  <TableIconBadge>🍽️</TableIconBadge>
                  <TableNameText>{tableItem.name}</TableNameText>
                </TableNameGroup>
                <RevenueBadge>{formatCurrency(tableItem.revenue, currency)}</RevenueBadge>
              </CardTopRow>

              <CardMetricsGrid>
                <MetricItem>
                  <MetricLabel>Orders</MetricLabel>
                  <MetricVal>{tableItem.ordersCount}</MetricVal>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Avg Bill</MetricLabel>
                  <MetricVal>{formatCurrency(tableItem.avgBill, currency)}</MetricVal>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Usage Count</MetricLabel>
                  <MetricVal>{tableItem.usageCount}</MetricVal>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Turnover</MetricLabel>
                  <MetricVal>{tableItem.turnover} turns</MetricVal>
                </MetricItem>
              </CardMetricsGrid>
            </TableMobileCard>
          ))
        )}
      </MobileCardView>
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

  @media (max-width: 720px) {
    padding: 12px 10px;
  }
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

const DesktopTableView = styled.div`
  @media (max-width: 720px) {
    display: none;
  }
`;

const MobileCardView = styled.div`
  display: none;
  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const TableMobileCard = styled.div`
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 10px;
`;

const TableNameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableIconBadge = styled.div`
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TableNameText = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
`;

const RevenueBadge = styled.div`
  background: #e6f4f2;
  color: #01514b;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
`;

const CardMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
`;

const MetricLabel = styled.span`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
`;

const MetricVal = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 2px;
`;

const NoDataNotice = styled.div`
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`;
