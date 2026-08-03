import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { PlusOutlined, FileSyncOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import DashboardStats from "./components/DashboardStats";
import {
  SalesSplineChart,
  BusyHoursChart,
} from "../reports/components/AnalyticsCharts";
import * as service from "../../../services";
import { PATH_BILLING, PATH_ORDER_COMPOSER } from "../../routes/pathname";
import { TABLE_STATUS } from "../../utils/constant";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { userId } = useSelector((state) => state.authSlice);
  const itemsCatalog = useSelector((state) => state.itemSlice);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [ordersList, tablesList, config] = await Promise.all([
          service.getOrders(userId),
          service.getTables(userId),
          service.getStaff(userId),
          service.getInventory(userId, itemsCatalog),
          service.getSettings(userId),
        ]);

        setSettings(config);

        // Compute metrics
        const completedPaidOrders = ordersList.filter(
          (o) => o.status !== "Cancelled",
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
          (t) => t.status === TABLE_STATUS.occupied,
        ).length;
        const totalTablesCount = tablesList.length;
        const occupancyRate =
          totalTablesCount > 0
            ? Math.round((occupiedTablesCount / totalTablesCount) * 100)
            : 0;

        setStats({
          revenue: Math.round(totalRevenue),
          activeOrders: activeOrdersCount,
          preparingOrders: preparingOrdersCount,
          occupiedTables: occupiedTablesCount,
          totalTables: totalTablesCount,
          occupancyRate,
          totalItmes: itemsCatalog,
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
            onClick={() => navigate(PATH_ORDER_COMPOSER)}
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
