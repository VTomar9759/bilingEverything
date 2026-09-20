import React, { useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const RevenueBreakdownCard = ({ orders = [], categories = [], currency = "₹" }) => {
  const breakdown = useMemo(() => {
    const catMap = {
      Food: 0,
      Beverages: 0,
      Desserts: 0,
      Other: 0,
    };

    let grandTotal = 0;

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      (o.items || []).forEach((item) => {
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || 0);
        const itemTotal = qty * price;
        grandTotal += itemTotal;

        const catName = String(item.category || item.category_name || "").toLowerCase();
        if (catName.includes("bev") || catName.includes("drink") || catName.includes("shake") || catName.includes("juice") || catName.includes("tea") || catName.includes("coffee")) {
          catMap.Beverages += itemTotal;
        } else if (catName.includes("dessert") || catName.includes("sweet") || catName.includes("ice cream") || catName.includes("cake")) {
          catMap.Desserts += itemTotal;
        } else if (catName.includes("food") || catName.includes("main") || catName.includes("starter") || catName.includes("snack") || catName.includes("bread") || catName.includes("rice") || catName.includes("pizza") || catName.includes("burger")) {
          catMap.Food += itemTotal;
        } else {
          // Default fallback based on item name heuristics if category name isn't explicit
          const iName = String(item.name || "").toLowerCase();
          if (iName.includes("drink") || iName.includes("coke") || iName.includes("shake") || iName.includes("water") || iName.includes("soda")) {
            catMap.Beverages += itemTotal;
          } else if (iName.includes("cake") || iName.includes("brownie") || iName.includes("ice cream") || iName.includes("kulfi")) {
            catMap.Desserts += itemTotal;
          } else {
            catMap.Food += itemTotal;
          }
        }
      });
    });

    if (grandTotal === 0) grandTotal = 1;

    const items = [
      { name: "Food Sales", amount: catMap.Food, color: "#01514b" },
      { name: "Beverages", amount: catMap.Beverages, color: "#3b82f6" },
      { name: "Desserts", amount: catMap.Desserts, color: "#f59e0b" },
      { name: "Other Sales", amount: catMap.Other, color: "#8b5cf6" },
    ];

    return {
      grandTotal,
      items: items.map((i) => ({
        ...i,
        pct: Math.round((i.amount / grandTotal) * 100),
      })),
    };
  }, [orders]);

  return (
    <CardContainer>
      <CardHeader>
        <Title>Revenue Breakdown</Title>
        <TotalText>Total: {formatCurrency(breakdown.grandTotal, currency)}</TotalText>
      </CardHeader>

      <List>
        {breakdown.items.map((item, idx) => (
          <Row key={idx}>
            <RowTop>
              <NameGroup>
                <Dot $color={item.color} />
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

export default RevenueBreakdownCard;

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
  color: #01514b;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
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
  height: 6px;
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
