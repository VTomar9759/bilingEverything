import React from "react";
import styled from "styled-components";
import { Button, Tooltip, Popconfirm, Badge } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  TableOutlined,
} from "@ant-design/icons";
import RolePermissions from "./RolePermissions";

const AdminCard = ({
  admin,
  onEdit,
  onDelete,
  assignedTables = [],
  isSelectedForTables = false,
  onSelectForTables,
}) => {
  const tableCount = assignedTables.length;

  return (
    <CardContainer $isSelected={isSelectedForTables}>
      <CardTopRow>
        <HeaderInfo>
          <AdminName>{admin.name}</AdminName>
          <TagsRow>
            <AdminTag>
              <SafetyCertificateOutlined />
              <span>Admin</span>
            </AdminTag>
            {onSelectForTables && (
              <Tooltip title={tableCount > 0 ? `Assigned to ${tableCount} dining table(s)` : "Assign dining tables"}>
                <TablePermissionTag
                  $hasTables={tableCount > 0}
                  $active={isSelectedForTables}
                  onClick={() => onSelectForTables(admin.id)}
                >
                  <TableOutlined />
                  <span>{tableCount > 0 ? `${tableCount} Table(s)` : "Assign Tables"}</span>
                </TablePermissionTag>
              </Tooltip>
            )}
          </TagsRow>
        </HeaderInfo>

        <ActionButtons>
          {onEdit && (
            <Tooltip title="Edit Permissions & Details">
              <ActionButton
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(admin)}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete Admin">
              <Popconfirm
                title="Delete Admin"
                description={`Are you sure you want to delete ${admin.name}?`}
                onConfirm={() => onDelete(admin)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <ActionButton
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </ActionButtons>
      </CardTopRow>

      <DetailRow>
        <MailOutlined style={{ color: "var(--color-primary, #01514b)", fontSize: "14px" }} />
        <EmailText>{admin.email}</EmailText>
      </DetailRow>

      <Divider />

      <RolePermissions permissions={admin?.permissions || admin?.permission} />
    </CardContainer>
  );
};

export default AdminCard;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid ${(props) => (props.$isSelected ? "var(--color-primary, #01514b)" : "var(--color-border-light, #f1f5f9)")};
  border-radius: var(--radius-lg, 12px);
  padding: 16px;
  min-width: 280px;
  max-width: 360px;
  flex: 1 1 300px;

  @media (max-width: 480px) {
    min-width: 100%;
    max-width: 100%;
  }
  box-shadow: ${(props) => (props.$isSelected ? "0 0 0 2px rgba(1, 81, 75, 0.15)" : "var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))")};
  transition: all var(--transition-base, 0.2s ease);
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    border-color: var(--color-primary-100, #ccece7);
    transform: translateY(-2px);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AdminName = styled.h3`
  font-family: var(--font-display, inherit);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const AdminTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
`;

const TablePermissionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: ${(props) =>
    props.$active
      ? "var(--color-primary-50, #e6f4f2)"
      : props.$hasTables
      ? "#eff6ff"
      : "#f8fafc"};
  border: 1px solid
    ${(props) =>
      props.$active
        ? "var(--color-primary, #01514b)"
        : props.$hasTables
        ? "#bfdbfe"
        : "#e2e8f0"};
  color: ${(props) =>
    props.$active
      ? "var(--color-primary, #01514b)"
      : props.$hasTables
      ? "#2563eb"
      : "#64748b"};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #01514b);
    color: var(--color-primary, #01514b);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButton = styled(Button)`
  width: 32px;
  height: 32px;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-surface, #ffffff);
  color: var(--color-text-secondary, #475569);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #01514b);
    color: var(--color-primary, #01514b);
  }

  &.ant-btn-dangerous {
    border-color: #fecdd3;
    color: #ef4444;

    &:hover {
      background: #fef2f2;
      border-color: #ef4444;
      color: #dc2626;
    }
  }
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary, #475569);
  margin-top: 2px;
`;

const EmailText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border-light, #f1f5f9);
  margin: 4px 0 2px 0;
`;
