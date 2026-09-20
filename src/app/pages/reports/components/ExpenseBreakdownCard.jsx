import React, { useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const CATEGORY_ICONS = {
  "Raw Material": "🥬",
  "Salary": "👥",
  "Rent": "🏢",
  "Electricity": "⚡",
  "Gas": "🔥",
  "Packaging": "📦",
  "Maintenance": "🛠️",
  "Marketing": "📢",
  "Transportation": "🚚",
  "Other": "📝",
};

const CATEGORY_COLORS = {
  "Raw Material": "#10b981",
  "Salary": "#3b82f6",
  "Rent": "#8b5cf6",
  "Electricity": "#f59e0b",
  "Gas": "#ef4444",
  "Packaging": "#ec4899",
  "Maintenance": "#14b8a6",
  "Marketing": "#06b6d4",
  "Transportation": "#6366f1",
  "Other": "#64748b",
};

const ExpenseBreakdownCard = ({ expenses = [], currency = "₹" }) => {
  const breakdown = useMemo(() => {
    const map = {};
    let total = 0;

    expenses.forEach((e) => {
      const cat = e.category || "Other";
      const amt = Number(e.amount || 0);
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });

    const categoriesList = Object.keys(CATEGORY_COLORS);
    const items = categoriesList.map((cat) => {
      const amt = map[cat] || 0;
      const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
      return {
        name: cat,
        amount: amt,
        pct,
        icon: CATEGORY_ICONS[cat] || "📝",
        color: CATEGORY_COLORS[cat] || "#64748b",
      };
    }).sort((a, b) => b.amount - a.amount);

    return { total, items };
  }, [expenses]);

  return (
    <CardContainer>
      <CardHeader>
        <Title>Expense Breakdown</Title>
        <TotalText>Total: {formatCurrency(breakdown.total, currency)}</TotalText>
      </CardHeader>

      <List>
        {breakdown.items.map((item, idx) => (
          <Row key={idx}>
            <RowTop>
              <NameGroup>
                <IconWrap>{item.icon}</IconWrap>
                <ItemName>{item.name}</ItemName>
              </NameGroup>
              <ValueGroup>
                <ItemAmount>{formatCurrency(item.amount, currency)}</ItemAmount>
                <ItemPct>{item.pct}%</ItemPct>
              </ValueGroup>
            </RowTop>
            <ProgressBarBg>
              <ProgressBarFill $color={item.color} $width={`${item.pct}%`} />
            </ProgressBarBg>
          </Row>
        ))}
      </List>
    </CardContainer>
  );
};

export default ExpenseBreakdownCard;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const TotalText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconWrap = styled.span`
  font-size: 13px;
`;

const ItemName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #334155;
`;

const ValueGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ItemAmount = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
`;

const ItemPct = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 30px;
  text-align: right;
`;

const ProgressBarBg = styled.div`
  width: 100%;
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${({ $color }) => $color};
  width: ${({ $width }) => $width};
  border-radius: 3px;
  transition: width 0.4s ease;
`;
