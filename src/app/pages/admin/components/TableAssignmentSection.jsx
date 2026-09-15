import React, { useState } from "react";
import styled from "styled-components";
import { Card, Tag, Tooltip, Checkbox, Spin, Empty, message, Badge } from "antd";
import {
  TableOutlined,
  UserOutlined,
  CheckCircleFilled,
  SwapOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const TableAssignmentSection = ({
  admins = [],
  tables = [],
  loadingTables = false,
  onUpdateTable,
  selectedAdminId,
  onSelectAdmin,
}) => {
  const [updatingTableId, setUpdatingTableId] = useState(null);

  // If no admin explicitly selected, default to the first admin if available
  const currentAdminId = selectedAdminId || admins[0]?.id;
  const currentAdmin = admins.find((a) => a.id === currentAdminId);

  const handleToggleTable = async (table, isChecked) => {
    if (!currentAdminId) {
      message.warning("Please select an admin first.");
      return;
    }

    if (!onUpdateTable) return;

    setUpdatingTableId(table.id);
    try {
      const newBranchPermission = isChecked ? currentAdminId : null;
      await onUpdateTable(table.id, { branch_permission: newBranchPermission });
      
      const tableName = table.table_number || table.name || `Table #${table.id}`;
      if (isChecked) {
        message.success(`Assigned ${tableName} to admin "${currentAdmin?.name || 'Admin'}"`);
      } else {
        message.info(`Unassigned ${tableName}`);
      }
    } catch (err) {
      console.error("Failed to update table branch_permission:", err);
      message.error(err?.message || "Failed to update table assignment.");
    } finally {
      setUpdatingTableId(null);
    }
  };

  if (!admins || admins.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <HeaderBox>
        <TitleGroup>
          <TableOutlined style={{ fontSize: 20, color: "var(--color-primary, #01514b)" }} />
          <div>
            <SectionTitle>Dining Table Branch Permissions</SectionTitle>
          </div>
        </TitleGroup>

        {/* Admin Selection Selector */}
        <AdminSelectorRow>
          <AdminSelectorLabel>Select Admin:</AdminSelectorLabel>
          <AdminChipsGroup>
            {admins.map((admin) => {
              const isSelected = admin.id === currentAdminId;
              const assignedCount = tables.filter((t) => t.branch_permission === admin.id).length;

              return (
                <AdminChip
                  key={admin.id}
                  $active={isSelected}
                  onClick={() => onSelectAdmin && onSelectAdmin(admin.id)}
                >
                  <UserOutlined style={{ fontSize: 12 }} />
                  <ChipName>{admin.name}</ChipName>
                  <Badge
                    count={assignedCount}
                    overflowCount={99}
                    style={{
                      backgroundColor: isSelected ? "var(--color-primary, #01514b)" : "#94a3b8",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                </AdminChip>
              );
            })}
          </AdminChipsGroup>
        </AdminSelectorRow>
      </HeaderBox>

      {/* Main Table Assignment Grid */}
      <ContentBox>
        {!currentAdmin ? (
          <Empty description="Select an admin above to assign dining tables" />
        ) : loadingTables ? (
          <SpinBox>
            <Spin size="medium" tip="Loading dining tables..." />
          </SpinBox>
        ) : tables.length === 0 ? (
          <Empty description="No dining tables available in the organization." />
        ) : (
          <TableGrid>
            {tables.map((table) => {
              const tableName = table.table_number || table.name || `Table ${table.id}`;
              const isAssignedToCurrent = table.branch_permission === currentAdminId;
              const otherAssignedAdmin = !isAssignedToCurrent && table.branch_permission
                ? admins.find((a) => a.id === table.branch_permission)
                : null;
              const isUpdating = updatingTableId === table.id;

              return (
                <TableCardItem
                  key={table.id}
                  $assigned={isAssignedToCurrent}
                  $otherAssigned={!!otherAssignedAdmin}
                  onClick={() => {
                    if (isUpdating) return;
                    handleToggleTable(table, !isAssignedToCurrent);
                  }}
                >
                  <CardHeaderRow>
                    <TableNameGroup>
                      <TableOutlined style={{ color: isAssignedToCurrent ? "#16a34a" : otherAssignedAdmin ? "#15803d" : "#64748b" }} />
                      <TableNameText>{tableName}</TableNameText>
                    </TableNameGroup>
                    <Checkbox
                      checked={isAssignedToCurrent}
                      disabled={isUpdating}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleTable(table, e.target.checked);
                      }}
                    />
                  </CardHeaderRow>

                  <CardDetailsRow>
                    {table.floor || table.section ? (
                      <FloorTag>{table.floor || table.section}</FloorTag>
                    ) : null}
                    {table.capacity ? (
                      <CapacityText>{table.capacity} Seats</CapacityText>
                    ) : null}
                  </CardDetailsRow>

                  <StatusFooter>
                    {isUpdating ? (
                      <UpdatingText>Updating...</UpdatingText>
                    ) : isAssignedToCurrent ? (
                      <AssignedBadge>
                        <CheckCircleFilled style={{ color: "#16a34a" }} />
                        <span>Assigned to {currentAdmin.name}</span>
                      </AssignedBadge>
                    ) : otherAssignedAdmin ? (
                      <Tooltip title={`Click to reassign to ${currentAdmin.name}`}>
                        <OtherAdminBadge>
                          <CheckCircleFilled style={{ color: "#16a34a" }} />
                          <span>Assigned to {otherAssignedAdmin.name}</span>
                        </OtherAdminBadge>
                      </Tooltip>
                    ) : (
                      <UnassignedTag>Unassigned</UnassignedTag>
                    )}
                  </StatusFooter>
                </TableCardItem>
              );
            })}
          </TableGrid>
        )}
      </ContentBox>
    </SectionContainer>
  );
};

export default TableAssignmentSection;

/* ─── Styled Components ─── */
const SectionContainer = styled.div`
  margin-top: 24px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border-light, #e2e8f0);
  border-radius: var(--radius-xl, 16px);
  padding: 20px;
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.05));
  animation: fadeIn 0.3s ease;
`;

const HeaderBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  font-family: var(--font-display, inherit);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
`;

const SectionSub = styled.p`
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
  margin: 2px 0 0 0;
`;

const AdminSelectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const AdminSelectorLabel = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #475569);
`;

const AdminChipsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const AdminChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid ${(props) => (props.$active ? "var(--color-primary, #01514b)" : "var(--color-border, #e2e8f0)")};
  background: ${(props) => (props.$active ? "var(--color-primary-50, #e6f4f2)" : "#ffffff")};
  color: ${(props) => (props.$active ? "var(--color-primary, #01514b)" : "var(--color-text-secondary, #475569)")};
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #01514b);
    color: var(--color-primary, #01514b);
  }
`;

const ChipName = styled.span`
  white-space: nowrap;
`;

const ContentBox = styled.div`
  margin-top: 16px;
`;

const SpinBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const TableCardItem = styled.div`
  border: 1.5px solid
    ${(props) =>
      props.$assigned
        ? "#16a34a"
        : props.$otherAssigned
        ? "#bbf7d0"
        : "#e2e8f0"};
  background: ${(props) =>
    props.$assigned
      ? "#f0fdf4"
      : props.$otherAssigned
      ? "#f8fafc"
      : "#ffffff"};
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #16a34a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TableNameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TableNameText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
`;

const CardDetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FloorTag = styled.span`
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 500;
`;

const CapacityText = styled.span`
  font-size: 11px;
  color: #94a3b8;
`;

const StatusFooter = styled.div`
  margin-top: 4px;
  font-size: 11px;
`;

const AssignedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #15803d;
  font-weight: 700;
  font-size: 11.5px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  padding: 3px 8px;
  width: fit-content;
`;

const OtherAdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #15803d;
  font-weight: 700;
  font-size: 11.5px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 3px 8px;
  width: fit-content;
`;

const UnassignedTag = styled.span`
  color: #94a3b8;
  font-style: italic;
  font-size: 11px;
`;

const UpdatingText = styled.span`
  color: var(--color-primary, #01514b);
  font-weight: 600;
  font-size: 11px;
`;
