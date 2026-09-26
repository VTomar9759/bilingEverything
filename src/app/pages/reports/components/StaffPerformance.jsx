import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Input, Table, Tag } from "antd";
import { SearchOutlined, UserOutlined, TrophyOutlined, ShoppingOutlined, DollarOutlined } from "@ant-design/icons";
import { formatCurrency } from "../utils/reportUtils";

const StaffPerformance = ({ orders = [], admins = [], currency = "₹" }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const staffStats = useMemo(() => {
    const map = {};

    // First, map known admins / staff members
    (admins || []).forEach((admin) => {
      const id = admin.id || admin._id || admin.user_id || admin.email;
      const key = String(id || admin.name || "unknown").toLowerCase();
      map[key] = {
        id: admin.id || key,
        name: admin.name || admin.email || admin.username || "Staff Member",
        email: admin.email || "-",
        role: admin.role || admin.user_role || "Staff",
        ordersCount: 0,
        revenue: 0,
      };
    });

    // Process orders
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;

      const creatorId = String(
        o.created_by ||
        o.user_id ||
        o.admin_id ||
        o.staff_id ||
        o.waiter_id ||
        ""
      ).toLowerCase();

      const creatorName =
        o.created_by_name ||
        o.staff_name ||
        o.waiter_name ||
        o.server_name ||
        o.user_name ||
        o.creator_name ||
        "";

      let matchedKey = null;

      // Try matching by ID or email/name
      if (creatorId && map[creatorId]) {
        matchedKey = creatorId;
      } else if (creatorName) {
        const lowerName = creatorName.toLowerCase();
        matchedKey = Object.keys(map).find(
          (k) => k === lowerName || map[k].name.toLowerCase() === lowerName
        );
      }

      const total = Number(o.total || 0);

      if (matchedKey) {
        map[matchedKey].ordersCount += 1;
        map[matchedKey].revenue += total;
      } else {
        // Fallback key if staff is not in admins list or unnamed creator
        const fallbackName = creatorName || (creatorId ? `User (${creatorId.slice(0, 8)})` : "General / Direct");
        const fallbackKey = `unmapped_${fallbackName.toLowerCase()}`;

        if (!map[fallbackKey]) {
          map[fallbackKey] = {
            id: fallbackKey,
            name: fallbackName,
            email: "-",
            role: creatorName ? "Staff" : "System / Direct",
            ordersCount: 0,
            revenue: 0,
          };
        }
        map[fallbackKey].ordersCount += 1;
        map[fallbackKey].revenue += total;
      }
    });

    const list = Object.values(map);

    const totalRevenue = list.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = list.reduce((sum, item) => sum + item.ordersCount, 0);

    const activeStaffCount = list.filter((item) => item.ordersCount > 0).length;

    // Find top performer by revenue
    let topPerformer = null;
    let maxRev = -1;
    list.forEach((item) => {
      if (item.revenue > maxRev && item.ordersCount > 0) {
        maxRev = item.revenue;
        topPerformer = item;
      }
    });

    // Add calculations (AOV, contribution %)
    const enrichedList = list.map((item) => {
      const aov = item.ordersCount > 0 ? item.revenue / item.ordersCount : 0;
      const contribution = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
      return {
        ...item,
        aov,
        contribution,
      };
    });

    enrichedList.sort((a, b) => b.revenue - a.revenue || b.ordersCount - a.ordersCount);

    return {
      list: enrichedList,
      totalRevenue,
      totalOrders,
      activeStaffCount,
      totalStaffCount: list.length,
      topPerformer,
    };
  }, [orders, admins]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return staffStats.list;
    const q = searchTerm.toLowerCase();
    return staffStats.list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
    );
  }, [staffStats.list, searchTerm]);

  const columns = [
    {
      title: "Staff Member",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <StaffCell>
          <AvatarBadge>
            <UserOutlined />
          </AvatarBadge>
          <div>
            <StaffName>{text}</StaffName>
            {record.email !== "-" && <StaffEmail>{record.email}</StaffEmail>}
          </div>
        </StaffCell>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "blue";
        const r = (role || "").toLowerCase();
        if (r.includes("admin") || r.includes("owner")) color = "purple";
        else if (r.includes("manager")) color = "cyan";
        else if (r.includes("waiter") || r.includes("server")) color = "green";
        else if (r.includes("cashier")) color = "orange";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Orders Handled",
      dataIndex: "ordersCount",
      key: "ordersCount",
      align: "center",
      sorter: (a, b) => a.ordersCount - b.ordersCount,
      render: (val) => <NumberBadge>{val}</NumberBadge>,
    },
    {
      title: "Total Sales",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (val) => <SalesText>{formatCurrency(val, currency)}</SalesText>,
    },
    {
      title: "Avg Order Value (AOV)",
      dataIndex: "aov",
      key: "aov",
      align: "right",
      sorter: (a, b) => a.aov - b.aov,
      render: (val) => formatCurrency(val, currency),
    },
    {
      title: "Sales Share",
      dataIndex: "contribution",
      key: "contribution",
      align: "right",
      sorter: (a, b) => a.contribution - b.contribution,
      render: (val) => (
        <ProgressCell>
          <ProgressBarWrapper>
            <ProgressBarFill $pct={Math.min(100, val)} />
          </ProgressBarWrapper>
          <PctText>{val.toFixed(1)}%</PctText>
        </ProgressCell>
      ),
    },
  ];

  return (
    <Container>
      <MetricsGrid>
        <MetricCard>
          <MetricIcon $bg="#e0f2fe" $color="#0284c7">
            <UserOutlined />
          </MetricIcon>
          <MetricContent>
            <MetricLabel>Active Staff</MetricLabel>
            <MetricValue>{staffStats.activeStaffCount} / {staffStats.totalStaffCount}</MetricValue>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $bg="#ecfdf5" $color="#059669">
            <DollarOutlined />
          </MetricIcon>
          <MetricContent>
            <MetricLabel>Total Staff Revenue</MetricLabel>
            <MetricValue>{formatCurrency(staffStats.totalRevenue, currency)}</MetricValue>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $bg="#fef3c7" $color="#d97706">
            <ShoppingOutlined />
          </MetricIcon>
          <MetricContent>
            <MetricLabel>Total Orders Handled</MetricLabel>
            <MetricValue>{staffStats.totalOrders}</MetricValue>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $bg="#f3e8ff" $color="#9333ea">
            <TrophyOutlined />
          </MetricIcon>
          <MetricContent>
            <MetricLabel>Top Performer</MetricLabel>
            <MetricValueStyle>
              {staffStats.topPerformer ? staffStats.topPerformer.name : "N/A"}
            </MetricValueStyle>
          </MetricContent>
        </MetricCard>
      </MetricsGrid>

      <FilterBar>
        <Input
          placeholder="Search by staff name or role..."
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 320, borderRadius: 8 }}
        />
      </FilterBar>

      <TableCard>
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: "No staff performance data available." }}
        />
      </TableCard>
    </Container>
  );
};

export default StaffPerformance;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
`;

const MetricIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg || "#f1f5f9"};
  color: ${({ $color }) => $color || "#334155"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MetricLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
`;

const MetricValueStyle = styled(MetricValue)`
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow-x: auto;
`;

const StaffCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AvatarBadge = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #01514b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const StaffName = styled.div`
  font-weight: 600;
  color: #0f172a;
  font-size: 13px;
`;

const StaffEmail = styled.div`
  font-size: 11px;
  color: #64748b;
`;

const NumberBadge = styled.span`
  font-weight: 600;
  color: #334155;
`;

const SalesText = styled.span`
  font-weight: 700;
  color: #01514b;
`;

const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const ProgressBarWrapper = styled.div`
  width: 60px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: #01514b;
  border-radius: 3px;
`;

const PctText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  width: 40px;
  text-align: right;
`;
