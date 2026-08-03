import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Row, Col, Table, Skeleton, Empty, Select, Space, Button } from "antd";
import { FilePdfOutlined, CalendarOutlined, PieChartOutlined, TrophyOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper, SurfaceCard } from "../../styles/commonstyle";
import { SalesSplineChart, SalesCategoryDonut, BusyHoursChart } from "./components/AnalyticsCharts";
import * as service from "../../../services";

const { Option } = Select;

const ReportsAnalytics = () => {
  const { userId } = useSelector((state) => state.authSlice);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [timePeriod, setTimePeriod] = useState("Weekly");

  const [topSellers, setTopSellers] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});

  useEffect(() => {
    const fetchReportsData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [ordersList, config] = await Promise.all([
          service.getOrders(userId),
          service.getSettings(userId)
        ]);

        setOrders(ordersList);
        setSettings(config);

        // Compile sales totals
        const paidOrders = ordersList.filter(o => o.status !== "Cancelled");
        const totalSales = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
        const avgOrderVal = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;

        setSalesSummary({
          totalSales: Math.round(totalSales),
          avgOrderVal: Math.round(avgOrderVal),
          transactionsCount: paidOrders.length,
          cancelledCount: ordersList.filter(o => o.status === "Cancelled").length
        });

        // Compile top selling products from orders json items!
        const itemsFreq = {};
        paidOrders.forEach((o) => {
          o.items?.forEach((item) => {
            if (itemsFreq[item.name]) {
              itemsFreq[item.name].quantity += item.quantity;
              itemsFreq[item.name].revenue += item.price * item.quantity;
            } else {
              itemsFreq[item.name] = {
                name: item.name,
                category: item.category || "Food",
                quantity: item.quantity,
                revenue: item.price * item.quantity
              };
            }
          });
        });

        const topProducts = Object.values(itemsFreq)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        // If no products sold yet, add dummy sellers for demonstration!
        if (topProducts.length === 0) {
          setTopSellers([
            { name: "Margherita Pizza", category: "Food", quantity: 38, revenue: 13262 },
            { name: "Sizzler Special", category: "Food", quantity: 24, revenue: 11976 },
            { name: "Paneer Tikka Platter", category: "Food", quantity: 18, revenue: 5382 },
            { name: "Mint Mojito", category: "Drinks", quantity: 15, revenue: 2235 },
            { name: "Warm Brownie Fudge", category: "Desserts", quantity: 12, revenue: 2388 }
          ]);
        } else {
          setTopSellers(topProducts);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [userId]);

  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 60,
      render: (_, __, index) => (
        <RankBadge $rank={index + 1}>
          {index + 1 === 1 ? <TrophyOutlined style={{ color: "#f59e0b" }} /> : index + 1}
        </RankBadge>
      )
    },
    {
      title: "Dish Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <strong>{name}</strong>
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => <Tag color="cyan">{cat}</Tag>
    },
    {
      title: "Units Sold",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => <strong style={{ color: "var(--color-primary-light)" }}>{qty} units</strong>
    },
    {
      title: "Revenue Yielded",
      dataIndex: "revenue",
      key: "revenue",
      render: (rev) => <strong>{settings.currency || "Rs."} {rev?.toLocaleString()}</strong>
    }
  ];

  const currency = settings.currency || "Rs.";

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader 
          breadcrumb={["Dashboard", "Reports"]}
          title="Restaurant Analytics & Reports"
          subtitle="View business insights, hourly traffic peaks, top sellers, and payment breakdowns."
        />
        <Space>
          <Select 
            value={timePeriod} 
            onChange={setTimePeriod}
            style={{ width: 140, height: 38 }}
          >
            <Option value="Weekly">Weekly Report</Option>
            <Option value="Monthly">Monthly Report</Option>
            <Option value="Yearly">Annual Audit</Option>
          </Select>
          <Button 
            type="primary"
            icon={<FilePdfOutlined />}
            style={{ height: 38, fontWeight: 600, borderRadius: 10, background: "var(--color-primary-light)" }}
            onClick={() => message.info("Generating PDF Audit report...")}
          >
            Export PDF
          </Button>
        </Space>
      </HeaderBox>

      {loading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <>
          {/* Top overview grids */}
          <SummaryGrid>
            <SummaryCard>
              <span>Net Gross Earnings</span>
              <strong>{currency} {salesSummary.totalSales?.toLocaleString()}</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Average Order Basket</span>
              <strong>{currency} {salesSummary.avgOrderVal?.toLocaleString()}</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Transactions count</span>
              <strong>{salesSummary.transactionsCount} bills settled</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Cancelled Orders</span>
              <strong style={{ color: "#ef4444" }}>{salesSummary.cancelledCount} failed</strong>
            </SummaryCard>
          </SummaryGrid>

          {/* Central Analytics layouts */}
          <ChartsGrid>
            <Col xs={24} lg={16}>
              <SalesSplineChart />
            </Col>
            <Col xs={24} lg={8}>
              <SalesCategoryDonut />
            </Col>
          </ChartsGrid>

          {/* Bottom tables and columns */}
          <BottomGrid>
            <Col xs={24} lg={16}>
              <TableCard>
                <TableTitle>
                  <TrophyOutlined style={{ color: "#f59e0b" }} />
                  <span>Top-Selling Menu Scoreboard</span>
                </TableTitle>
                <Table 
                  dataSource={topSellers} 
                  columns={columns} 
                  rowKey="name" 
                  pagination={false}
                  size="middle"
                />
              </TableCard>
            </Col>

            <Col xs={24} lg={8}>
              <BusyHoursChart />
            </Col>
          </BottomGrid>
        </>
      )}
    </PageWrapper>
  );
};

export default ReportsAnalytics;

const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
`;

const SummaryCard = styled(SurfaceCard)`
  display: flex;
  flex-direction: column;
  gap: 5px;
  span { font-size: 11.5px; color: var(--color-text-secondary); font-weight: 500; }
  strong { font-size: 16px; font-weight: 800; font-family: var(--font-display); color: var(--color-text-primary); }
`;

const ChartsGrid = styled(Row)`
  width: 100%;
  gap: 16px;
  margin-top: 10px;
  .ant-col { flex: 1; }
`;

const BottomGrid = styled(ChartsGrid)`
  margin-top: 10px;
`;

const TableCard = styled(SurfaceCard)`
  padding: 16px;
`;

const TableTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
`;

const RankBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $rank }) => 
    $rank === 1 ? "rgba(245,158,11,0.12)" : "var(--color-bg)"};
  color: ${({ $rank }) => 
    $rank === 1 ? "#f59e0b" : "var(--color-text-secondary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
`;

