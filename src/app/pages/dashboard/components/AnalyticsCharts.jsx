import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { SurfaceCard } from "../../../styles/commonstyle";

// ─── helpers ───────────────────────────────────────────────────────────
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const aggregateWeeklySales = (orders = []) => {
  const buckets = DAY_LABELS.map(() => 0);
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    const d = new Date(o.created_at);
    if (isNaN(d)) return;
    buckets[d.getDay()] += Number(o.total) || 0;
  });
  // Reorder to Mon-Sun
  const reordered = [...buckets.slice(1), buckets[0]];
  const labels = [...DAY_LABELS.slice(1), DAY_LABELS[0]];
  return labels.map((label, i) => ({ label, value: Math.round(reordered[i]) }));
};

const HOUR_SLOTS = [
  { label: "6-8 AM", min: 6, max: 8 },
  { label: "8-10 AM", min: 8, max: 10 },
  { label: "10-12 PM", min: 10, max: 12 },
  { label: "12-2 PM", min: 12, max: 14 },
  { label: "2-4 PM", min: 14, max: 16 },
  { label: "4-6 PM", min: 16, max: 18 },
  { label: "6-8 PM", min: 18, max: 20 },
  { label: "8-10 PM", min: 20, max: 22 },
  { label: "10-12 AM", min: 22, max: 24 },
];

const aggregateBusyHours = (orders = []) => {
  const counts = HOUR_SLOTS.map(() => 0);
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    if (isNaN(d)) return;
    const h = d.getHours();
    const idx = HOUR_SLOTS.findIndex((s) => h >= s.min && h < s.max);
    if (idx >= 0) counts[idx]++;
  });
  const max = Math.max(...counts, 1);
  return HOUR_SLOTS.map((s, i) => ({
    hour: s.label,
    count: counts[i],
    occupancy: Math.round((counts[i] / max) * 100),
  }));
};

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Preparing: "#3b82f6",
  Ready: "#8b5cf6",
  Served: "#10b981",
  Cancelled: "#ef4444",
  Completed: "#06b6d4",
};

const aggregateStatusBreakdown = (orders = []) => {
  const map = {};
  orders.forEach((o) => {
    const s = o.status || "Other";
    map[s] = (map[s] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);
};

const aggregateTopItems = (orders = []) => {
  const map = {};
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    (o.items || []).forEach((item) => {
      const name = item.name || item.item_name || "Unknown";
      const qty = Number(item.quantity || item.qty) || 1;
      map[name] = (map[name] || 0) + qty;
    });
  });
  return Object.entries(map)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
};

// ═══════════════════════════════════════════════════════════════════════
// Weekly Sales Spline Chart
// ═══════════════════════════════════════════════════════════════════════
export const SalesSplineChart = ({ orders = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const points = useMemo(() => aggregateWeeklySales(orders), [orders]);

  const hasData = points.some((p) => p.value > 0);
  const maxVal = Math.max(...points.map((p) => p.value)) * 1.15 || 1;

  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.value / maxVal) * chartHeight;
    return { x, y, label: p.label, value: p.value };
  });

  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const cpX1 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY1 = coords[i - 1].y;
      const cpX2 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY2 = coords[i].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i].x} ${coords[i].y}`;
    }
  }

  const areaD =
    coords.length > 0
      ? `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`
      : "";

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Weekly Sales Trend</ChartTitle>
        {hoveredPoint && (
          <TooltipValue>
            {hoveredPoint.label}:{" "}
            <strong>Rs. {hoveredPoint.value.toLocaleString()}</strong>
          </TooltipValue>
        )}
      </ChartHeader>

      {!hasData ? (
        <EmptyState>No sales data available this week</EmptyState>
      ) : (
        <SvgWrapper>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity="0.00"
                />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + ratio * chartHeight;
              const gridVal = Math.round(maxVal * (1 - ratio));
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="var(--color-border-light)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="var(--color-text-secondary)"
                    fontSize="9"
                    textAnchor="end"
                    fontWeight="600"
                  >
                    {gridVal >= 1000
                      ? `${(gridVal / 1000).toFixed(0)}k`
                      : gridVal}
                  </text>
                </g>
              );
            })}

            {/* Area under spline */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Spline line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Data Points */}
            {coords.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hoveredPoint?.label === c.label ? 6 : 4}
                  fill="var(--color-surface)"
                  stroke="var(--color-primary)"
                  strokeWidth={hoveredPoint?.label === c.label ? 3 : 2}
                  style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={() => setHoveredPoint(c)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text
                  x={c.x}
                  y={paddingTop + chartHeight + 14}
                  fill="var(--color-text-secondary)"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {c.label}
                </text>
              </g>
            ))}
          </svg>
        </SvgWrapper>
      )}
    </ChartContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Peak Dine-in Hours Bar Chart
// ═══════════════════════════════════════════════════════════════════════
export const BusyHoursChart = ({ orders = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const hours = useMemo(() => aggregateBusyHours(orders), [orders]);
  const hasData = hours.some((h) => h.count > 0);

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Peak Dine-in Hours</ChartTitle>
        {hoveredIdx !== null && (
          <TooltipValue>
            {hours[hoveredIdx].hour}:{" "}
            <strong>{hours[hoveredIdx].count} orders</strong>
          </TooltipValue>
        )}
      </ChartHeader>
      {!hasData ? (
        <EmptyState>No order timing data yet</EmptyState>
      ) : (
        <BarGrid>
          {hours.map((h, i) => (
            <BarCol
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <BarTrack>
                <BarFill $val={h.occupancy} $active={hoveredIdx === i} />
              </BarTrack>
              <BarCount $visible={h.count > 0}>{h.count}</BarCount>
              <HourLabel>{h.hour}</HourLabel>
            </BarCol>
          ))}
        </BarGrid>
      )}
    </ChartContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Order Status Breakdown Donut
// ═══════════════════════════════════════════════════════════════════════
export const OrderStatusDonut = ({ orders = [] }) => {
  const categories = useMemo(
    () => aggregateStatusBreakdown(orders),
    [orders],
  );
  const total = categories.reduce((s, c) => s + c.value, 0) || 1;

  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (categories.length === 0) {
    return (
      <DonutCard>
        <ChartTitle style={{ marginBottom: 16 }}>Order Status</ChartTitle>
        <EmptyState>No orders to display</EmptyState>
      </DonutCard>
    );
  }

  return (
    <DonutCard>
      <ChartTitle style={{ marginBottom: 16 }}>Order Status</ChartTitle>

      <DonutContent>
        <DonutSvgWrapper>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {categories.map((c, idx) => {
              const pct = (c.value / total) * 100;
              const dashArray = `${(pct / 100) * circumference} ${circumference}`;
              const dashOffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += pct;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              );
            })}

            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - strokeWidth / 2}
              fill="var(--color-surface)"
            />

            <text
              x="50%"
              y="47%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize="10"
              fontWeight="600"
            >
              TOTAL
            </text>
            <text
              x="50%"
              y="60%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="var(--color-text-primary)"
              fontSize="16"
              fontWeight="800"
            >
              {total}
            </text>
          </svg>
        </DonutSvgWrapper>

        <Legend>
          {categories.map((c, idx) => (
            <LegendItem key={idx}>
              <ColorBadge $color={c.color} />
              <LegendText>
                <CatName>{c.name}</CatName>
                <CatValue>
                  {c.value} ({Math.round((c.value / total) * 100)}%)
                </CatValue>
              </LegendText>
            </LegendItem>
          ))}
        </Legend>
      </DonutContent>
    </DonutCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Top Selling Items
// ═══════════════════════════════════════════════════════════════════════
export const TopSellingItems = ({ orders = [] }) => {
  const items = useMemo(() => aggregateTopItems(orders), [orders]);
  const maxQty = items.length > 0 ? items[0].qty : 1;

  if (items.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Top Selling Items</ChartTitle>
        <EmptyState>No item data available</EmptyState>
      </ChartContainer>
    );
  }

  const ITEM_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  return (
    <ChartContainer>
      <ChartTitle style={{ marginBottom: 12 }}>Top Selling Items</ChartTitle>
      <ItemsList>
        {items.map((item, idx) => {
          const pct = Math.round((item.qty / maxQty) * 100);
          const color = ITEM_COLORS[idx % ITEM_COLORS.length];
          return (
            <ItemRow key={idx}>
              <ItemRank $color={color}>{idx + 1}</ItemRank>
              <ItemInfo>
                <ItemName>{item.name}</ItemName>
                <ItemBarTrack>
                  <ItemBarFill $pct={pct} $color={color} />
                </ItemBarTrack>
              </ItemInfo>
              <ItemQty $color={color}>{item.qty}</ItemQty>
            </ItemRow>
          );
        })}
      </ItemsList>
    </ChartContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Styled Components
// ═══════════════════════════════════════════════════════════════════════
const ChartContainer = styled(SurfaceCard)`
  flex: 1;
  min-width: 240px;
  transition: all var(--transition-base);
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const DonutCard = styled(SurfaceCard)`
  min-width: 240px;
  transition: all var(--transition-base);
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ChartTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const TooltipValue = styled.span`
  font-size: 11.5px;
  color: var(--color-text-secondary);
  strong {
    color: var(--color-primary);
  }
`;

const SvgWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 130px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
`;

const DonutContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: center;
    flex-direction: column;
    gap: 12px;
  }
`;

const DonutSvgWrapper = styled.div`
  flex-shrink: 0;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ColorBadge = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const LegendText = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  font-size: 11.5px;
`;

const CatName = styled.span`
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const CatValue = styled.span`
  color: var(--color-text-primary);
  font-weight: 700;
`;

// Bar chart styles
const BarGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 130px;
  padding: 6px 2px 0;
  gap: 4px;
`;

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
`;

const BarTrack = styled.div`
  width: 22px;
  height: 100%;
  background: var(--color-border-light);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
`;

const BarFill = styled.div`
  width: 100%;
  height: ${({ $val }) => $val}%;
  background: linear-gradient(
    to top,
    var(--color-primary),
    var(--color-primary-light)
  );
  border-radius: 6px;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(1, 81, 75, 0.15);
  opacity: ${({ $active }) => ($active ? 1 : 0.85)};
`;

const BarCount = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 3px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

const HourLabel = styled.span`
  font-size: 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-top: 2px;
  white-space: nowrap;
`;

// Top Selling Items styles
const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ItemRank = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${({ $color }) => $color}12;
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
`;

const ItemBarTrack = styled.div`
  width: 100%;
  height: 5px;
  background: var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
`;

const ItemBarFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ItemQty = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  min-width: 28px;
  text-align: right;
`;
