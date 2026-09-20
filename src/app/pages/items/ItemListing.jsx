import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Button, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PATH_ADD_ITEM } from "../../routes/pathname";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import ItemCard from "./components/ItemCard";
import useItemStore from "../../hooks/useItemStore";
import InputSearch from "../../../components/SearchInput";
import CategorySelecter from "../../../components/CategorySelecter";
import { PageSpinner, EmptyPlaceholder } from "../../../loader/PageSpinner";
import useOrgData from "../../hooks/useOrgData";

const ItemListing = () => {
  const navigate = useNavigate();
  const { permission } = useOrgData();
  const itemsPerm = permission?.items_catalog;

  const canCreate = itemsPerm?.create ?? false;
  const canUpdate = itemsPerm?.update ?? false;
  const canDelete = itemsPerm?.delete ?? false;

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
          {canCreate && (
            <AddButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(PATH_ADD_ITEM)}
            >
              Add Item
            </AddButton>
          )}
        </HeadActions>
      </PageHead>
      <CategorySelecter onChange={handleCategoryFilter} value={selectedCatId} />

      {/* Content */}
      <ContentArea>
        {loading ? (
          <PageSpinner />
        ) : data?.length === 0 ? (
          <EmptyPlaceholder
            icon="📦"
            title="No items yet"
            desc="Your catalog is empty. Start adding products to manage your inventory."
            action={
              canCreate && (
                <AddButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(PATH_ADD_ITEM)}
                  size="large"
                >
                  Add Your First Item
                </AddButton>
              )
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={4} xxl={3} key={item.id}>
                <ItemCard
                  item={item}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
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

  @media (max-width: 720px) {
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


