import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const SalesProfitChart = ({ orders = [], expenses = [], currency = "₹" }) => {
  const [periodView, setPeriodView] = useState("Weekly"); // Daily, Weekly, Monthly, Yearly
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartData = useMemo(() => {
    const now = new Date();
    if (periodView === "Daily") {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toISOString().slice(0, 10);
        days.push({ label, dateStr, rev: 0, exp: 0, profit: 0 });
      }

      orders.forEach((o) => {
        if (o.status === "Cancelled") return;
        const dStr = o.created_at ? o.created_at.slice(0, 10) : "";
        const target = days.find((x) => x.dateStr === dStr);
        if (target) target.rev += Number(o.total || 0);
      });

      expenses.forEach((e) => {
        const dStr = e.expense_date ? e.expense_date.slice(0, 10) : "";
        const target = days.find((x) => x.dateStr === dStr);
        if (target) target.exp += Number(e.amount || 0);
      });

      days.forEach((item) => {
        item.profit = Math.max(0, item.rev - item.exp);
      });
      return days;
    } else if (periodView === "Weekly") {
      // Last 4 weeks
      const weeks = [
        { label: "Week 1", rev: 0, exp: 0, profit: 0 },
        { label: "Week 2", rev: 0, exp: 0, profit: 0 },
        { label: "Week 3", rev: 0, exp: 0, profit: 0 },
        { label: "Week 4", rev: 0, exp: 0, profit: 0 },
      ];

      orders.forEach((o) => {
        if (o.status === "Cancelled") return;
        const d = new Date(o.created_at);
        if (isNaN(d)) return;
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const idx = 3 - Math.floor(diffDays / 7);
          if (weeks[idx]) weeks[idx].rev += Number(o.total || 0);
        }
      });

      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        if (isNaN(d)) return;
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const idx = 3 - Math.floor(diffDays / 7);
          if (weeks[idx]) weeks[idx].exp += Number(e.amount || 0);
        }
      });

      weeks.forEach((w) => {
        w.profit = Math.max(0, w.rev - w.exp);
      });
      return weeks;
    } else if (periodView === "Monthly") {
      // Last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months.push({ label, monthYear, rev: 0, exp: 0, profit: 0 });
      }

      orders.forEach((o) => {
        if (o.status === "Cancelled") return;
        const d = new Date(o.created_at);
        if (isNaN(d)) return;
        const my = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const target = months.find((m) => m.monthYear === my);
        if (target) target.rev += Number(o.total || 0);
      });

      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        if (isNaN(d)) return;
        const my = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const target = months.find((m) => m.monthYear === my);
        if (target) target.exp += Number(e.amount || 0);
      });

      months.forEach((m) => {
        m.profit = Math.max(0, m.rev - m.exp);
      });
      return months;
    } else {
      // Yearly (Last 3 years)
      const currYear = now.getFullYear();
      const years = [
        { label: String(currYear - 2), rev: 0, exp: 0, profit: 0 },
        { label: String(currYear - 1), rev: 0, exp: 0, profit: 0 },
        { label: String(currYear), rev: 0, exp: 0, profit: 0 },
      ];

      orders.forEach((o) => {
        if (o.status === "Cancelled") return;
        const d = new Date(o.created_at);
        if (isNaN(d)) return;
        const yr = String(d.getFullYear());
        const target = years.find((y) => y.label === yr);
        if (target) target.rev += Number(o.total || 0);
      });

      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        if (isNaN(d)) return;
        const yr = String(d.getFullYear());
        const target = years.find((y) => y.label === yr);
        if (target) target.exp += Number(e.amount || 0);
      });

      years.forEach((y) => {
        y.profit = Math.max(0, y.rev - y.exp);
      });
      return years;
    }
  }, [orders, expenses, periodView]);

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.rev, d.exp, d.profit)),
    100
  ) * 1.15;

  const totalRev = chartData.reduce((acc, c) => acc + c.rev, 0);
  const totalExp = chartData.reduce((acc, c) => acc + c.exp, 0);
  const totalProfit = Math.max(0, totalRev - totalExp);

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Sales & Profit Overview</Title>
          <SubTitle>Compare Revenue, Expenses, and Profit across periods</SubTitle>
        </div>
        <ViewSelector>
          {["Daily", "Weekly", "Monthly", "Yearly"].map((v) => (
            <ViewBtn
              key={v}
              $active={periodView === v}
              onClick={() => setPeriodView(v)}
            >
              {v}
            </ViewBtn>
          ))}
        </ViewSelector>
      </CardHeader>

      <MetricsRow>
        <MetricItem>
          <Dot $color="#01514b" />
          <MetricLabel>Revenue</MetricLabel>
          <MetricValue>{formatCurrency(totalRev, currency)}</MetricValue>
        </MetricItem>
        <MetricItem>
          <Dot $color="#ef4444" />
          <MetricLabel>Expenses</MetricLabel>
          <MetricValue>{formatCurrency(totalExp, currency)}</MetricValue>
        </MetricItem>
        <MetricItem>
          <Dot $color="#10b981" />
          <MetricLabel>Profit</MetricLabel>
          <MetricValue>{formatCurrency(totalProfit, currency)}</MetricValue>
        </MetricItem>
      </MetricsRow>

      {/* SVG Bar Chart */}
      <ChartWrapper>
        <SvgChart viewBox="0 0 500 180" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line
              key={i}
              x1="0"
              y1={150 - pct * 130}
              x2="500"
              y2={150 - pct * 130}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Render Groups */}
          {chartData.map((d, i) => {
            const groupWidth = 500 / chartData.length;
            const centerX = i * groupWidth + groupWidth / 2;

            const barW = Math.min(16, groupWidth / 4);
            const revH = (d.rev / maxVal) * 130;
            const expH = (d.exp / maxVal) * 130;
            const prfH = (d.profit / maxVal) * 130;

            const revY = 150 - revH;
            const expY = 150 - expH;
            const prfY = 150 - prfH;

            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Revenue Bar */}
                <rect
                  x={centerX - barW * 1.6}
                  y={revY}
                  width={barW}
                  height={revH}
                  fill="#01514b"
                  rx="3"
                  opacity={isHovered ? 1 : 0.9}
                />
                {/* Expense Bar */}
                <rect
                  x={centerX - barW * 0.5}
                  y={expY}
                  width={barW}
                  height={expH}
                  fill="#ef4444"
                  rx="3"
                  opacity={isHovered ? 1 : 0.9}
                />
                {/* Profit Bar */}
                <rect
                  x={centerX + barW * 0.6}
                  y={prfY}
                  width={barW}
                  height={prfH}
                  fill="#10b981"
                  rx="3"
                  opacity={isHovered ? 1 : 0.9}
                />

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y="168"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </SvgChart>

        {hoveredIdx !== null && (
          <TooltipBox style={{ left: `${((hoveredIdx + 0.5) / chartData.length) * 100}%` }}>
            <TooltipHeader>{chartData[hoveredIdx].label}</TooltipHeader>
            <TooltipLine $color="#01514b">
              Sales: {formatCurrency(chartData[hoveredIdx].rev, currency)}
            </TooltipLine>
            <TooltipLine $color="#ef4444">
              Expenses: {formatCurrency(chartData[hoveredIdx].exp, currency)}
            </TooltipLine>
            <TooltipLine $color="#10b981">
              Profit: {formatCurrency(chartData[hoveredIdx].profit, currency)}
            </TooltipLine>
          </TooltipBox>
        )}
      </ChartWrapper>
    </CardContainer>
  );
};

export default SalesProfitChart;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
  margin: 2px 0 0 0;
`;

const ViewSelector = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
`;

const ViewBtn = styled.button`
  border: none;
  background: ${({ $active }) => ($active ? "#01514b" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ $active }) => ($active ? "#ffffff" : "#0f172a")};
  }
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
`;

const MetricItem = styled.div`
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

const MetricLabel = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
`;

const SvgChart = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const TooltipBox = styled.div`
  position: absolute;
  top: 10px;
  transform: translateX(-50%);
  background: #0f172a;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 10;
  min-width: 130px;
`;

const TooltipHeader = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 2px;
`;

const TooltipLine = styled.div`
  color: ${({ $color }) => $color};
  font-size: 10.5px;
  font-weight: 600;
  margin: 2px 0;
`;
