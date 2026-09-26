import React, { useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

const getInitials = (name = "") => {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const StaffPerformance = ({
  orders = [],
  admins = [],
  userData = null,
  currency = "₹",
  permission = {},
  user_role = "",
}) => {
  const isAuthorized =
    user_role === "owner" || user_role === "super_admin" || permission.reports?.view !== false;

  const staffStats = useMemo(() => {
    const map = {};

    // 1. Populate map with known admins
    (admins || []).forEach((a) => {
      const name = a.name || a.email || "Admin";
      const key = a.id || a.user_id || a.auth_id || a.email || name;
      map[key] = {
        id: a.id || key,
        name,
        email: a.email || "",
        orders: 0,
        sales: 0,
        discounts: 0,
        cancelled: 0,
        refunds: 0,
      };
    });

    // 2. Add logged-in owner/user details if available
    if (userData) {
      const primaryName =
        userData.name || userData.full_name || userData.business_name || userData.email || "Primary Admin";
      const primaryKey = userData.id || userData.created_by || "primary_admin";
      let existingKey = Object.keys(map).find(
        (k) =>
          k === primaryKey ||
          map[k]?.email?.toLowerCase() === userData.email?.toLowerCase() ||
          map[k]?.name?.toLowerCase() === primaryName.toLowerCase()
      );

      if (!existingKey) {
        map[primaryKey] = {
          id: primaryKey,
          name: primaryName,
          email: userData.email || "",
          orders: 0,
          sales: 0,
          discounts: 0,
          cancelled: 0,
          refunds: 0,
        };
      }
    }

    // 3. Process orders
    orders.forEach((o) => {
      const rawId = o.created_by || o.user_id;
      const rawName = o.biller_name || o.created_by_name || o.user_name || o.staff_name;
      const rawEmail = o.created_by_email || o.user_email || "";

      let targetKey = null;

      // Check if rawId or rawName matches an existing map key
      if (rawId && map[rawId]) {
        targetKey = rawId;
      } else if (rawName && map[rawName]) {
        targetKey = rawName;
      } else {
        // Check if rawId or rawName matches an admin
        const foundAdmin = (admins || []).find(
          (a) =>
            (rawId && (a.id === rawId || a.user_id === rawId || a.auth_id === rawId || a.created_by === rawId)) ||
            (rawName && (a.name === rawName || a.email === rawName)) ||
            (rawEmail && a.email?.toLowerCase() === rawEmail.toLowerCase())
        );

        if (foundAdmin) {
          targetKey = foundAdmin.id || foundAdmin.user_id || foundAdmin.auth_id || foundAdmin.email || foundAdmin.name;
        } else if (
          userData &&
          ((rawId && (userData.id === rawId || userData.org_id === rawId || userData.created_by === rawId)) ||
            (rawName && (userData.name === rawName || userData.email === rawName)) ||
            (rawEmail && userData.email?.toLowerCase() === rawEmail.toLowerCase()))
        ) {
          targetKey = userData.id || userData.created_by || "primary_admin";
        }
      }

      if (!targetKey) {
        // Determine a clean display name when not matched to admin/userData
        let displayName = rawName;
        let displayEmail = rawEmail;

        if (!displayName || isUuid(displayName)) {
          if (rawName && !isUuid(rawName)) {
            displayName = rawName;
          } else if (rawId && !isUuid(rawId)) {
            displayName = rawId;
          } else {
            // It is a raw UUID and no admin/user match was found
            displayName = rawEmail ? rawEmail.split("@")[0] : "Staff Member";
          }
        }

        targetKey = rawId || rawName || displayName;

        if (!map[targetKey]) {
          map[targetKey] = {
            id: targetKey,
            name: displayName,
            email: displayEmail,
            orders: 0,
            sales: 0,
            discounts: 0,
            cancelled: 0,
            refunds: 0,
          };
        }
      }

      const target = map[targetKey];
      const st = (o.status || "").toLowerCase();
      if (st === "cancelled") {
        target.cancelled++;
        return;
      }
      if (st === "refunded") {
        target.refunds += Number(o.total || 0);
        return;
      }

      target.orders++;
      target.sales += Number(o.total || 0);
      target.discounts += Number(o.discount || 0);
    });

    // Return entries that have activity or belong to registered admins
    return Object.values(map)
      .filter((s) => s.orders > 0 || s.cancelled > 0 || s.sales > 0 || (admins || []).some((a) => a.name === s.name))
      .sort((a, b) => b.sales - a.sales);
  }, [orders, admins, userData]);

  const topPerformer = staffStats[0] || null;
  const totalOrdersHandled = staffStats.reduce((acc, s) => acc + s.orders, 0);
  const totalStaffSales = staffStats.reduce((acc, s) => acc + s.sales, 0);

  if (!isAuthorized) {
    return (
      <CardContainer>
        <LockNotice>
          🔒 You do not have permission to view staff performance metrics.
        </LockNotice>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Staff Performance</Title>
          <SubTitle>Performance metrics on sales, discounts, and order cancellations per staff member</SubTitle>
        </div>
        <CountBadge>{staffStats.length} Active Staff</CountBadge>
      </CardHeader>

      {/* Highlights Bar */}
      <HighlightRow>
        <HighlightCard $color="#01514b">
          <CardLabel>🏆 Top Performer</CardLabel>
          <CardVal>{topPerformer ? topPerformer.name : "-"}</CardVal>
          <SubText>{topPerformer ? formatCurrency(topPerformer.sales, currency) : formatCurrency(0, currency)}</SubText>
        </HighlightCard>
        <HighlightCard $color="#3b82f6">
          <CardLabel>📦 Total Orders Handled</CardLabel>
          <CardVal>{totalOrdersHandled}</CardVal>
          <SubText>Across all staff</SubText>
        </HighlightCard>
        <HighlightCard $color="#10b981">
          <CardLabel>💰 Total Staff Sales</CardLabel>
          <CardVal>{formatCurrency(totalStaffSales, currency)}</CardVal>
          <SubText>Cumulative revenue</SubText>
        </HighlightCard>
      </HighlightRow>

      {/* Staff Cards Grid */}
      {staffStats.length === 0 ? (
        <EmptyNotice>No staff performance data available for this period.</EmptyNotice>
      ) : (
        <StaffCardGrid>
          {staffStats.map((staff, idx) => (
            <StaffCard key={staff.id || staff.name || idx}>
              <CardTop>
                <AvatarBadge $rank={idx}>
                  {getInitials(staff.name)}
                </AvatarBadge>
                <StaffInfo>
                  <StaffName>{staff.name}</StaffName>
                  {staff.email && <StaffEmail>{staff.email}</StaffEmail>}
                </StaffInfo>
                {idx === 0 && staff.sales > 0 && <RankBadge>🏆 #1 Top</RankBadge>}
              </CardTop>

              <SalesBox>
                <SalesLabel>Total Sales</SalesLabel>
                <SalesValue>{formatCurrency(staff.sales, currency)}</SalesValue>
              </SalesBox>

              <MetricsGrid>
                <MetricCell>
                  <MetricLabel>Orders</MetricLabel>
                  <MetricValue>{staff.orders}</MetricValue>
                </MetricCell>
                <MetricCell>
                  <MetricLabel>Discounts</MetricLabel>
                  <MetricValue>{formatCurrency(staff.discounts, currency)}</MetricValue>
                </MetricCell>
                <MetricCell>
                  <MetricLabel>Cancelled</MetricLabel>
                  <MetricValue $danger={staff.cancelled > 0}>{staff.cancelled}</MetricValue>
                </MetricCell>
                <MetricCell>
                  <MetricLabel>Refunds</MetricLabel>
                  <MetricValue>{formatCurrency(staff.refunds, currency)}</MetricValue>
                </MetricCell>
              </MetricsGrid>
            </StaffCard>
          ))}
        </StaffCardGrid>
      )}
    </CardContainer>
  );
};

export default StaffPerformance;

/* ─── Styled Components ─── */
const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    padding: 14px 10px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
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

const CountBadge = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
`;

const HighlightRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  background: #f8fafc;
  border-top: 3px solid ${({ $color }) => $color};
  border-radius: 8px;
  padding: 12px 14px;
  border-right: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`;

const CardLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const CardVal = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubText = styled.span`
  font-size: 11px;
  color: #01514b;
  font-weight: 600;
`;

const StaffCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const StaffCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    border-color: #01514b;
    box-shadow: 0 4px 12px rgba(1, 81, 75, 0.08);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const AvatarBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $rank }) =>
    $rank === 0
      ? "linear-gradient(135deg, #01514b, #0d7065)"
      : "linear-gradient(135deg, #334155, #64748b)"};
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StaffInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StaffName = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StaffEmail = styled.p`
  font-size: 11px;
  color: #64748b;
  margin: 1px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RankBadge = styled.span`
  background: #fef3c7;
  color: #d97706;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
`;

const SalesBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SalesLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #166534;
`;

const SalesValue = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: #01514b;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: auto;
`;

const MetricCell = styled.div`
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
`;

const MetricLabel = styled.span`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "#0f172a")};
  margin-top: 2px;
`;

const EmptyNotice = styled.div`
  padding: 30px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`;

const LockNotice = styled.div`
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
`;

