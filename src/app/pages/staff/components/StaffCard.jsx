import React from "react";
import styled, { keyframes } from "styled-components";
import { Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

const ROLE_COLORS = {
  Chef:    { bg: "rgba(239,68,68,0.08)",   color: "#ef4444",  border: "rgba(239,68,68,0.15)"   },
  Waiter:  { bg: "rgba(59,130,246,0.08)",  color: "#3b82f6",  border: "rgba(59,130,246,0.15)"  },
  Cashier: { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b",  border: "rgba(245,158,11,0.15)"  },
  Manager: { bg: "rgba(139,92,246,0.08)",  color: "#8b5cf6",  border: "rgba(139,92,246,0.15)"  },
};

const STATUS_COLORS = {
  Active:     "#10b981",
  "On Break": "#f59e0b",
  Inactive:   "#9ca3af",
};

const SHIFT_LABELS = {
  Morning: "🌅 Morning",
  Evening: "🌆 Evening",
  Night:   "🌙 Night",
};

const StaffCard = ({ member, onEdit, onDelete }) => {
  const roleStyle   = ROLE_COLORS[member.role]  || ROLE_COLORS.Waiter;
  const statusColor = STATUS_COLORS[member.status] || "#9ca3af";
  const initials    = member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <CardWrapper>
      <CardTop>
        <AvatarCircle $color={roleStyle.color} $bg={roleStyle.bg} $border={roleStyle.border}>
          {initials}
        </AvatarCircle>
        <MetaBlock>
          <StaffName>{member.name}</StaffName>
          <RolePill $color={roleStyle.color} $bg={roleStyle.bg} $border={roleStyle.border}>
            {member.role}
          </RolePill>
        </MetaBlock>
        <ActionGroup>
          <Tooltip title="Edit">
            <ActionBtn onClick={() => onEdit(member)}>
              <EditOutlined />
            </ActionBtn>
          </Tooltip>
          <Popconfirm
            title="Remove this staff member?"
            onConfirm={() => onDelete(member.id)}
            okText="Remove"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <ActionBtn $danger>
                <DeleteOutlined />
              </ActionBtn>
            </Tooltip>
          </Popconfirm>
        </ActionGroup>
      </CardTop>

      <Divider />

      <CardBottom>
        <InfoRow>
          <StatusDot $color={statusColor} />
          <span>{member.status}</span>
          <ShiftLabel>{SHIFT_LABELS[member.shift] || member.shift}</ShiftLabel>
        </InfoRow>
        {member.phone && (
          <ContactRow>
            <PhoneOutlined style={{ fontSize: 11, color: "var(--color-text-muted)" }} />
            <span>{member.phone}</span>
          </ContactRow>
        )}
        {member.email && (
          <ContactRow>
            <MailOutlined style={{ fontSize: 11, color: "var(--color-text-muted)" }} />
            <span>{member.email}</span>
          </ContactRow>
        )}
      </CardBottom>
    </CardWrapper>
  );
};

export default StaffCard;

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const CardWrapper = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  animation: ${fadeUp} 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary-100);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  border: 1.5px solid ${({ $border }) => $border};
  color: ${({ $color }) => $color};
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: -0.5px;
`;

const MetaBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const StaffName = styled.div`
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RolePill = styled.span`
  display: inline-block;
  width: fit-content;
  padding: 1.5px 7px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const ActionBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-text-secondary)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all var(--transition-fast);

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fff5f5" : "var(--color-primary-50)")};
    border-color: ${({ $danger }) => ($danger ? "#fecaca" : "var(--color-primary-100)")};
    color: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary)")};
    transform: scale(1.08);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
`;

const CardBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const StatusDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const ShiftLabel = styled.span`
  margin-left: auto;
  font-size: 10px;
  color: var(--color-text-muted);
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--color-text-muted);
  overflow: hidden;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
