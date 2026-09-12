import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useOrgData from "../../hooks/useOrgData";
import { Button, Tabs, Input, Table, Space, Empty, DatePicker } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import dayjs from "dayjs";

import { useNavigate } from "react-router-dom";
import { PATH_BILLING } from "../../routes/pathname";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useOrders from "../../hooks/useOrders";
import OrderDetailDrawer from "./components/OrderDetailDrawer";
import { getStatusBadge } from "../../utils/common_function";
import * as service from "../../../services";

const { TabPane } = Tabs;

const OrdersListing = () => {
  const { permission, org_id } = useOrgData();
  const ordersPerm = permission?.orders;

  const canUpdate = ordersPerm?.update ?? false;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [startDate, setStartDate] = useState(() => dayjs());
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (org_id) {
      service.getSettings(org_id).then((res) => {
        if (res) setSettings(res);
      });
    }
  }, [org_id]);
  const [endDate, setEndDate] = useState(() => dayjs());

  const todayStr = dayjs().format("YYYY-MM-DD");
  const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const startDateStr = startDate ? startDate.format("YYYY-MM-DD") : "";
  const endDateStr = endDate ? endDate.format("YYYY-MM-DD") : "";

  const isTodayActive = startDateStr === todayStr && endDateStr === todayStr;
  const isYesterdayActive =
    startDateStr === yesterdayStr && endDateStr === yesterdayStr;

  const { orders, loading, total, refetch, updateOrderStatus } = useOrders({
    page,
    limit: pageSize,
    status: activeTab,
    startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
    endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
  });

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!canUpdate) {
      message.error("You do not have permission to update orders.");
      return;
    }
    try {
      await updateOrderStatus(orderId, nextStatus);
      message.success(`Order status set to ${nextStatus}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch {
      message.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" || order.status === activeTab;
    const matchesSearch =
      !searchText ||
      order.id?.toLowerCase().includes(searchText.toLowerCase()) ||
      (order.order_number &&
        String(order.order_number).toLowerCase().includes(searchText.toLowerCase())) ||
      (order.table_name &&
        order.table_name.toLowerCase().includes(searchText.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => {
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "OrderNo.",
      dataIndex: "order_number",
      key: "idorder_number  ",
      render: (order_number) => (
        <strong style={{ color: "var(--color-primary-light)" }}>
          {order_number}
        </strong>
      ),
    },
    {
      title: "Table / Destination",
      dataIndex: "table_name",
      key: "table_name",
      render: (name) => name || "Takeaway",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        new Date(date).toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Bill Amount",
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setDetailsVisible(true);
            }}
          >
            Details
          </Button>
          {canUpdate && record.status === "Pending" && (
            <Button
              size="small"
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={() => handleStatusChange(record.id, "Preparing")}
            >
              Cook
            </Button>
          )}
          {canUpdate && record.status === "Preparing" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              style={{ background: "#10b981", borderColor: "#10b981" }}
              onClick={() => handleStatusChange(record.id, "Ready")}
            >
              Ready
            </Button>
          )}
          {record.status !== "Cancelled" && (
            <Button
              size="small"
              type="default"
              icon={<FileTextOutlined />}
              style={{
                borderColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
              onClick={() =>
                navigate(PATH_BILLING, { state: { orderId: record.id } })
              }
            >
              Generate Invoice
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader breadcrumb={["Composer", "Orders"]} />
      </HeaderBox>

      {/* Main panel card */}
      <PanelCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPage(1);
            }}
            style={{ marginBottom: 0, margin: 0 }}
          >
            <TabPane tab={<span>{getStatusBadge("All")}</span>} key="All" />
            {/* <TabPane
              tab={<span>{getStatusBadge("Pending")}</span>}
              key="Pending"
            /> */}
            {/* <TabPane
              tab={<span>{getStatusBadge("Pending")}</span>}
              key="Pending"
            /> */}
            <TabPane
              tab={<span>{getStatusBadge("Preparing")}</span>}
              key="Preparing"
            />
            <TabPane tab={<span>{getStatusBadge("Ready")}</span>} key="Ready" />
            {/* <TabPane
              tab={<span>{getStatusBadge("Served")}</span>}
              key="Served"
            /> */}
            <TabPane
              tab={<span>{getStatusBadge("Cancelled")}</span>}
              key="Cancelled"
            />
          </Tabs>

          <Space wrap size="small" style={{ alignItems: "center" }}>
            <Input
              placeholder="Search by Order ID or Table..."
              prefix={
                <SearchOutlined
                  style={{ color: "var(--color-text-secondary)" }}
                />
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200, maxWidth: "100%", height: 32, borderRadius: 6 }}
            />
            <Button
              type={isTodayActive ? "primary" : "default"}
              onClick={() => {
                const today = dayjs();
                setStartDate(today);
                setEndDate(today);
                setPage(1);
                refetch();
              }}
              style={{
                height: 32,
                borderRadius: 6,
                color: isTodayActive ? "#fff" : undefined,
                backgroundColor: isTodayActive
                  ? "var(--color-primary)"
                  : undefined,
                borderColor: isTodayActive ? "var(--color-primary)" : undefined,
              }}
            >
              Today
            </Button>
            <Button
              type={isYesterdayActive ? "primary" : "default"}
              onClick={() => {
                const yesterday = dayjs().subtract(1, "day");
                setStartDate(yesterday);
                setEndDate(yesterday);
                setPage(1);
                refetch();
              }}
              style={{
                height: 32,
                borderRadius: 6,
                color: isYesterdayActive ? "#fff" : undefined,
                backgroundColor: isYesterdayActive
                  ? "var(--color-primary)"
                  : undefined,
                borderColor: isYesterdayActive
                  ? "var(--color-primary)"
                  : undefined,
              }}
            >
              Yesterday
            </Button>
            <DatePicker
              placeholder="Start Date"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                setPage(1);
              }}
              style={{ width: 130, height: 32, borderRadius: 6 }}
            />
            <DatePicker
              placeholder="End Date"
              value={endDate}
              onChange={(date) => {
                setEndDate(date);
                setPage(1);
              }}
              style={{ width: 130, height: 32, borderRadius: 6 }}
            />
            {(startDate || endDate) && (
              <Button
                type="link"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setPage(1);
                }}
                style={{ padding: 0 }}
              >
                Clear
              </Button>
            )}
          </Space>
        </div>

        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: true }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "30", "50", "100"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
          locale={{
            emptyText: <Empty description="No orders match filters" />,
          }}
        />
      </PanelCard>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={detailsVisible}
        order={selectedOrder}
        settings={settings}
        onClose={() => setDetailsVisible(false)}
        onStatusChange={handleStatusChange}
      />
    </PageWrapper>
  );
};

export default OrdersListing;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 5px;
`;

const PanelCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: 12px;
`;

const PaymentTag = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $paid }) =>
    $paid ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${({ $paid }) => ($paid ? "#10b981" : "#ef4444")};
`;
