import React, { useMemo } from "react";
import styled from "styled-components";

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

const OrderPerformance = ({ orders = [] }) => {
  const stats = useMemo(() => {
    let completed = 0;
    let preparing = 0;
    let pending = 0;
    let served = 0;
    let cancelled = 0;
    let refunded = 0;

    let dineIn = 0;
    let takeaway = 0;
    let delivery = 0;

    const hourCounts = HOUR_SLOTS.map(() => 0);
    const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    orders.forEach((o) => {
      const st = (o.status || "").toLowerCase();
      if (st === "completed") completed++;
      else if (st === "preparing") preparing++;
      else if (st === "pending") pending++;
      else if (st === "served") served++;
      else if (st === "cancelled") cancelled++;
      else if (st === "refunded") refunded++;

      const type = (o.order_type || o.table_name || "").toLowerCase();
      if (type.includes("takeaway") || type.includes("parcel")) {
        takeaway++;
      } else if (type.includes("delivery") || type.includes("zomato") || type.includes("swiggy")) {
        delivery++;
      } else {
        dineIn++;
      }

      if (o.created_at) {
        const d = new Date(o.created_at);
        if (!isNaN(d)) {
          const h = d.getHours();
          const idx = HOUR_SLOTS.findIndex((s) => h >= s.min && h < s.max);
          if (idx >= 0) hourCounts[idx]++;

          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;
        }
      }
    });

    const maxHour = Math.max(...hourCounts, 1);
    const hourlyData = HOUR_SLOTS.map((s, i) => ({
      slot: s.label,
      count: hourCounts[i],
      pct: Math.round((hourCounts[i] / maxHour) * 100),
    }));

    const maxDay = Math.max(...Object.values(dayCounts), 1);
    const dailyData = Object.entries(dayCounts).map(([day, count]) => ({
      day,
      count,
      pct: Math.round((count / maxDay) * 100),
    }));

    return {
      total: orders.length,
      completed,
      preparing,
      pending,
      served,
      cancelled,
      refunded,
      dineIn,
      takeaway,
      delivery,
      hourlyData,
      dailyData,
    };
  }, [orders]);

  const statusCards = [
    { label: "Total Orders", value: stats.total, color: "#01514b" },
    { label: "Completed", value: stats.completed, color: "#10b981" },
    { label: "Served", value: stats.served, color: "#06b6d4" },
    { label: "Preparing", value: stats.preparing, color: "#3b82f6" },
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "Cancelled", value: stats.cancelled, color: "#ef4444" },
    { label: "Refunded", value: stats.refunded, color: "#8b5cf6" },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Order Performance</Title>
          <SubTitle>Detailed breakdown of order volume, statuses, dining channels, and peak operating hours</SubTitle>
        </div>
      </CardHeader>

      <StatusGrid>
        {statusCards.map((sc, i) => (
          <StatusCard key={i} $color={sc.color}>
            <StatusLabel>{sc.label}</StatusLabel>
            <StatusVal>{sc.value}</StatusVal>
          </StatusCard>
        ))}
      </StatusGrid>

      <TwoColGrid>
        {/* Order Type breakdown */}
        <SectionBox>
          <SectionTitle>Orders by Channel (Order Type)</SectionTitle>
          <ChannelRow>
            <ChannelItem>
              <ChannelIcon>🍽️</ChannelIcon>
              <ChannelName>Dine-in</ChannelName>
              <ChannelCount>{stats.dineIn}</ChannelCount>
            </ChannelItem>
            <ChannelItem>
              <ChannelIcon>🛍️</ChannelIcon>
              <ChannelName>Takeaway</ChannelName>
              <ChannelCount>{stats.takeaway}</ChannelCount>
            </ChannelItem>
            <ChannelItem>
              <ChannelIcon>🛵</ChannelIcon>
              <ChannelName>Delivery</ChannelName>
              <ChannelCount>{stats.delivery}</ChannelCount>
            </ChannelItem>
          </ChannelRow>
        </SectionBox>

        {/* Orders by Day */}
        <SectionBox>
          <SectionTitle>Orders by Day of Week</SectionTitle>
          <BarChartContainer>
            {stats.dailyData.map((d, i) => (
              <BarCol key={i}>
                <BarHeight $height={`${d.pct}%`} $color="#01514b" />
                <BarLabel>{d.day}</BarLabel>
              </BarCol>
            ))}
          </BarChartContainer>
        </SectionBox>
      </TwoColGrid>

      {/* Orders by Hour (Busy Hours) */}
      <SectionBox style={{ marginTop: "16px" }}>
        <SectionTitle>Peak Operating Hours (Orders by Hour)</SectionTitle>
        <BarChartContainer style={{ height: "120px" }}>
          {stats.hourlyData.map((h, i) => (
            <BarCol key={i}>
              <BarHeight $height={`${h.pct}%`} $color="#3b82f6" />
              <BarLabel>{h.slot}</BarLabel>
            </BarCol>
          ))}
        </BarChartContainer>
      </SectionBox>
    </CardContainer>
  );
};

export default OrderPerformance;

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

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatusCard = styled.div`
  background: #f8fafc;
  border-top: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
  padding: 10px;
  border-right: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const StatusLabel = styled.span`
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
`;

const StatusVal = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 2px;
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
`;

const SectionTitle = styled.h4`
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
`;

const ChannelRow = styled.div`
  display: flex;
  gap: 12px;
`;

const ChannelItem = styled.div`
  flex: 1;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChannelIcon = styled.span`
  font-size: 20px;
  margin-bottom: 4px;
`;

const ChannelName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const ChannelCount = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 2px;
`;

const BarChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 90px;
  padding-top: 10px;
`;

const BarCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const BarHeight = styled.div`
  width: 100%;
  max-width: 20px;
  height: ${({ $height }) => $height};
  background: ${({ $color }) => $color};
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
`;

const BarLabel = styled.span`
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  margin-top: 6px;
  white-space: nowrap;
`;
