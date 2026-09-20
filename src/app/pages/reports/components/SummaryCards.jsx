import React from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const SummaryCards = ({ summaryData, currency = "₹", loading = false }) => {
  if (loading) {
    return (
      <CardsGrid>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonHeader />
            <SkeletonValue />
            <SkeletonSub />
          </SkeletonCard>
        ))}
      </CardsGrid>
    );
  }

  const {
    totalSales = 0,
    salesChange = 0,
    totalOrders = 0,
    ordersChange = 0,
    totalExpenses = 0,
    expensesChange = 0,
    grossProfit = 0,
    profitChange = 0,
    profitMargin = 0,
    marginChange = 0,
    gstCollected = 0,
    gstChange = 0,
  } = summaryData || {};

  const cardsConfig = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSales, currency),
      change: salesChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "#01514b",
      bgColor: "rgba(1, 81, 75, 0.08)",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      change: ordersChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.08)",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses, currency),
      change: expensesChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.08)",
    },
    {
      label: "Gross Profit",
      value: formatCurrency(grossProfit, currency),
      change: profitChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.08)",
    },
    {
      label: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      change: marginChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "GST Collected",
      value: formatCurrency(gstCollected, currency),
      change: gstChange,
      changeText: "vs previous period",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)",
    },
  ];

  return (
    <CardsGrid>
      {cardsConfig.map((card, idx) => {
        const isPos = card.change >= 0;
        return (
          <Card key={idx}>
            <CardTop>
              <IconBox $color={card.color} $bgColor={card.bgColor}>
                {card.icon}
              </IconBox>
              <Badge $isPos={isPos}>
                {isPos ? "+" : ""}
                {card.change.toFixed(1)}%
              </Badge>
            </CardTop>
            <CardLabel>{card.label}</CardLabel>
            <CardValue>{card.value}</CardValue>
            <CardSubText>{card.changeText}</CardSubText>
          </Card>
        );
      })}
    </CardsGrid>
  );
};

export default SummaryCards;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    box-shadow: 0 4px 12px rgba(1, 81, 75, 0.08);
    transform: translateY(-1px);
    border-color: rgba(1, 81, 75, 0.2);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  background: ${({ $bgColor }) => $bgColor};
`;

const Badge = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  color: ${({ $isPos }) => ($isPos ? "#059669" : "#dc2626")};
  background: ${({ $isPos }) => ($isPos ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)")};
`;

const CardLabel = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  margin-bottom: 4px;
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary, #0f172a);
  letter-spacing: -0.3px;
  margin-bottom: 2px;
`;

const CardSubText = styled.span`
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
`;

const SkeletonCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const SkeletonHeader = styled.div`
  width: 36px;
  height: 36px;
  background: #e2e8f0;
  border-radius: 8px;
`;

const SkeletonValue = styled.div`
  width: 70%;
  height: 20px;
  background: #cbd5e1;
  border-radius: 4px;
`;

const SkeletonSub = styled.div`
  width: 40%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 4px;
`;
