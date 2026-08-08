import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Button, Space, message, Skeleton, Result } from "antd";
import { PlusOutlined, ReloadOutlined, LockOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useCategories from "../../hooks/useCategories";
import useOrgData from "../../hooks/useOrgData";
import CategoryCard from "./components/CategoryCard";
import CategoryModal from "./components/CategoryModal";

const CategoriesListing = () => {
  const { permission } = useOrgData();
  const categoriesPerm = permission?.categories;

  const canCreate = categoriesPerm?.create ?? false;
  const canUpdate = categoriesPerm?.update ?? false;
  const canDelete = categoriesPerm?.delete ?? false;

  const {
    categories,
    loading,
    saving,
    refetch,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleOpenAddModal = () => {
    if (!canCreate) {
      message.error("You do not have permission to add categories.");
      return;
    }
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (category) => {
    if (!canUpdate) {
      message.error("You do not have permission to edit categories.");
      return;
    }
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleFormFinish = async (values) => {
    try {
      if (editingCategory) {
        if (!canUpdate) {
          message.error("You do not have permission to update categories.");
          return;
        }
        await updateCategory(editingCategory.id, values);
        message.success(`Category "${values.name}" updated successfully!`);
      } else {
        if (!canCreate) {
          message.error("You do not have permission to create categories.");
          return;
        }
        await addCategory(values);
        message.success(`Category "${values.name}" added successfully!`);
      }
      setModalVisible(false);
      setEditingCategory(null);
    } catch (err) {
      if (err.code === "23505") {
        message.error("A category with this name already exists.");
      } else {
        message.error("Failed to save category.");
      }
    }
  };

  const handleDelete = async (categoryId) => {
    if (!canDelete) {
      message.error("You do not have permission to delete categories.");
      return;
    }
    try {
      await deleteCategory(categoryId);
      message.success("Category deleted successfully!");
    } catch (err) {
      console.error("Failed to delete category:", err);
      message.error("Failed to delete category.");
    }
  };


  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader
          title="Categories"
          subtitle={`${categories?.length ?? 0} categories managed`}
        />
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refetch}
            style={{ height: 32, width: 32, borderRadius: 8 }}
            disabled={loading}
          />
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddModal}
              style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
              disabled={loading}
            >
              Add Category
            </Button>
          )}
        </Space>
      </HeaderBox>

      {/* Grid Content */}
      <ContentArea>
        {loading ? (
          <SkeletonGrid>
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i}>
                <Skeleton active avatar={{ size: "small", shape: "square" }} title={{ width: "60%" }} paragraph={false} />
              </SkeletonCard>
            ))}
          </SkeletonGrid>
        ) : (
          <CardGrid>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
            {canCreate && (
              <AddCardContainer onClick={handleOpenAddModal}>
                <PlusIconWrapper>
                  <PlusOutlined />
                </PlusIconWrapper>
                <AddText>Add Category</AddText>
              </AddCardContainer>
            )}
          </CardGrid>
        )}
      </ContentArea>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
        }}
        onFinish={handleFormFinish}
        editingCategory={editingCategory}
        categories={categories}
        loading={saving}
      />
    </PageWrapper>
  );
};

export default CategoriesListing;

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

const ContentArea = styled.div`
  margin-top: 18px;
  animation: ${fadeIn} 0.35s ease;
`;

const AddCardContainer = styled.div`
  background: var(--color-surface);
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  height: 64px;
  min-width: 160px;
  width: max-content;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    min-width: 130px;
  }
`;

const PlusIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  transition: all var(--transition-base);

  ${AddCardContainer}:hover & {
    background: var(--color-primary);
    color: white;
  }
`;

const AddText = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
  transition: color var(--transition-base);

  ${AddCardContainer}:hover & {
    color: var(--color-primary);
  }
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const SkeletonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const SkeletonCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  padding: 12px 14px;
  height: 64px;
  min-width: 160px;
  width: max-content;
  display: flex;
  align-items: center;

  .ant-skeleton {
    display: flex;
    align-items: center;
    width: 100px;
  }

  @media (max-width: 480px) {
    min-width: 130px;
  }
`;