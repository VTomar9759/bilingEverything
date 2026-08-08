import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Button, Space, message, Skeleton, Input, Empty } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, UserAddOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useAdmins from "../../hooks/useAdmins";
import useOrgData from "../../hooks/useOrgData";
import AdminCard from "./components/AdminCard";
import AdminModal from "./components/AdminModal";

const AdminListing = () => {
  const { permission } = useOrgData();
  const settingsPerm = permission?.settings;
  const canCreate = settingsPerm?.create ?? false;
  const canUpdate = settingsPerm?.update ?? false;
  const canDelete = settingsPerm?.delete ?? false;

  const {
    admins,
    loading,
    saving,
    orgId,
    createdBy,
    refetch,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdmins();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenAddModal = () => {
    if (!canCreate) {
      message.error("You do not have permission to create admins.");
      return;
    }
    if (admins?.length >= 4) {
      message.warning("Maximum limit of 4 admins reached.");
      return;
    }
    setEditingAdmin(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (admin) => {
    if (!canUpdate) {
      message.error("You do not have permission to edit admins.");
      return;
    }
    setEditingAdmin(admin);
    setModalVisible(true);
  };

  const handleFormFinish = async (values) => {
    try {
      
      if (editingAdmin) {
        if (!canUpdate) {
          message.error("You do not have permission to edit admins.");
          return;
        }
        await updateAdmin(editingAdmin.id, values);
        message.success(`Admin "${values.name}" updated successfully!`);
      } else {
        if (!canCreate) {
          message.error("You do not have permission to create admins.");
          return;
        }
        if (admins?.length >= 4) {
          message.error("Cannot create admin. Maximum limit of 4 admins reached.");
          return;
        }
        await addAdmin(values);
        message.success(`Admin "${values.name}" created successfully!`);
      }
      setModalVisible(false);
      setEditingAdmin(null);
    } catch (err) {
      if (err?.code === "23505" || err?.message?.includes("unique")) {
        message.error("An admin with this email address already exists.");
      } else {
        message.error(err?.message || "Failed to save admin user.");
      }
    }
  };

  const handleDelete = async (adminId) => {
    if (!canDelete) {
      message.error("You do not have permission to delete admins.");
      return;
    }
    try {
      await deleteAdmin(adminId);
      message.success("Admin deleted successfully!");
    } catch (err) {
      console.error("Failed to delete admin:", err);
      message.error("Failed to delete admin.");
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const perms = admin.permissions || admin.permission || {};
    return (
      admin.name?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query) ||
      perms?.role?.toLowerCase().includes(query)
    );
  });

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader
          title="Admin Management"
          subtitle={`${admins?.length ?? 0} / 4 admins registered`}
        />
        <RightControls>
          <Input
            prefix={<SearchOutlined style={{ color: "var(--color-text-muted)" }} />}
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 220, borderRadius: 8, height: 32 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={refetch}
            style={{ height: 32, width: 32, borderRadius: 8 }}
            disabled={loading}
          />
          {canCreate && filteredAdmins?.length < 4 && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddModal}
              style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
              disabled={loading || admins?.length >= 4}
            >
              Create Admin
            </Button>
          )}
        </RightControls>
      </HeaderBox>

      {/* Content Area */}
      <ContentArea>
        {loading ? (
          <SkeletonGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i}>
                <Skeleton active avatar title={{ width: "50%" }} paragraph={{ rows: 2 }} />
              </SkeletonCard>
            ))}
          </SkeletonGrid>
        ) : filteredAdmins.length === 0 ? (
          <EmptyBox>
            <Empty
              description={
                searchQuery
                  ? "No admins found matching your search"
                  : "No admins created yet"
              }
            >
              {canCreate && !searchQuery && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleOpenAddModal}
                  style={{ borderRadius: 8 }}
                  disabled={admins?.length >= 4}
                >
                  Create Admin Now
                </Button>
              )}
            </Empty>
          </EmptyBox>
        ) : (
          <CardGrid>
            {filteredAdmins.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                onEdit={canUpdate ? handleOpenEditModal : undefined}
                onDelete={canDelete ? handleDelete : undefined}
              />
            ))}
            
          </CardGrid>
        )}
      </ContentArea>

      {/* Create / Edit Admin Modal */}
      <AdminModal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAdmin(null);
        }}
        onFinish={handleFormFinish}
        editingAdmin={editingAdmin}
        loading={saving}
        orgId={orgId}
        createdBy={createdBy}
      />
    </PageWrapper>
  );
};

export default AdminListing;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  animation: ${fadeIn} 0.3s ease;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ContentArea = styled.div`
  margin-top: 18px;
  animation: ${fadeIn} 0.35s ease;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const AddCardContainer = styled.div`
  background: var(--color-surface);
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  min-width: 280px;
  max-width: 360px;
  flex: 1 1 300px;
  height: 146px;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
    transform: translateY(-2px);
  }
`;

const PlusIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  transition: all var(--transition-base);

  ${AddCardContainer}:hover & {
    background: var(--color-primary);
    color: white;
  }
`;

const AddText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
  transition: color var(--transition-base);

  ${AddCardContainer}:hover & {
    color: var(--color-primary);
  }
`;

const SkeletonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const SkeletonCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  padding: 16px;
  min-width: 280px;
  flex: 1 1 300px;
  height: 146px;
`;

const EmptyBox = styled.div`
  padding: 40px 0;
  display: flex;
  justify-content: center;
`;
