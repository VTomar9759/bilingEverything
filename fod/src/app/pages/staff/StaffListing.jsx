import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Button, Input, Empty, Skeleton, Select, message } from "antd";
import { PlusOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useStaff from "../../hooks/useStaff";
import StaffCard from "./components/StaffCard";
import StaffFormModal from "./components/StaffFormModal";

const { Option } = Select;

const ROLE_FILTERS = ["All", "Chef", "Waiter", "Cashier", "Manager"];

const StaffListing = () => {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff();

  const [searchText, setSearchText]       = useState("");
  const [roleFilter, setRoleFilter]       = useState("All");
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  /* ── filtered list ── */
  const filtered = staff.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* ── handlers ── */
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingRecord(member);
    setModalOpen(true);
  };

  const handleFormFinish = async (values) => {
    try {
      if (editingRecord) {
        await updateStaff(editingRecord.id, values);
        message.success("Staff member updated!");
      } else {
        await addStaff(values);
        message.success("Staff member added!");
      }
      setModalOpen(false);
      setEditingRecord(null);
    } catch {
      message.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStaff(id);
      message.success("Staff member removed.");
    } catch {
      message.error("Failed to remove staff member.");
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderBox>
        <TabHeader
          breadcrumb={["Dashboard", "Staff"]}
          title="Staff Management"
          subtitle={`${staff.length} team members on roster`}
        />
        <HeadActions>
          <Input
            placeholder="Search by name or email..."
            prefix={<SearchOutlined style={{ color: "var(--color-text-secondary)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240, height: 36, borderRadius: 8 }}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 140, height: 36 }}
          >
            {ROLE_FILTERS.map((r) => <Option key={r} value={r}>{r === "All" ? "All Roles" : r}</Option>)}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
            style={{ height: 36, fontWeight: 600, borderRadius: 8 }}
          >
            Add Member
          </Button>
        </HeadActions>
      </HeaderBox>

      {/* Content */}
      {loading ? (
        <SkeletonGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} active avatar paragraph={{ rows: 3 }} />
          ))}
        </SkeletonGrid>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <EmptyIcon><TeamOutlined /></EmptyIcon>
          <EmptyTitle>{searchText || roleFilter !== "All" ? "No staff match filters" : "No staff added yet"}</EmptyTitle>
          <EmptyDesc>
            {searchText || roleFilter !== "All"
              ? "Try adjusting your search or filter criteria."
              : "Click 'Add Member' to add your first team member."}
          </EmptyDesc>
          {!searchText && roleFilter === "All" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
              Add First Member
            </Button>
          )}
        </EmptyState>
      ) : (
        <CardGrid>
          {filtered.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </CardGrid>
      )}

      {/* Add / Edit Modal */}
      <StaffFormModal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); }}
        onFinish={handleFormFinish}
        editingRecord={editingRecord}
      />
    </PageWrapper>
  );
};

export default StaffListing;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.3s ease;
`;

const HeadActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.35s ease;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  border: 2px dashed var(--color-border);
  text-align: center;
  gap: 12px;
  animation: ${fadeIn} 0.4s ease;

  &:hover { border-color: var(--color-primary-100); }
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: var(--color-primary);
  margin-bottom: 4px;
`;

const EmptyTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
`;
