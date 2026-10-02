import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Button, InputNumber, message, Tag } from "antd";
import {
  PercentageOutlined,
  CloseOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { addItemDiscount } from "../../../../services";
import { updateItemAction } from "../../../store/slices/itemSlice";

const AddDiscountModal = ({ visible, onClose, onCancel, item }) => {
  const dispatch = useDispatch();
  const handleClose = onClose || onCancel;

  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && item) {
      setDiscount(item.item_discount ? Number(item.item_discount) : 0);
    }
  }, [visible, item]);

  if (!visible || !item) return null;

  const originalPrice = Number(item.price) || 0;
  const discountVal = Number(discount) || 0;
  const finalPrice = Math.max(0, originalPrice - discountVal);

  const handleSaveDiscount = async (customValue) => {
    const valueToSet = customValue !== undefined ? customValue : discountVal;

    if (valueToSet < 0) {
      message.error("Discount cannot be negative");
      return;
    }

    if (originalPrice > 0 && valueToSet > originalPrice) {
      message.warning("Discount is greater than original price");
    }

    setLoading(true);
    try {
      await addItemDiscount(item.id, valueToSet);
      dispatch(updateItemAction({ id: item.id, item_discount: valueToSet }));
      message.success(
        valueToSet > 0
          ? `Discount of ₹${valueToSet} applied successfully`
          : "Discount removed successfully"
      );
      handleClose?.();
    } catch (err) {
      console.error("Failed to update discount:", err);
      message.error(err.message || "Failed to update discount");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    handleSaveDiscount(0);
  };

  const applyPercent = (pct) => {
    if (originalPrice > 0) {
      const calc = Math.round((originalPrice * pct) / 100);
      setDiscount(calc);
    }
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalCloseBtn onClick={handleClose}>
          <CloseOutlined />
        </ModalCloseBtn>

        {/* Icon & Title */}
        <IconArea>
          <PercentageOutlined style={{ fontSize: 22 }} />
        </IconArea>

        <ModalHeader>
          <ModalTitle>Item Discount</ModalTitle>
          <ModalSubtitle>Set a fixed discount for this item</ModalSubtitle>
        </ModalHeader>

        {/* Item Info Summary */}
        <ItemPreviewCard>
          <ItemMeta>
            <ItemName title={item.name}>{item.name}</ItemName>
        
          </ItemMeta>
          <ItemPriceWrap>
            <PriceLabel>Original Price:</PriceLabel>
            <PriceValue>₹{originalPrice}</PriceValue>
          </ItemPriceWrap>
        </ItemPreviewCard>

        {/* Discount Input */}
        <InputSection>
          <InputLabel>Discount Amount (₹)</InputLabel>
          <StyledInputNumber
            min={0}
            max={originalPrice > 0 ? originalPrice : undefined}
            value={discount}
            onChange={(val) => setDiscount(val || 0)}
            prefix="₹"
            placeholder="0"
            size="large"
          />

          {/* Quick Preset Buttons */}
          <PresetWrapper>
            <PresetBtn type="button" onClick={() => applyPercent(5)}>
              5%
            </PresetBtn>
            <PresetBtn type="button" onClick={() => applyPercent(10)}>
              10%
            </PresetBtn>
            <PresetBtn type="button" onClick={() => applyPercent(20)}>
              20%
            </PresetBtn>
            <PresetBtn type="button" onClick={() => applyPercent(50)}>
              50%
            </PresetBtn>
            <PresetBtn
              type="button"
              $clear
              onClick={() => setDiscount(0)}
            >
              Clear
            </PresetBtn>
          </PresetWrapper>
        </InputSection>

        {/* Breakdown Card */}
        <BreakdownCard>
          <BreakdownRow>
            <span>Original Price</span>
            <span>₹{originalPrice}</span>
          </BreakdownRow>
          <BreakdownRow $highlight={discountVal > 0}>
            <span>Discount</span>
            <span>- ₹{discountVal}</span>
          </BreakdownRow>
          <BreakdownDivider />
          <BreakdownRow $total>
            <span>Final Price</span>
            <span className="total-amount">₹{finalPrice}</span>
          </BreakdownRow>
        </BreakdownCard>

        {/* Actions */}
        <ModalFooter>
          {Number(item.item_discount) > 0 && (
            <RemoveBtn
              onClick={handleRemoveDiscount}
              disabled={loading}
              title="Remove discount"
            >
              <DeleteOutlined /> Remove
            </RemoveBtn>
          )}
          <CancelBtn onClick={handleClose} disabled={loading}>
            Cancel
          </CancelBtn>
          <SaveBtn
            type="primary"
            loading={loading}
            onClick={() => handleSaveDiscount()}
            icon={<CheckOutlined />}
          >
            Apply Discount
          </SaveBtn>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AddDiscountModal;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ─── Styled Components ─── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 23, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContainer = styled.div`
  position: relative;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 16px);
  padding: 22px 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalCloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  color: var(--color-text-muted, #94a3b8);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary, #0f172a);
    background: var(--color-bg, #f1f5f9);
  }
`;

const IconArea = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(1, 81, 75, 0.08);
  color: var(--color-primary, #01514b);
  border: 1.5px solid rgba(1, 81, 75, 0.15);
  margin: 0 auto;
`;

const ModalHeader = styled.div`
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-family: var(--font-display, inherit);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
`;

const ModalSubtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary, #64748b);
  margin: 3px 0 0;
`;

const ItemPreviewCard = styled.div`
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border-light, #e2e8f0);
  border-radius: var(--radius-lg, 10px);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const ItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const ItemName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemPriceWrap = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const PriceLabel = styled.div`
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
  text-transform: uppercase;
  font-weight: 600;
`;

const PriceValue = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #334155);
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100% !important;
  border-radius: var(--radius-md, 8px) !important;
  font-size: 15px !important;
  font-weight: 600 !important;

  .ant-input-number-input {
    font-size: 15px !important;
    font-weight: 600 !important;
  }
`;

const PresetWrapper = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const PresetBtn = styled.button`
  flex: 1;
  min-width: 48px;
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ $clear }) => ($clear ? "#fca5a5" : "var(--color-border, #cbd5e1)")};
  background: ${({ $clear }) =>
    $clear ? "#fff5f5" : "var(--color-surface, #ffffff)"};
  color: ${({ $clear }) => ($clear ? "#dc2626" : "var(--color-text-secondary, #475569)")};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ $clear }) =>
      $clear ? "#ef4444" : "var(--color-primary, #01514b)"};
    color: ${({ $clear }) =>
      $clear ? "#b91c1c" : "var(--color-primary, #01514b)"};
    background: ${({ $clear }) =>
      $clear ? "#fee2e2" : "var(--color-primary-50, #f0fdfa)"};
  }
`;

const BreakdownCard = styled.div`
  background: var(--color-bg, #f8fafc);
  border: 1px dashed var(--color-border, #cbd5e1);
  border-radius: var(--radius-lg, 10px);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ $highlight }) =>
    $highlight ? "#16a34a" : "var(--color-text-secondary, #64748b)"};
  font-weight: ${({ $highlight, $total }) =>
    $highlight || $total ? "600" : "500"};

  .total-amount {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-primary, #01514b);
  }
`;

const BreakdownDivider = styled.div`
  height: 1px;
  background: var(--color-border-light, #e2e8f0);
  margin: 2px 0;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  flex: 1;
  height: 36px;
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg, #f1f5f9);
  border: 1px solid var(--color-border, #cbd5e1);
  color: var(--color-text-secondary, #475569);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e2e8f0;
    border-color: #94a3b8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemoveBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-md, 8px);
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #ffe4e6;
    border-color: #fda4af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveBtn = styled(Button)`
  flex: 1.5 !important;
  height: 36px !important;
  border-radius: var(--radius-md, 8px) !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  border: none !important;
  background: var(--color-primary, #01514b) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(1, 81, 75, 0.25) !important;

  &:hover {
    background: var(--color-primary-dark, #013b37) !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(1, 81, 75, 0.35) !important;
  }

  &:active {
    transform: translateY(0);
  }
`;