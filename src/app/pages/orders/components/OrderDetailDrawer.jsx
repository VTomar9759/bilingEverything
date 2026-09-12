import React from "react";
import styled from "styled-components";
import { Drawer, Button, Space } from "antd";
import useOrgData from "../../../hooks/useOrgData";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PATH_BILLING } from "../../../routes/pathname";
import { getStatusBadge } from "../../../utils/common_function";


const OrderDetailDrawer = ({
  open,
  order,
  settings = {},
  onClose,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { userData, hasGst } = useOrgData();
  if (!order) return null;

  return (
    <Drawer
      title={
        <DrawerHeader>
          Order Details #{order.order_number || order.id}
        </DrawerHeader>
      }
      placement="right"
      width={360}
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
            <span>Invoice Status</span>
            <strong>{order.status === "Served" ? "Generated" : "Pending"}</strong>
          </MetaRow>
        </DetailSection>

        <DetailSection>
          <SectionTitle>Itemized Dishes</SectionTitle>
          {order.items?.map((item, idx) => {
            const isItemGst =
              hasGst &&
              item?.gst_status !== false &&
              String(item?.gst_status) !== "false";

            return (
              <DishRow key={idx}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <DishName>{item.name}</DishName>
                    {isItemGst && (
                      <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                        (5% GST)
                      </span>
                    )}
                  </div>
                  <DishPrice>
                    {settings.currency || "Rs."} {item.price} each
                  </DishPrice>
                </div>
                <DishQty>x{item.quantity}</DishQty>
                <DishTotal>
                  {settings.currency || "Rs."}{" "}
                  {(item.price * item.quantity).toFixed(2)}
                </DishTotal>
              </DishRow>
            );
          })}
        </DetailSection>

        <DetailSection>
          <SectionTitle>Billing Calculations</SectionTitle>
          <MetaRow>
            <span>Subtotal</span>
            <span>
              {settings.currency || "Rs."} {order.subtotal?.toFixed(2)}
            </span>
          </MetaRow>
          {hasGst && (
            <MetaRow>
              <span>CGST (2.5%) + SGST (2.5%)</span>
              <span>
                {settings.currency || "Rs."}{" "}
                {Number(order.tax || 0).toFixed(2)}
              </span>
            </MetaRow>
          )}
          <DashedLine />
          <MetaRow
            style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: "var(--color-primary)",
            }}
          >
            <span>Grand Total</span>
            <span>
              {settings.currency || "Rs."} {order.total?.toFixed(2)}
            </span>
          </MetaRow>
        </DetailSection>

        <Space
          direction="vertical"
          style={{ width: "100%", marginTop: 16 }}
          size={10}
        >
          {order.status === "Pending" && (
            <Button
              type="primary"
              block
              icon={<ClockCircleOutlined />}
              onClick={() => onStatusChange(order.id, "Preparing")}
              style={{ height: 32, borderRadius: 8 }}
            >
              Mark as Preparing
            </Button>
          )}
          {order.status === "Preparing" && (
            <Button
              type="primary"
              block
              icon={<CheckOutlined />}
              style={{
                background: "#10b981",
                borderColor: "#10b981",
                height: 32,
                borderRadius: 8,
              }}
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
              style={{ height: 32, borderRadius: 8 }}
            >
              Cancel Order
            </Button>
          )}
          {order.status !== "Cancelled" && (
            <Button
              type="default"
              block
              icon={<FileTextOutlined />}
              onClick={() => {
                navigate(PATH_BILLING, { state: { orderId: order.id } });
                onClose();
              }}
              style={{
                height: 32,
                borderRadius: 8,
                borderColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              Generate Invoice
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
  font-size: 14px;
  color: var(--color-text-primary);
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailSection = styled.div`
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 6px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  strong {
    color: var(--color-text-primary);
  }
`;

const DashedLine = styled.div`
  border-top: 1px dashed var(--color-border);
  margin: 4px 0;
`;

const DishRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
`;

const DishName = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
`;

const DishPrice = styled.div`
  font-size: 10px;
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
  padding: 2.5px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $paid }) =>
    $paid ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${({ $paid }) => ($paid ? "#10b981" : "#ef4444")};
`;
