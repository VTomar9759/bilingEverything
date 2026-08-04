import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Button, Row, Col, Skeleton } from "antd";
import { PlusOutlined, AppstoreOutlined } from "@ant-design/icons";
import { PATH_ADD_ITEM } from "../../routes/pathname";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import ItemCard from "./components/ItemCard";
import useItemStore from "../../hooks/useItemStore";
import InputSearch from "../../../components/SearchInput";
import CategorySelecter from "../../../components/CategorySelecter";

const ItemListing = () => {
  const navigate = useNavigate();
  const [items, loading] = useItemStore({ search: "", filter: "" });
  const [data, setData] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState("all");

  const handleSearch = (searchValue) => {
    setSelectedCatId("all");
    if (!searchValue) {
      setData(items);
      return;
    }
    const filtered = items?.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchValue.toLowerCase()),
    );
    setData(filtered);
  };

  const handleCategoryFilter = (catId) => {
    setSelectedCatId(catId);
    if (catId === "all") {
      setData(items);
    } else {
      const filtered = items?.filter((item) => item?.category_id === catId);
      setData(filtered);
    }
  };

  useEffect(() => {
    if (items) {
      if (selectedCatId === "all") {
        setData(items);
      } else {
        const filtered = items?.filter(
          (item) => item?.category_id === selectedCatId,
        );
        setData(filtered);
      }
    }
  }, [items, selectedCatId]);

  return (
    <PageWrapper>
      {/* Page header */}
      <PageHead>
        <TabHeader
          title="Items Catalog"
          subtitle={`${data?.length ?? 0} products in your catalog`}
        />
        <HeadActions>
          <></>

          <InputSearch
            width="220px"
            onSearch={handleSearch}
            placeholder="Search by name or code..."
          />
          <AddButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(PATH_ADD_ITEM)}
          >
            Add Item
          </AddButton>
        </HeadActions>
      </PageHead>
      <CategorySelecter onChange={handleCategoryFilter} value={selectedCatId} />

      {/* Content */}
      <ContentArea>
        {loading ? (
          <SkeletonGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i}>
                <Skeleton.Image
                  active
                  style={{ width: "100%", height: 144, borderRadius: 11 }}
                />
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  style={{ marginTop: 12 }}
                />
              </SkeletonCard>
            ))}
          </SkeletonGrid>
        ) : data?.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <AppstoreOutlined />
            </EmptyIcon>
            <EmptyTitle>No items yet</EmptyTitle>
            <EmptyDesc>
              Your catalog is empty. Start adding products to manage your
              inventory.
            </EmptyDesc>
            <AddButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(PATH_ADD_ITEM)}
              size="large"
            >
              Add Your First Item
            </AddButton>
          </EmptyState>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} xxl={3} key={item.id}>
                <ItemCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </ContentArea>
    </PageWrapper>
  );
};

export default ItemListing;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled ─── */
const PageHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeadActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;

    > * {
      width: 100%;
    }
  }
`;

const ContentArea = styled.div`
  animation: ${fadeIn} 0.35s ease;
`;

const AddButton = styled(Button)`
  height: 32px !important;
  padding: 0 14px !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  border-radius: var(--radius-md) !important;
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  box-shadow: 0 4px 12px rgba(1, 81, 75, 0.22) !important;
  transition: all var(--transition-base) !important;
  white-space: nowrap !important;

  &:hover {
    background: var(--color-primary-light) !important;
    border-color: var(--color-primary-light) !important;
    box-shadow: 0 6px 18px rgba(1, 81, 75, 0.32) !important;
    transform: translateY(-1px) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
`;

/* ─── Skeleton grid ─── */
const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
`;

const SkeletonCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  padding: 0 0 16px;
  overflow: hidden;

  .ant-skeleton-image {
    width: 100% !important;
    height: 144px !important;
    border-radius: 0 !important;
  }

  .ant-skeleton {
    padding: 0 16px;
  }
`;

/* ─── Empty state ─── */
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  border: 2px dashed var(--color-border);
  text-align: center;
  gap: 10px;
  animation: ${fadeIn} 0.4s ease;
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--color-primary-100);
  }
`;

const EmptyIcon = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-primary);
  margin-bottom: 4px;
`;

const EmptyTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
`;
