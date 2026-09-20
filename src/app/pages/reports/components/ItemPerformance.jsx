import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Input, Select, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { formatCurrency } from "../utils/reportUtils";

const ItemPerformance = ({ orders = [], itemsCatalog = [], categories = [], currency = "₹" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const itemStats = useMemo(() => {
    const map = {};

    // Map item catalog costs
    const itemCostMap = {};
    (itemsCatalog || []).forEach((item) => {
      const cost = Number(item.cost_price || item.cost || item.purchase_price || 0);
      if (item.id) itemCostMap[item.id] = cost;
      if (item.name) itemCostMap[item.name.toLowerCase()] = cost;
    });

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      (o.items || []).forEach((item) => {
        const name = item.name || item.item_name || "Unknown Item";
        const cat = item.category || item.category_name || "General";
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || 0);
        const rev = qty * price;
        const itemId = item.id || item.item_id;
        const itemNameLower = name.toLowerCase();
        const costPrice =
          Number(item.cost_price || item.cost) ||
          itemCostMap[itemId] ||
          itemCostMap[itemNameLower] ||
          0;
        const totalCost = qty * costPrice;
        const profit = rev - totalCost;

        if (!map[name]) {
          map[name] = {
            name,
            category: cat,
            qtySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }

        map[name].qtySold += qty;
        map[name].revenue += rev;
        map[name].cost += totalCost;
        map[name].profit += profit;
      });
    });

    const list = Object.values(map).map((item) => {
      const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
      return {
        ...item,
        margin,
      };
    });

    return list;
  }, [orders, itemsCatalog]);

  const filteredItems = useMemo(() => {
    return itemStats.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [itemStats, searchTerm, selectedCategory]);

  const topSelling = useMemo(
    () => [...itemStats].sort((a, b) => b.qtySold - a.qtySold).slice(0, 3),
    [itemStats]
  );
  const topRevenue = useMemo(
    () => [...itemStats].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
    [itemStats]
  );
  const topProfit = useMemo(
    () => [...itemStats].sort((a, b) => b.profit - a.profit).slice(0, 3),
    [itemStats]
  );
  const lowPerforming = useMemo(
    () => [...itemStats].sort((a, b) => a.qtySold - b.qtySold).slice(0, 3),
    [itemStats]
  );

  const columns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <ItemTitle>{text}</ItemTitle>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => <CategoryBadge>{cat}</CategoryBadge>,
    },
    {
      title: "Qty Sold",
      dataIndex: "qtySold",
      key: "qtySold",
      align: "center",
      render: (qty) => qty.toLocaleString(),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (val) => formatCurrency(val, currency),
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      align: "right",
      render: (val) => formatCurrency(val, currency),
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      align: "right",
      render: (val) => (
        <ProfitText $isPos={val >= 0}>{formatCurrency(val, currency)}</ProfitText>
      ),
    },
    {
      title: "Margin",
      dataIndex: "margin",
      key: "margin",
      align: "right",
      render: (m) => (
        <MarginBadge $isHigh={m >= 50}>{m.toFixed(1)}%</MarginBadge>
      ),
    },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Item Performance</Title>
          <SubTitle>Analysis of sales, cost, profit, and margin for each catalog item</SubTitle>
        </div>
        <FiltersRow>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
            options={[
              { label: "All Categories", value: "All" },
              ...(categories || []).map((c) => ({ label: c.name || c, value: c.name || c })),
            ]}
          />
        </FiltersRow>
      </CardHeader>

      <HighlightGrid>
        <HighlightCard $color="#3b82f6">
          <HighlightTitle>🔥 Top Selling Items</HighlightTitle>
          {topSelling.map((it, idx) => (
            <HighlightRow key={idx}>
              <span>{it.name}</span>
              <strong>{it.qtySold} sold</strong>
            </HighlightRow>
          ))}
        </HighlightCard>
        <HighlightCard $color="#01514b">
          <HighlightTitle>💰 Top Revenue Items</HighlightTitle>
          {topRevenue.map((it, idx) => (
            <HighlightRow key={idx}>
              <span>{it.name}</span>
              <strong>{formatCurrency(it.revenue, currency)}</strong>
            </HighlightRow>
          ))}
        </HighlightCard>
        <HighlightCard $color="#10b981">
          <HighlightTitle>📈 Top Profit Items</HighlightTitle>
          {topProfit.map((it, idx) => (
            <HighlightRow key={idx}>
              <span>{it.name}</span>
              <strong>{formatCurrency(it.profit, currency)}</strong>
            </HighlightRow>
          ))}
        </HighlightCard>
        <HighlightCard $color="#f59e0b">
          <HighlightTitle>⚠️ Low Performing Items</HighlightTitle>
          {lowPerforming.map((it, idx) => (
            <HighlightRow key={idx}>
              <span>{it.name}</span>
              <strong>{it.qtySold} sold</strong>
            </HighlightRow>
          ))}
        </HighlightCard>
      </HighlightGrid>

      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="name"
        pagination={{ pageSize: 8 }}
        size="small"
      />
    </CardContainer>
  );
};

export default ItemPerformance;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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

const FiltersRow = styled.div`
  display: flex;
  gap: 10px;
`;

const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  background: #f8fafc;
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const HighlightTitle = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
`;

const HighlightRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 3px;

  strong {
    color: #0f172a;
  }
`;

const ItemTitle = styled.span`
  font-weight: 600;
  color: #0f172a;
`;

const CategoryBadge = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ProfitText = styled.span`
  font-weight: 700;
  color: ${({ $isPos }) => ($isPos ? "#10b981" : "#ef4444")};
`;

const MarginBadge = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 12px;
  color: ${({ $isHigh }) => ($isHigh ? "#059669" : "#d97706")};
  background: ${({ $isHigh }) => ($isHigh ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)")};
`;
