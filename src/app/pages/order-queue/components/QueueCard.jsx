import React from "react";
import styled from "styled-components";
import { ClockCircleOutlined } from "@ant-design/icons";

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        color: "#b45309",
        bg: "#fef3c7",
        border: "#fcd34d",
      };
    case "preparing":
      return {
        color: "#1d4ed8",
        bg: "#dbeafe",
        border: "#93c5fd",
      };
    case "ready":
      return {
        color: "#047857",
        bg: "#d1fae5",
        border: "#6ee7b7",
      };
    case "served":
    case "completed":
      return {
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
      };
    case "cancelled":
      return {
        color: "#b91c1c",
        bg: "#fee2e2",
        border: "#fca5a5",
      };
    default:
      return {
        color: "#374151",
        bg: "#f3f4f6",
        border: "#d1d5db",
      };
  }
};

const QueueCard = ({ order }) => {
  const statusConfig = getStatusConfig(order.status);
  const items = order.items || order.order_items || [];
  const itemCount = Array.isArray(items) ? items.length : 0;
  const total = order.total || order.grand_total || order.subtotal || 0;

  const createdAt = order.created_at
    ? new Date(order.created_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <CardContainer $statusColor={statusConfig.color}>
      {/* Header */}
      <CardHeader>
        <OrderNumber>#{order.order_number || order.id?.slice(0, 8)}</OrderNumber>
        <StatusPill
          $color={statusConfig.color}
          $bg={statusConfig.bg}
          $border={statusConfig.border}
        >
          <StatusDot $color={statusConfig.color} />
          {order.status || "N/A"}
        </StatusPill>
      </CardHeader>

      {/* Table Badge */}
      <TableBadge>
        <TableIcon>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </TableIcon>
        <span>{order.table_name}</span>
      </TableBadge>

      {/* Info Row */}
      <InfoRow>
        <InfoItem>
          <ClockCircleOutlined style={{ fontSize: 11 }} />
          <span>{createdAt}</span>
        </InfoItem>
        {itemCount > 0 && (
          <InfoItem>
            <span>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </InfoItem>
        )}
      </InfoRow>

      {/* Total */}
      {total > 0 && (
        <TotalRow>
          <span>Total</span>
          <strong>
            Rs.{" "}
            {Number(total).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </TotalRow>
      )}
    </CardContainer>
  );
};

export default QueueCard;

/* ─── Styled Components ─── */
const CardContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid ${({ $statusColor }) => $statusColor};
  border-radius: var(--radius-xl);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  @media (min-width: 1000px) {
    padding: 14px;
    gap: 10px;
  }

  @media (min-width: 1400px) {
    padding: 16px;
    gap: 12px;
  }

  @media (min-width: 1800px) {
    padding: 18px;
    gap: 14px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const OrderNumber = styled.span`
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;

  @media (min-width: 1000px) {
    font-size: 21px;
  }

  @media (min-width: 1400px) {
    font-size: 23px;
  }

  @media (min-width: 1800px) {
    font-size: 25px;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ $bg }) => $bg || "#f3f4f6"};
  border: 1.5px solid ${({ $border }) => $border || "#e5e7eb"};
  color: ${({ $color }) => $color || "#374151"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  @media (min-width: 1000px) {
    font-size: 13px;
    padding: 4px 12px;
    gap: 7px;
  }

  @media (min-width: 1400px) {
    font-size: 14px;
    padding: 5px 14px;
    gap: 8px;
  }

  @media (min-width: 1800px) {
    font-size: 15px;
    padding: 6px 16px;
    gap: 9px;
  }
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || "#374151"};
  display: inline-block;

  @media (min-width: 1400px) {
    width: 8px;
    height: 8px;
  }
`;

const TableBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary-50, #f0faf9);
  border: 1px solid var(--color-primary-100, rgba(1, 81, 75, 0.15));
  color: var(--color-primary, #01514b);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;

  @media (min-width: 1000px) {
    font-size: 13px;
    padding: 4px 10px;
  }

  @media (min-width: 1400px) {
    font-size: 14px;
    padding: 5px 12px;
  }

  @media (min-width: 1800px) {
    font-size: 15px;
    padding: 6px 14px;
  }
`;

const TableIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-primary);

  svg {
    width: 12px;
    height: 12px;

    @media (min-width: 1000px) {
      width: 13px;
      height: 13px;
    }

    @media (min-width: 1400px) {
      width: 15px;
      height: 15px;
    }

    @media (min-width: 1800px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (min-width: 1400px) {
    gap: 14px;
  }
`;

const InfoItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);

  .anticon {
    font-size: 12px;
  }

  @media (min-width: 1000px) {
    font-size: 13px;
    gap: 5px;
    .anticon {
      font-size: 13px;
    }
  }

  @media (min-width: 1400px) {
    font-size: 14px;
    gap: 6px;
    .anticon {
      font-size: 14px;
    }
  }

  @media (min-width: 1800px) {
    font-size: 15px;
    gap: 7px;
    .anticon {
      font-size: 15px;
    }
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  padding-top: 6px;
  border-top: 1px dashed var(--color-border);

  strong {
    color: var(--color-text-primary);
    font-weight: 700;
    font-size: 13px;
  }

  @media (min-width: 1000px) {
    font-size: 13px;
    padding-top: 7px;
    strong {
      font-size: 14px;
    }
  }

  @media (min-width: 1400px) {
    font-size: 14px;
    padding-top: 8px;
    strong {
      font-size: 16px;
    }
  }

  @media (min-width: 1800px) {
    font-size: 15px;
    padding-top: 10px;
    strong {
      font-size: 17px;
    }
  }
`;
