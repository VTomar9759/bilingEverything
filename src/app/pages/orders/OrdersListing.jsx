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
  EditOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import dayjs from "dayjs";

import { useNavigate } from "react-router-dom";
import { PATH_BILLING, PATH_ORDER_COMPOSER, PATH_ORDER_EDIT } from "../../routes/pathname";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useOrders from "../../hooks/useOrders";
import OrderDetailDrawer from "./components/OrderDetailDrawer";
import { getStatusBadge, getPaymentStatusBadge, getPaymentModeBadge } from "../../utils/common_function";
import { ORDER_STATUS } from "../../utils/constant";
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
      width: 50,
      align: "center",
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "OrderNo.",
      dataIndex: "order_number",
      key: "order_number",
      render: (order_number) => (
        <strong style={{ color: "var(--color-primary-light)", fontSize: "13.5px" }}>
          {order_number}
        </strong>
      ),
    },
    {
      title: "Table",
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
        <strong style={{ fontSize: "13.5px" }}>
          {settings.currency || "Rs."} {total?.toFixed(2)}
        </strong>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => getPaymentStatusBadge(status || "Unpaid"),
    },
    {
      title: "Payment Mode",
      key: "payment_mode",
      render: (_, record) =>
        getPaymentModeBadge(record.payment_mode || record.payment_method) || "-",
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
      align: "right",
      render: (_, record) => (
        <Space size={6}>
  
          {canUpdate && record.status === "Preparing" && (
            <Button
              width="80px"
              size="small"
              icon={<CheckOutlined />}
              style={{ background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.1)", fontSize: "12.5px", color: "#f59e0b" }}
              onClick={() => handleStatusChange(record.id, "Ready")}
            >
              Ready
            </Button>
          )}
          {canUpdate && record.status === "Ready" && (
            <Button
              width="80px"
              size="small"
              icon={<CheckOutlined />}
              style={{ background: " #01514b", borderColor:  "#01514b", fontSize: "12.5px", color: "#fff" }}
              onClick={() => handleStatusChange(record.id, "Served")}
            >
              Serve
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
                fontSize: "12.5px",
              }}
              onClick={() =>
                navigate(PATH_BILLING, { state: { orderId: record.id } })
              }
            >
              Generate Invoice
            </Button>
          )}
   
          <Button
            size="small"
            type="default"
            icon={<EditOutlined />}
            style={{
              borderColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              fontSize: "12.5px",
            }}
            onClick={() => navigate(PATH_ORDER_EDIT, { state: { orderId: record.id } })}
          >
            Recomposer
          </Button>
                   <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ fontSize: "12.5px" }}
            onClick={() => {
              setSelectedOrder(record);
              setDetailsVisible(true);
            }}
          />
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
            {Object.values(ORDER_STATUS).map((status) => (
              <TabPane
                tab={<span>{getStatusBadge(status)}</span>}
                key={status}
              />
            ))}
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

        <StyledTable
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
  font-size: 12px;
  font-weight: 600;
  background: ${({ $paid }) =>
    $paid ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${({ $paid }) => ($paid ? "#10b981" : "#ef4444")};
`;

const StyledTable = styled(Table)`
  width: 100%;

  .ant-table {
    font-size: 13.5px !important;
  }

  .ant-table-thead > tr > th {
    font-size: 13.5px !important;
    font-weight: 700 !important;
    padding: 10px 10px !important;
  }

  .ant-table-tbody > tr > td {
    font-size: 13.5px !important;
    padding: 10px 10px !important;
  }

  .ant-badge-status-text {
    font-size: 13px !important;
  }

  .ant-table-pagination {
    font-size: 13px !important;
  }
`;
