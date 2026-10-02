import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Tag, Tooltip, message } from "antd";
import { EditOutlined, DeleteOutlined, PercentageOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import useOrgData from "../../../hooks/useOrgData";
import {
  deleteItem as deleteItemService,
  supabase,
  updateItemStatus,
} from "../../../../services";
import {
  deleteItem as deleteItemAction,
  updateItemAction,
} from "../../../store/slices/itemSlice";
import ConfirmModal from "../../../modal/ConfirmModal";
import AddDiscountModal from "./AddDiscountModal";
import placeholderImg from "../../../../assets/no-image.png";
import { PATH_EDIT_ITEM } from "../../../routes/pathname";

const ItemCard = ({ item, canUpdate: canUpdateProp, canDelete: canDeleteProp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { org_id, permission } = useOrgData();
  const itemsPerm = permission?.items_catalog;
  const [discountOpen, setDiscountOpen] = useState(false);

  const canUpdate = canUpdateProp ?? (itemsPerm?.update ?? false);
  const canDelete = canDeleteProp ?? (itemsPerm?.delete ?? false);

  const [modalVisible, setModalVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [item.image]);

  const showDeleteModal = (e) => {
    e.stopPropagation();
    if (!canDelete) {
      message.error("You do not have permission to delete items.");
      return;
    }
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!canDelete) {
      message.error("You do not have permission to delete items.");
      return;
    }
    setLoading(true);
    try {
      if (item.image) {
        let imagePath = "";
        if (item.image.includes("items-images/")) {
          imagePath = item.image.split("items-images/")[1];
        } else {
          imagePath = item.image;
        }
        imagePath = imagePath.split("?")[0];
        await supabase.storage.from("items-images").remove([imagePath]);
      }

      await deleteItemService(org_id, item.id);
      dispatch(deleteItemAction(item.id));
      message.success("Item deleted successfully");
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const hasValidImage =
    item.image &&
    !imgError &&
    (item.image.startsWith("http") ||
      item.image.startsWith("/") ||
      item.image.startsWith("data:"));

  const hasDiscount = Number(item.item_discount) > 0;
  const discountedPrice = Math.max(0, (item.price || 0) - (Number(item.item_discount) || 0));

  const formattedOriginalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(item.price || 0);

  const formattedDiscountedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(discountedPrice);

  const toggleStatus = async (id, status) => {
    try {
      await updateItemStatus(id, status);
      dispatch(updateItemAction({ id, status }));
      message.success(`Item ${status ? "enabled" : "disabled"} successfully`);
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <>
      <Card>
        {/* Image area */}
        <ImageArea>
          {hasValidImage ? (
            <ProductImg
              src={item.image}
              alt={item.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <PlaceholderWrap>
              <img src={placeholderImg} alt="No image" />
            </PlaceholderWrap>
          )}

          {/* Overlay actions (Horizontal row on top-right) */}
          {(canUpdate || canDelete) && (
            <OverlayActions className="overlay-actions">
              {canUpdate && (
                <>
                  <Tooltip title="Edit item">
                    <ActionBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(PATH_EDIT_ITEM.replace(":id", item.id));
                      }}
                    >
                      <EditOutlined />
                    </ActionBtn>
                  </Tooltip>
                  <Tooltip title={hasDiscount ? `Discount: ₹${item.item_discount}` : "Add discount"}>
                    <ActionBtn
                      $active={hasDiscount}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiscountOpen(true);
                      }}
                    >
                      <PercentageOutlined />
                    </ActionBtn>
                  </Tooltip>
                </>
              )}
              {canDelete && (
                <Tooltip title="Delete item">
                  <ActionBtn $danger onClick={showDeleteModal}>
                    <DeleteOutlined />
                  </ActionBtn>
                </Tooltip>
              )}
            </OverlayActions>
          )}

          {/* Code badge */}
          {item.code && <CodeBadge>{item.code}</CodeBadge>}

          {/* Discount badge */}
          {hasDiscount && (
            <DiscountBadge title={`Discount: ₹${item.item_discount}`}>
              ₹{item.item_discount} OFF
            </DiscountBadge>
          )}

          {/* Availability Toggle */}
          <AvaibalityBox status={item?.status} onClick={(e) => toggleStatus(item.id, !item.status)}>
            {item.status ? "Available" : "Out of stock"}
          </AvaibalityBox>
        </ImageArea>

        {/* Content */}
        <Content>
          <ContentTop>
            {item.category && (
              <CategoryPill color={getCategoryColor(item.category)}>
                {item.category}
              </CategoryPill>
            )}
            <PriceContainer>
              {hasDiscount ? (
                <>
                  <OriginalPriceTag>{formattedOriginalPrice}</OriginalPriceTag>
                  <DiscountedPriceTag>{formattedDiscountedPrice}</DiscountedPriceTag>
                </>
              ) : (
                <PriceTag>{formattedOriginalPrice}</PriceTag>
              )}
            </PriceContainer>
          </ContentTop>

          <ItemName title={item.name}>{item.name}</ItemName>

          {item.title && <ItemSubtitle>{item.title}</ItemSubtitle>}

          {item.description && (
            <ItemDescription>{item.description}</ItemDescription>
          )}
        </Content>
      </Card>

      <AddDiscountModal
        visible={discountOpen}
        item={item}
        onClose={() => setDiscountOpen(false)}
      />

      <ConfirmModal
        visible={modalVisible}
        danger
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        btntext="Delete"
        onConfirm={handleConfirm}
        onCancel={() => setModalVisible(false)}
        loading={loading}
      />
    </>
  );
};

export default ItemCard;

/* ─── Helpers ─── */
function getCategoryColor(category) {
  const map = {
    Electronics: "blue",
    Fashion: "purple",
    Home: "orange",
    Food: "green",
    Other: "default",
  };
  return map[category] || "default";
}

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled ─── */
const Card = styled.div`
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 14px);
  border: 1px solid var(--color-border-light, #e2e8f0);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
  overflow: hidden;
  transition: all var(--transition-base, 0.2s ease);
  cursor: default;
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: ${fadeUp} 0.3s ease;

  &:hover {
    border-color: var(--color-primary-100, #99f6e4);
    box-shadow:
      var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1)),
      0 0 0 1px var(--color-primary-100, #99f6e4);

    .overlay-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageArea = styled.div`
  position: relative;
  height: 118px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
  flex-shrink: 0;
`;

const ProductImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${Card}:hover & {
    transform: scale(1.04);
  }
`;

const PlaceholderWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    opacity: 0.4;
  }
`;

const OverlayActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transform: translateY(-4px);
  transition: all var(--transition-base, 0.2s ease);
  z-index: 2;
`;

const ActionBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid
    ${({ $danger, $active }) =>
      $danger
        ? "#fecaca"
        : $active
        ? "#99f6e4"
        : "var(--color-border, #cbd5e1)"};
  color: ${({ $danger, $active }) =>
    $danger
      ? "#ef4444"
      : $active
      ? "#0d9488"
      : "var(--color-text-secondary, #475569)"};
  background: ${({ $danger, $active }) =>
    $danger
      ? "#ffffff"
      : $active
      ? "#f0fdfa"
      : "rgba(255, 255, 255, 0.95)"};
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-fast, 0.15s ease);

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fee2e2" : "#ffffff")};
    border-color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-primary, #01514b)")};
    color: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary, #01514b)")};
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const CodeBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(6px);
  color: white;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 1;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 32px;
  left: 8px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
  z-index: 1;
`;

const AvaibalityBox = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: ${({ status }) => (status ? "#22c55e" : "#ef4444")};
  border: 1px solid
    ${({ status }) => (status ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)")};
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  z-index: 1;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
  }
`;

const Content = styled.div`
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ContentTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CategoryPill = styled(Tag)`
  margin: 0 !important;
  border-radius: 999px !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.4px !important;
  padding: 0 8px !important;
  line-height: 20px !important;
  border: none !important;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
`;

const OriginalPriceTag = styled.span`
  font-size: 10.5px;
  font-weight: 500;
  color: var(--color-text-muted, #94a3b8);
  text-decoration: line-through;
`;

const DiscountedPriceTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
  white-space: nowrap;
  letter-spacing: -0.3px;
`;

const PriceTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary, #01514b);
  white-space: nowrap;
  letter-spacing: -0.3px;
`;

const ItemName = styled.h3`
  font-family: var(--font-display, inherit);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
`;

const ItemSubtitle = styled.p`
  font-size: 10.5px;
  color: var(--color-text-muted, #94a3b8);
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemDescription = styled.p`
  font-size: 10.5px;
  color: var(--color-text-secondary, #475569);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
