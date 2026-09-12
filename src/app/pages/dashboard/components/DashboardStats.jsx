import React from "react";
import styled from "styled-components";
import { SurfaceCard } from "../../../styles/commonstyle";

const DashboardStats = ({ stats = {} }) => {
  const statItems = [
    {
      title: "Total Revenue",
      value: `Rs. ${stats.revenue?.toLocaleString() ?? "0"}`,
      change: "+12.4% vs yesterday",
      isPositive: true,
      color: "#10b981",
      bgGlow: "rgba(16,185,129,0.06)",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "Active Orders",
      value: stats.activeOrders ?? "0",
      change: `${stats.preparingOrders ?? 0} in kitchen preparation`,
      isPositive: true,
      color: "#3b82f6",
      bgGlow: "rgba(59,130,246,0.06)",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: "Table Occupancy",
      value: `${stats.occupancyRate ?? 0}%`,
      change: `${stats.occupiedTables ?? 0} occupied of ${stats.totalTables ?? 0} total`,
      isPositive: (stats.occupancyRate ?? 0) > 40,
      color: "#f59e0b",
      bgGlow: "rgba(245,158,11,0.06)",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      ),
    },
    {
      title: "Total Items",
      value: stats.totalItmes?.length ?? 0,

      change: (
        <>
          {stats.totalItmes.filter((item) => item.status === true).length}{" "}
          Available
          <span
            style={{
              display: "inline-block",
              height: "12px",
              width: "1px",
              background: "#999",
              margin: "0 8px",
              verticalAlign: "middle",
            }}
          />
          <span style={{ color: "#ef4444" }}>
            {" "}
            {stats.totalItmes?.filter((item) => item.status === false).length ??
              0}{" "}
            Out of Stock
          </span>
        </>
      ),

      isPositive:
        stats.totalItmes?.some((item) => item.status === true) ?? false,

      color: stats.totalItmes?.some((item) => item.status === true)
        ? "#10b981"
        : "#ef4444",

      bgGlow: stats.totalItmes?.some((item) => item.status === true)
        ? "rgba(16,185,129,0.06)"
        : "rgba(239,68,68,0.06)",

      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={
            stats.totalItmes?.some((item) => item.status === true)
              ? "#10b981"
              : "#ef4444"
          }
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        </svg>
      ),
    },
  ];

  return (
    <StatsGrid>
      {statItems.map((item, idx) => (
        <StatCard key={idx} $glow={item.bgGlow} $color={item.color}>
          <IconContainer $glow={item.bgGlow}>{item.icon}</IconContainer>
          <StatContent>
            <Title>{item.title}</Title>
            <Value>{item.value}</Value>
            <Subtext
              $isPositive={item.isPositive}
              $isDanger={
                item.title === "Low Stock Items" && stats.lowStockCount > 0
              }
            >
              {item.change}
            </Subtext>
          </StatContent>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default DashboardStats;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  width: 100%;
`;

const StatCard = styled(SurfaceCard)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ $color }) => $color};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const IconContainer = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${({ $glow }) => $glow};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const Value = styled.span`
  font-size: 20px;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
`;

const Subtext = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: ${({ $isPositive, $isDanger }) =>
    $isDanger
      ? "#ef4444"
      : $isPositive
        ? "var(--color-success)"
        : "var(--color-text-secondary)"};
`;
