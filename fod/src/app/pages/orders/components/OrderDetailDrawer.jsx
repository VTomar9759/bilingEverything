import React from "react";
import styled from "styled-components";
import { Drawer, Button, Space, Badge as AntdBadge } from "antd";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending": return <AntdBadge status="warning" text="Pending" />;
    case "Preparing": return <AntdBadge status="processing" text="Preparing" />;
    case "Ready": return <AntdBadge status="success" text="Ready" />;
    case "Served": return <AntdBadge status="default" text="Served" />;
    case "Cancelled": return <AntdBadge status="error" text="Cancelled" />;
    default: return <AntdBadge status="default" text={status} />;
  }
};

const PaymentTag = ({ paid, status }) => {
  return (
    <StyledPaymentTag $paid={paid}>
      {status}
    </StyledPaymentTag>
  );
};

const OrderDetailDrawer = ({ open, order, settings, onClose, onStatusChange }) => {
  if (!order) return null;

  return (
    <Drawer
      title={<DrawerHeader>Order Details #{order.id}</DrawerHeader>}
      placement="right"
      width={420}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      <DrawerContent>
        <DetailSection>
          <SectionTitle>Status & Destination</SectionTitle>
          <MetaRow>
            <span>Table Name</span>
            <strong>{order.table_name || "Takeaway"}</strong>
          </MetaRow>
          <MetaRow>
            <span>Timestamp</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </MetaRow>
          <MetaRow>
            <span>Order Status</span>
            <span>{getStatusBadge(order.status)}</span>
          </MetaRow>
          <MetaRow>
            <span>Payment</span>
            <PaymentTag
              paid={order.payment_status === "Paid"}
              status={order.payment_status}
            />
          </MetaRow>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Itemized Dishes</SectionTitle>
          {order.items?.map((item, idx) => (
            <DishRow key={idx}>
              <div>
                <DishName>{item.name}</DishName>
                <DishPrice>{settings.currency || "Rs."} {item.price} each</DishPrice>
              </div>
              <DishQty>x{item.quantity}</DishQty>
              <DishTotal>{settings.currency || "Rs."} {(item.price * item.quantity).toFixed(2)}</DishTotal>
            </DishRow>
          ))}
        </DetailSection>

        <DetailSection>
          <SectionTitle>Billing Calculations</SectionTitle>
          <MetaRow>
            <span>Subtotal</span>
            <span>{settings.currency || "Rs."} {order.subtotal?.toFixed(2)}</span>
          </MetaRow>
          <MetaRow>
            <span>Taxes & GST ({settings.tax_rate || 18}%)</span>
            <span>{settings.currency || "Rs."} {order.tax?.toFixed(2)}</span>
          </MetaRow>
          <MetaRow>
            <span>Service Charge ({settings.service_charge_rate || 5}%)</span>
            <span>{settings.currency || "Rs."} {order.service_charge?.toFixed(2)}</span>
          </MetaRow>
          <DashedLine />
          <MetaRow style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>
            <span>Grand Total</span>
            <span>{settings.currency || "Rs."} {order.total?.toFixed(2)}</span>
          </MetaRow>
        </DetailSection>

        <Space direction="vertical" style={{ width: "100%", marginTop: 16 }} size={10}>
          {order.status === "Pending" && (
            <Button
              type="primary"
              block
              icon={<ClockCircleOutlined />}
              onClick={() => onStatusChange(order.id, "Preparing")}
              style={{ height: 38, borderRadius: 8 }}
            >
              Mark as Preparing
            </Button>
          )}
          {order.status === "Preparing" && (
            <Button
              type="primary"
              block
              icon={<CheckOutlined />}
              style={{ background: "#10b981", borderColor: "#10b981", height: 38, borderRadius: 8 }}
              onClick={() => onStatusChange(order.id, "Ready")}
            >
              Mark as Ready
            </Button>
          )}
          {order.status !== "Served" && order.status !== "Cancelled" && (
            <Button
              danger
              block
              icon={<CloseCircleOutlined />}
              onClick={() => onStatusChange(order.id, "Cancelled")}
              style={{ height: 38, borderRadius: 8 }}
            >
              Cancel Order
            </Button>
          )}
        </Space>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderDetailDrawer;

/* ─── Styled Components ─── */
const DrawerHeader = styled.span`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  color: var(--color-text-primary);
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailSection = styled.div`
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 6px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
  strong { color: var(--color-text-primary); }
`;

const DashedLine = styled.div`
  border-top: 1px dashed var(--color-border);
  margin: 4px 0;
`;

const DishRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const DishName = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
`;

const DishPrice = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const DishQty = styled.div`
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const DishTotal = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
`;

const StyledPaymentTag = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $paid }) => $paid ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${({ $paid }) => $paid ? "#10b981" : "#ef4444"};
`;
