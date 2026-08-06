import React, { useState } from "react";
import styled from "styled-components";
import { SurfaceCard } from "../../../styles/commonstyle";

export const SalesSplineChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback default points if empty
  const points = data.length > 0 ? data : [
    { label: "Mon", value: 12000 },
    { label: "Tue", value: 19000 },
    { label: "Wed", value: 15000 },
    { label: "Thu", value: 24000 },
    { label: "Fri", value: 31000 },
    { label: "Sat", value: 45000 },
    { label: "Sun", value: 38000 }
  ];

  const maxVal = Math.max(...points.map(p => p.value)) * 1.15 || 50000;
  
  // Coordinate calculations
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getCoordinates = () => {
    return points.map((p, idx) => {
      const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (p.value / maxVal) * chartHeight;
      return { x, y, label: p.label, value: p.value };
    });
  };

  const coords = getCoordinates();

  // Create SVG path
  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Add bezier curve point for spline effect
      const cpX1 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY1 = coords[i - 1].y;
      const cpX2 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY2 = coords[i].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i].x} ${coords[i].y}`;
    }
  }

  // Create filled area path
  const areaD = coords.length > 0 
    ? `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>Weekly Sales Trend</ChartTitle>
        {hoveredPoint && (
          <TooltipValue>
            {hoveredPoint.label}: <strong>Rs. {hoveredPoint.value.toLocaleString()}</strong>
          </TooltipValue>
        )}
      </ChartHeader>
      
      <SvgWrapper>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
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
                  {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal}
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
    </ChartContainer>
  );
};

export const SalesCategoryDonut = ({ data = [] }) => {
  const categories = data.length > 0 ? data : [
    { name: "Pizza & Pastas", value: 38, color: "#10b981" },
    { name: "Starters/Platters", value: 27, color: "#3b82f6" },
    { name: "Mocktails/Shakes", value: 20, color: "#f59e0b" },
    { name: "Desserts & Cakes", value: 15, color: "#ef4444" }
  ];

  // Circle parameters
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <DonutCard>
      <ChartTitle style={{ marginBottom: 16 }}>Sales By Category</ChartTitle>
      
      <DonutContent>
        <DonutSvgWrapper>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {categories.map((c, idx) => {
              const dashArray = `${(c.value / 100) * circumference} ${circumference}`;
              const dashOffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += c.value;
              
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
            
            <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} fill="var(--color-surface)" />
            
            <text x="50%" y="47%" dominantBaseline="middle" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">
              POPULAR
            </text>
            <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="var(--color-text-primary)" fontSize="16" fontWeight="800">
              Menu
            </text>
          </svg>
        </DonutSvgWrapper>

        <Legend>
          {categories.map((c, idx) => (
            <LegendItem key={idx}>
              <ColorBadge $color={c.color} />
              <LegendText>
                <CatName>{c.name}</CatName>
                <CatValue>{c.value}%</CatValue>
              </LegendText>
            </LegendItem>
          ))}
        </Legend>
      </DonutContent>
    </DonutCard>
  );
};

export const BusyHoursChart = () => {
  const hours = [
    { hour: "12 PM", occupancy: 40 },
    { hour: "2 PM", occupancy: 70 },
    { hour: "4 PM", occupancy: 25 },
    { hour: "6 PM", occupancy: 55 },
    { hour: "8 PM", occupancy: 95 },
    { hour: "10 PM", occupancy: 85 }
  ];

  return (
    <ChartContainer>
      <ChartTitle style={{ marginBottom: 12 }}>Peak Dine-in Hours</ChartTitle>
      <BarGrid>
        {hours.map((h, i) => (
          <BarCol key={i}>
            <BarTrack>
              <BarFill $val={h.occupancy} />
            </BarTrack>
            <HourLabel>{h.hour}</HourLabel>
          </BarCol>
        ))}
      </BarGrid>
    </ChartContainer>
  );
};

const ChartContainer = styled(SurfaceCard)`
  flex: 1;
  min-width: 280px;
  transition: all var(--transition-base);
  &:hover { box-shadow: var(--shadow-md); }
`;

const DonutCard = styled(SurfaceCard)`
  min-width: 280px;
  transition: all var(--transition-base);
  &:hover { box-shadow: var(--shadow-md); }
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
  strong { color: var(--color-primary); }
`;

const SvgWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 130px;
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

// Bar grid styles
const BarGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 130px;
  padding: 6px 6px 0;
  gap: 6px;
`;

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
`;

const BarTrack = styled.div`
  width: 24px;
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
  background: linear-gradient(to top, var(--color-primary), var(--color-primary-light));
  border-radius: 6px;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(1, 81, 75, 0.15);
`;

const HourLabel = styled.span`
  font-size: 10px;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-top: 8px;
`;
