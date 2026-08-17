import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Table, Badge as AntdBadge, Skeleton, Empty } from "antd";
import { useSelector } from "react-redux";
import {
  ShopOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  FileSyncOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import DashboardStats from "./components/DashboardStats";
import { SalesSplineChart, BusyHoursChart } from "../reports/components/AnalyticsCharts";
import * as service from "../../../services";

import {
  PATH_ORDERS,
  PATH_TABLES,
  PATH_BILLING,
  PATH_KITCHEN,
} from "../../routes/pathname";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { userId } = useSelector((state) => state.authSlice);
  const itemsCatalog = useSelector((state) => state.itemSlice);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTables, setActiveTables] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [ordersList, tablesList, staffList, inventoryList, config] =
          await Promise.all([
            service.getOrders(userId),
            service.getTables(userId),
            service.getStaff(userId),
            service.getInventory(userId, itemsCatalog),
            service.getSettings(userId),
          ]);

        setSettings(config);

        // Compute metrics
        const completedPaidOrders = ordersList.filter(
          (o) => o.payment_status === "Paid",
        );
        const totalRevenue = completedPaidOrders.reduce(
          (acc, curr) => acc + curr.total,
          0,
        );

        const activeOrdersCount = ordersList.filter((o) =>
          ["Pending", "Preparing", "Ready"].includes(o.status),
        ).length;
        const preparingOrdersCount = ordersList.filter(
          (o) => o.status === "Preparing",
        ).length;

        const occupiedTablesCount = tablesList.filter(
          (t) => t.status === "Occupied" || t.status === "Billed",
        ).length;
        const totalTablesCount = tablesList.length;
        const occupancyRate =
          totalTablesCount > 0
            ? Math.round((occupiedTablesCount / totalTablesCount) * 100)
            : 0;

        const lowStockCount = inventoryList.filter(
          (inv) => inv.stock <= inv.min_level,
        ).length;

        setStats({
          revenue: Math.round(totalRevenue),
          activeOrders: activeOrdersCount,
          preparingOrders: preparingOrdersCount,
          occupiedTables: occupiedTablesCount,
          totalTables: totalTablesCount,
          occupancyRate,
          lowStockCount,
        });

        // Set live subsets
        setRecentOrders(ordersList.slice(0, 5));
        setActiveTables(
          tablesList.filter((t) => t.status !== "Available").slice(0, 4),
        );
      } catch (err) {
        console.error("DashboardOverview error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, itemsCatalog]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <AntdBadge status="warning" text="Pending" />;
      case "Preparing":
        return <AntdBadge status="processing" text="Preparing" />;
      case "Ready":
        return <AntdBadge status="success" text="Ready" />;
      case "Served":
        return <AntdBadge status="default" text="Served" />;
      case "Cancelled":
        return <AntdBadge status="error" text="Cancelled" />;
      default:
        return <AntdBadge status="default" text={status} />;
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <strong style={{ color: "var(--color-primary-light)" }}>#{id}</strong>
      ),
    },
    {
      title: "Table",
      dataIndex: "table_name",
      key: "table_name",
      render: (name) => name || "Takeaway",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <span>{items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}</span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <strong>
          {settings.currency || "Rs."} {total?.toFixed(2)}
        </strong>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
  ];

  return (
    <PageWrapper>
      {/* Top dashboard header */}
      <HeaderSection>
        <TabHeader
          title={settings.restaurant_name || "Restaurant Cockpit"}
          subtitle="Real-time operations, sales data, and kitchen status."
        />
        <ActionButtons>
          <QuickActionBtn
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(PATH_ORDERS)}
          >
            New Order
          </QuickActionBtn>
          <QuickActionBtn
            icon={<FileSyncOutlined />}
            onClick={() => navigate(PATH_BILLING)}
          >
            Quick Bill
          </QuickActionBtn>
        </ActionButtons>
      </HeaderSection>

      {loading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <>
          {/* Statistical Cards Grid */}
          <DashboardStats stats={stats} />

          {/* Central Analytics Charts Layout */}
          <ChartLayout>
            <SalesSplineChart />
            <BusyHoursChart />
          </ChartLayout>
        </>
      )}
    </PageWrapper>
  );
};

export default DashboardOverview;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: 480px) {
    width: 100%;
    > * {
      flex: 1;
    }
  }
`;

const QuickActionBtn = styled(Button)`
  height: 38px !important;
  font-weight: 600 !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-sm);
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
`;

const ChartLayout = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
`;
