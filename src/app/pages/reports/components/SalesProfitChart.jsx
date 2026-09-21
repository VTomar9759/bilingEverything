import React, { useState, useMemo, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const SalesProfitChart = ({ orders = [], expenses = [], currency = "₹" }) => {
  const [periodView, setPeriodView] = useState("Weekly"); // Daily, Weekly, Monthly, Yearly
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const chartRef = useRef(null);

  // Responsive: measure actual container width
  useEffect(() => {
    const measure = () => {
      if (chartRef.current) {
        setContainerWidth(chartRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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

  const formatShortCurrency = (val) => {
    if (val >= 10000000) return `${currency}${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${currency}${(val / 1000).toFixed(1)}K`;
    if (val === 0) return `${currency}0`;
    return `${currency}${Math.round(val)}`;
  };

  // Y-axis labels (8 ticks)
  const yTicks = [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1].map((pct) => ({
    pct,
    value: maxVal * pct,
  }));

  // Dynamic SVG dimensions based on container
  const svgWidth = containerWidth;
  const svgHeight = 360;
  const chartLeft = 70;
  const chartRight = 30;
  const chartTop = 15;
  const chartBottom = 40;
  const chartAreaWidth = svgWidth - chartLeft - chartRight;
  const chartAreaHeight = svgHeight - chartTop - chartBottom;

  return (
    <CardContainer>
      <BgPattern />

      <CardHeader>
        <HeaderLeft>
          <TitleRow>
            <ChartIcon>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="10" width="4" height="8" rx="1.5" fill="#01514b" opacity="0.3" />
                <rect x="8" y="6" width="4" height="12" rx="1.5" fill="#01514b" opacity="0.6" />
                <rect x="14" y="2" width="4" height="16" rx="1.5" fill="#01514b" />
              </svg>
            </ChartIcon>
            <div>
              <Title>Sales & Profit Overview</Title>
              <SubTitle>Compare Revenue, Expenses, and Profit across periods</SubTitle>
            </div>
          </TitleRow>
        </HeaderLeft>
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
        <MetricCard $color="#01514b" $bg="rgba(1, 81, 75, 0.06)">
          <MetricDot $color="#01514b" />
          <div>
            <MetricLabel>Revenue</MetricLabel>
            <MetricValue>{formatCurrency(totalRev, currency)}</MetricValue>
          </div>
        </MetricCard>
        <MetricCard $color="#ef4444" $bg="rgba(239, 68, 68, 0.06)">
          <MetricDot $color="#ef4444" />
          <div>
            <MetricLabel>Expenses</MetricLabel>
            <MetricValue $color="#ef4444">{formatCurrency(totalExp, currency)}</MetricValue>
          </div>
        </MetricCard>
        <MetricCard $color="#10b981" $bg="rgba(16, 185, 129, 0.06)">
          <MetricDot $color="#10b981" />
          <div>
            <MetricLabel>Net Profit</MetricLabel>
            <MetricValue $color="#10b981">{formatCurrency(totalProfit, currency)}</MetricValue>
          </div>
        </MetricCard>
      </MetricsRow>

      {/* SVG Bar Chart — full width */}
      <ChartWrapper ref={chartRef}>
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#017a6e" />
              <stop offset="100%" stopColor="#01514b" />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="hoverBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#01514b" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#01514b" stopOpacity="0.01" />
            </linearGradient>
            <filter id="barShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Grid lines + Y-axis labels */}
          {yTicks.map((tick, i) => {
            const y = chartTop + chartAreaHeight - tick.pct * chartAreaHeight;
            return (
              <g key={i}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={svgWidth - chartRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={i === 0 ? "0" : "6 4"}
                  strokeWidth="1"
                  opacity={i === 0 ? 0.7 : 0.45}
                />
                <text
                  x={chartLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {formatShortCurrency(tick.value)}
                </text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {chartData.map((d, i) => {
            const groupWidth = chartAreaWidth / chartData.length;
            const centerX = chartLeft + i * groupWidth + groupWidth / 2;

            const barW = Math.min(28, Math.max(14, groupWidth / 4.5));
            const barGap = barW * 0.3;
            const revH = (d.rev / maxVal) * chartAreaHeight;
            const expH = (d.exp / maxVal) * chartAreaHeight;
            const prfH = (d.profit / maxVal) * chartAreaHeight;

            const baseY = chartTop + chartAreaHeight;
            const revY = baseY - revH;
            const expY = baseY - expH;
            const prfY = baseY - prfH;

            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Hover background column */}
                {isHovered && (
                  <rect
                    x={chartLeft + i * groupWidth + 2}
                    y={chartTop}
                    width={groupWidth - 4}
                    height={chartAreaHeight}
                    fill="url(#hoverBg)"
                    rx="6"
                  />
                )}

                {/* Revenue Bar */}
                <BarRect
                  x={centerX - barW * 1.5 - barGap}
                  y={revY}
                  width={barW}
                  height={Math.max(0, revH)}
                  fill="url(#revGrad)"
                  rx="4"
                  ry="4"
                  filter={isHovered ? "url(#barShadow)" : "none"}
                  opacity={isHovered ? 1 : 0.88}
                />
                {/* Expense Bar */}
                <BarRect
                  x={centerX - barW * 0.5}
                  y={expY}
                  width={barW}
                  height={Math.max(0, expH)}
                  fill="url(#expGrad)"
                  rx="4"
                  ry="4"
                  filter={isHovered ? "url(#barShadow)" : "none"}
                  opacity={isHovered ? 1 : 0.88}
                />
                {/* Profit Bar */}
                <BarRect
                  x={centerX + barW * 0.5 + barGap}
                  y={prfY}
                  width={barW}
                  height={Math.max(0, prfH)}
                  fill="url(#profGrad)"
                  rx="4"
                  ry="4"
                  filter={isHovered ? "url(#barShadow)" : "none"}
                  opacity={isHovered ? 1 : 0.88}
                />

                {/* Value labels on hover */}
                {isHovered && d.rev > 0 && (
                  <text
                    x={centerX - barW * 1.5 - barGap + barW / 2}
                    y={revY - 6}
                    textAnchor="middle"
                    fill="#01514b"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {formatShortCurrency(d.rev)}
                  </text>
                )}
                {isHovered && d.exp > 0 && (
                  <text
                    x={centerX}
                    y={expY - 6}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {formatShortCurrency(d.exp)}
                  </text>
                )}
                {isHovered && d.profit > 0 && (
                  <text
                    x={centerX + barW * 0.5 + barGap + barW / 2}
                    y={prfY - 6}
                    textAnchor="middle"
                    fill="#10b981"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {formatShortCurrency(d.profit)}
                  </text>
                )}

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y={baseY + 22}
                  textAnchor="middle"
                  fill={isHovered ? "#0f172a" : "#64748b"}
                  fontSize="12"
                  fontWeight={isHovered ? "700" : "500"}
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {d.label}
                </text>

                {isHovered && (
                  <circle cx={centerX} cy={baseY + 32} r="2.5" fill="#01514b" />
                )}
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <TooltipBox
            style={{
              left: `${chartLeft + ((hoveredIdx + 0.5) / chartData.length) * chartAreaWidth}px`,
            }}
          >
            <TooltipHeader>{chartData[hoveredIdx].label}</TooltipHeader>
            <TooltipLine>
              <TooltipDot $color="#01514b" />
              <span>Revenue</span>
              <TooltipVal>{formatCurrency(chartData[hoveredIdx].rev, currency)}</TooltipVal>
            </TooltipLine>
            <TooltipLine>
              <TooltipDot $color="#ef4444" />
              <span>Expenses</span>
              <TooltipVal>{formatCurrency(chartData[hoveredIdx].exp, currency)}</TooltipVal>
            </TooltipLine>
            <TooltipLine>
              <TooltipDot $color="#10b981" />
              <span>Profit</span>
              <TooltipVal>{formatCurrency(chartData[hoveredIdx].profit, currency)}</TooltipVal>
            </TooltipLine>
          </TooltipBox>
        )}
      </ChartWrapper>
    </CardContainer>
  );
};

export default SalesProfitChart;

/* ─── Animations ───────────────────────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─────────────────────────────────────────── */

const CardContainer = styled.div`
  position: relative;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 24px 28px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease;

  @media (max-width: 768px) {
    padding: 16px 14px 14px;
    border-radius: 12px;
  }
`;

const BgPattern = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle at 100% 0%, rgba(1, 81, 75, 0.03) 0%, transparent 60%);
  pointer-events: none;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChartIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(1, 81, 75, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
  letter-spacing: -0.3px;
`;

const SubTitle = styled.p`
  font-size: 12px;
  color: var(--color-text-muted, #94a3b8);
  margin: 2px 0 0 0;
`;

const ViewSelector = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 2px;
  border: 1px solid #e2e8f0;
`;

const ViewBtn = styled.button`
  border: none;
  background: ${({ $active }) => ($active ? "#01514b" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $active }) =>
    $active &&
    `box-shadow: 0 2px 8px rgba(1, 81, 75, 0.25);`}

  &:hover {
    color: ${({ $active }) => ($active ? "#ffffff" : "#0f172a")};
    background: ${({ $active }) => ($active ? "#01514b" : "rgba(1, 81, 75, 0.06)")};
  }
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ $bg }) => $bg};
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid ${({ $color }) => $color}15;
  transition: all 0.2s ease;
  min-width: 140px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ $color }) => $color}15;
  }

  @media (max-width: 600px) {
    padding: 8px 12px;
    min-width: 100px;
    flex: 1;
  }
`;

const MetricDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 3px ${({ $color }) => $color}20;
  flex-shrink: 0;
`;

const MetricLabel = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  display: block;
  line-height: 1;
  margin-bottom: 3px;
`;

const MetricValue = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $color }) => $color || "#0f172a"};
  display: block;
  line-height: 1;
  letter-spacing: -0.3px;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 360px;
`;

const BarRect = styled.rect`
  transition: opacity 0.2s ease, filter 0.2s ease;
`;

const tooltipFade = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

const TooltipBox = styled.div`
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  pointer-events: none;
  z-index: 10;
  min-width: 170px;
  animation: ${tooltipFade} 0.2s ease;
`;

const TooltipHeader = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
`;

const TooltipLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 500;
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.85);

  span:first-of-type {
    flex: 1;
  }
`;

const TooltipDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const TooltipVal = styled.span`
  font-weight: 700;
  color: #ffffff;
  font-size: 12px;
`;
