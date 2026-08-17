import React, { useState } from "react";
import styled from "styled-components";
import { 
  Button, 
  Tabs, 
  Input, 
  Table, 
  Space,
  Badge as AntdBadge,
  Empty
} from "antd";
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  CheckOutlined
} from "@ant-design/icons";
import { message } from "antd";

import { useNavigate } from "react-router-dom";
import { PATH_ORDER_COMPOSER } from "../../routes/pathname";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useOrders from "../../hooks/useOrders";
import useTables from "../../hooks/useTables";
import useSettings from "../../hooks/useSettings";
import useItemStore from "../../hooks/useItemStore";
import OrderDetailDrawer from "./components/OrderDetailDrawer";

const { TabPane } = Tabs;

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":   return <AntdBadge status="warning"    text="Pending" />;
    case "Preparing": return <AntdBadge status="processing" text="Preparing" />;
    case "Ready":     return <AntdBadge status="success"    text="Ready" />;
    case "Served":    return <AntdBadge status="default"    text="Served" />;
    case "Cancelled": return <AntdBadge status="error"      text="Cancelled" />;
    default:          return <AntdBadge status="default"    text={status} />;
  }
};

const OrdersListing = () => {
  const navigate = useNavigate();
  const { orders, loading, updateOrderStatus } = useOrders();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState("");

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const handleStatusChange = async (orderId, nextStatus) => {
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
      order.id?.toLowerCase().includes(searchText.toLowerCase()) ||
      (order.table_name && order.table_name.toLowerCase().includes(searchText.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <strong style={{ color: "var(--color-primary-light)" }}>#{id}</strong>,
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
      render: (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      title: "Bill Amount",
      dataIndex: "total",
      key: "total",
      render: (total) => <strong>{settings.currency || "Rs."} {total?.toFixed(2)}</strong>,
    },
    {
      title: "Payment",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status, record) => (
        <PaymentTag $paid={status === "Paid"}>
          {status} {record.payment_method ? `(${record.payment_method})` : ""}
        </PaymentTag>
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
          {record.status === "Pending" && (
            <Button
              size="small"
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={() => handleStatusChange(record.id, "Preparing")}
            >
              Cook
            </Button>
          )}
          {record.status === "Preparing" && (
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
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader
         
          title="Orders Live Desk"
          subtitle="Manage active dining tickets, process states, and compose sales receipts."
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(PATH_ORDER_COMPOSER)}
          style={{ height: 38, fontWeight: 600, borderRadius: 10 }}
        >
          New POS Order
        </Button>
      </HeaderBox>

      {/* Main panel card */}
      <PanelCard>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 0, flex: 1 }}
          >
            <TabPane tab="All"       key="All" />
            <TabPane tab="Pending"   key="Pending" />
            <TabPane tab="Preparing" key="Preparing" />
            <TabPane tab="Ready"     key="Ready" />
            <TabPane tab="Served"    key="Served" />
            <TabPane tab="Cancelled" key="Cancelled" />
          </Tabs>

          <Input
            placeholder="Search by Order ID or Table..."
            prefix={<SearchOutlined style={{ color: "var(--color-text-secondary)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280, height: 36, borderRadius: 8 }}
          />
        </div>

        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No orders match filters" /> }}
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
  gap: 16px;
`;

const PanelCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: 24px;
`;

const PaymentTag = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $paid }) => $paid ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${({ $paid }) => $paid ? "#10b981" : "#ef4444"};
`;
