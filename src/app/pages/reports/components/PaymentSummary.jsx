import React, { useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const PAYMENT_CONFIG = [
  { name: "Cash", key: "Cash", color: "#10b981", icon: "💵" },
  { name: "Card", key: "Card", color: "#3b82f6", icon: "💳" },
  { name: "UPI / Online", key: "UPI", color: "#8b5cf6", icon: "📱" },
  { name: "Other", key: "Other", color: "#f59e0b", icon: "🧾" },
];

const PaymentSummary = ({ orders = [], currency = "₹" }) => {
  const stats = useMemo(() => {
    const map = {
      Cash: { count: 0, amount: 0 },
      Card: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      Other: { count: 0, amount: 0 },
    };

    let totalCollected = 0;
    let pendingAmount = 0;
    let refundedAmount = 0;

    orders.forEach((o) => {
      const mode = (o.payment_mode || o.payment_method || "Cash").toUpperCase();
      const status = (o.status || "").toLowerCase();
      const payStatus = (o.payment_status || "").toLowerCase();
      const amt = Number(o.total || 0);

      if (status === "refunded") {
        refundedAmount += amt;
        return;
      }
      if (status === "cancelled") return;

      if (payStatus === "unpaid" || payStatus === "pending") {
        pendingAmount += amt;
      } else {
        totalCollected += amt;
      }

      if (mode.includes("CASH")) {
        map.Cash.count++;
        map.Cash.amount += amt;
      } else if (mode.includes("CARD")) {
        map.Card.count++;
        map.Card.amount += amt;
      } else if (mode.includes("UPI") || mode.includes("ONLINE") || mode.includes("GPAY") || mode.includes("PAYTM") || mode.includes("PHONEPE")) {
        map.UPI.count++;
        map.UPI.amount += amt;
      } else {
        map.Other.count++;
        map.Other.amount += amt;
      }
    });

    const denom = totalCollected > 0 ? totalCollected : 1;

    const breakdown = PAYMENT_CONFIG.map((cfg) => {
      const data = map[cfg.key] || { count: 0, amount: 0 };
      const pct = Math.round((data.amount / denom) * 100);
      return {
        ...cfg,
        count: data.count,
        amount: data.amount,
        pct,
      };
    });

    return {
      totalCollected,
      pendingAmount,
      refundedAmount,
      breakdown,
    };
  }, [orders]);

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Payment Summary</Title>
          <SubTitle>Breakdown of collections by payment mode and transaction status</SubTitle>
        </div>
      </CardHeader>

      <OverviewRow>
        <MiniCard $color="#01514b">
          <MiniLabel>Total Collected</MiniLabel>
          <MiniVal>{formatCurrency(stats.totalCollected, currency)}</MiniVal>
        </MiniCard>
        <MiniCard $color="#f59e0b">
          <MiniLabel>Pending Amount</MiniLabel>
          <MiniVal>{formatCurrency(stats.pendingAmount, currency)}</MiniVal>
        </MiniCard>
        <MiniCard $color="#ef4444">
          <MiniLabel>Refunded Amount</MiniLabel>
          <MiniVal>{formatCurrency(stats.refundedAmount, currency)}</MiniVal>
        </MiniCard>
      </OverviewRow>

      <GridList>
        {stats.breakdown.map((item, idx) => (
          <PaymentCard key={idx}>
            <PaymentHeader>
              <IconTitle>
                <Icon>{item.icon}</Icon>
                <ItemName>{item.name}</ItemName>
              </IconTitle>
              <PctBadge $color={item.color}>{item.pct}%</PctBadge>
            </PaymentHeader>

            <Amount>{formatCurrency(item.amount, currency)}</Amount>
            <SubDetails>{item.count} Transactions</SubDetails>

            <ProgressBarBg>
              <ProgressBarFill $color={item.color} $width={`${item.pct}%`} />
            </ProgressBarBg>
          </PaymentCard>
        ))}
      </GridList>
    </CardContainer>
  );
};

export default PaymentSummary;

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

const OverviewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MiniCard = styled.div`
  background: #f8fafc;
  border-top: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
  padding: 12px;
  border-right: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const MiniLabel = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
`;

const MiniVal = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 2px;
`;

const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const IconTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Icon = styled.span`
  font-size: 14px;
`;

const ItemName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #334155;
`;

const PctBadge = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 10px;
`;

const Amount = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 2px;
`;

const SubDetails = styled.span`
  font-size: 10.5px;
  color: #94a3b8;
  margin-bottom: 10px;
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
`;
