/**
 * Shared styled components for AddItem and EditItem forms.
 * Both pages use identical form structure — centralizing here
 * ensures visual consistency and avoids duplication.
 */
import styled from "styled-components";
import { Form, Input, Button, InputNumber, Select, Card } from "antd";
import { PageWrapper } from "../../../styles/commonstyle";

const { TextArea } = Input;

/* ── Page wrapper ── */
export const StyledPageWrapper = styled(PageWrapper)`
  gap: 14px;
  animation: pageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Top Status Banner ── */
export const TopStatusBanner = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f0faf9 100%);
  border: 1.5px solid var(--color-primary-100);
  border-radius: var(--radius-xl);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(1, 81, 75, 0.06);
  position: relative;
  overflow: hidden;
  margin-bottom : 10px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon-badge {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--color-primary-50);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid var(--color-primary-100);
  }

  .status-text {
    display: flex;
    flex-direction: column;

    .title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--color-text-primary);
      font-family: var(--font-display);
      letter-spacing: -0.2px;
    }

    .subtitle {
      font-size: 11.5px;
      color: var(--color-text-secondary);
    }
  }

  .status-action-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-surface);
    padding: 6px 14px;
    border-radius: var(--radius-full);
    border: 1.5px solid var(--color-border);
    box-shadow: var(--shadow-xs);
    transition: all var(--transition-base);

    &:hover {
      border-color: var(--color-primary-200);
      box-shadow: var(--shadow-sm);
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .badge-tag {
    font-size: 10.5px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: var(--radius-full);
    letter-spacing: 0.3px;
    text-transform: uppercase;

    &.active {
      background: #e6f4ea;
      color: #137333;
    }

    &.inactive {
      background: #f1f3f4;
      color: #5f6368;
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;

    .status-action-row {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

/* ── Two-column layout ── */
export const BoxSection = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Section card ── */
export const SectionCard = styled(Card)`
  border-radius: var(--radius-xl) !important;
  border: 1px solid var(--color-border-light) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
  background: var(--color-surface) !important;
  overflow: hidden;
  transition: all var(--transition-base) !important;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06) !important;
  }

  .ant-card-head {
    border-bottom: 1px solid var(--color-border-light) !important;
    padding: 0 16px !important;
    min-height: 42px !important;
    background: #fafcfd !important;
  }

  .ant-card-head-title {
    font-size: 13px !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    font-family: var(--font-display) !important;
    letter-spacing: -0.2px !important;
    padding: 10px 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;

    svg {
      color: var(--color-primary);
      font-size: 15px;
    }
  }

  .ant-card-body {
    padding: 16px !important;
  }
`;

/* ── Form column (right side) ── */
export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

/* ── Styled form ── */
export const StyledForm = styled(Form)`
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }

  .ant-form-item {
    margin-bottom: 12px;
  }

  .ant-form-item:last-child {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-bottom: 4px !important;
  }

  .ant-form-item-label > label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
    letter-spacing: 0.01em !important;
  }
`;

/* ── Input styles ── */
export const StyledInput = styled(Input)`
  height: 38px !important;
  border-radius: var(--radius-lg) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 13px !important;
  transition: all var(--transition-base) !important;
  font-family: var(--font-sans) !important;
  color: var(--color-text-primary) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: var(--color-surface) !important;
  }

  &.ant-input-affix-wrapper-focused,
  &:focus {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: var(--color-surface) !important;
  }

  .ant-input-prefix {
    color: var(--color-primary-light) !important;
    margin-right: 10px !important;
    font-size: 15px !important;
  }

  .ant-input {
    background: transparent !important;
  }
`;

export const StyledInputNumber = styled(InputNumber)`
  width: 100% !important;
  height: 38px !important;
  border-radius: var(--radius-lg) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 13px !important;
  display: flex !important;
  align-items: center !important;
  transition: all var(--transition-base) !important;

  .ant-input-number-input-wrapper { height: 100% !important; }
  .ant-input-number-input { 
    height: 36px !important; 
    background: transparent !important; 
    color: var(--color-text-primary) !important;
    font-weight: 600 !important;
  }

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: var(--color-surface) !important;
  }

  &.ant-input-number-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: var(--color-surface) !important;
  }

  .ant-input-number-prefix {
    color: var(--color-primary-light) !important;
    margin: 0 8px 0 10px !important;
    font-size: 15px !important;
  }
`;

export const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 38px !important;
    border-radius: var(--radius-lg) !important;
    border: 1.5px solid var(--color-border) !important;
    background: var(--color-bg) !important;
    display: flex !important;
    align-items: center !important;
    font-size: 13px !important;
    padding: 0 12px !important;
    transition: all var(--transition-base) !important;
    color: var(--color-text-primary) !important;
  }

  &:hover .ant-select-selector {
    border-color: var(--color-primary-100) !important;
    background: var(--color-surface) !important;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: var(--color-surface) !important;
  }
`;

export const StyledTextArea = styled(TextArea)`
  border-radius: var(--radius-lg) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  padding: 10px 14px !important;
  font-size: 13px !important;
  font-family: var(--font-sans) !important;
  transition: all var(--transition-base) !important;
  resize: vertical !important;
  color: var(--color-text-primary) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: var(--color-surface) !important;
  }

  &:focus {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: var(--color-surface) !important;
  }
`;

/* ── Upload wrapper ── */
export const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;

  .image-uploader {
    width: 100%;

    .ant-upload-wrapper { width: 100% !important; }

    .ant-upload.ant-upload-select {
      width: 100% !important;
      height: 210px !important;
      border-radius: var(--radius-xl) !important;
      background: linear-gradient(180deg, #f9fbfb 0%, #f2f7f7 100%) !important;
      border: 2px dashed var(--color-primary-100) !important;
      margin: 0 !important;
      transition: all var(--transition-base) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      &:hover {
        border-color: var(--color-primary) !important;
        background: var(--color-primary-50) !important;
        transform: scale(0.995);
      }
    }
  }

  .remove-btn {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-error);
    cursor: pointer;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.2);
    transition: all var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
    }
  }
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 12px;

  .upload-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-surface);
    border: 1px solid var(--color-primary-100);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(1, 81, 75, 0.08);
  }

  p {
    font-size: 12.5px;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  span {
    font-size: 10.5px;
    color: var(--color-text-muted);
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  border-radius: var(--radius-xl);
`;

/* ── Form footer ── */
export const FormFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  margin-top: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    > * { width: 100%; }
  }
`;

export const CancelButton = styled(Button)`
  height: 36px !important;
  border-radius: var(--radius-lg) !important;
  font-weight: 600 !important;
  font-size: 12.5px !important;
  background: var(--color-bg) !important;
  border: 1.5px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  padding: 0 18px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;

  &:hover {
    background: var(--color-border-light) !important;
    border-color: var(--color-text-disabled) !important;
    color: var(--color-text-primary) !important;
  }
`;

export const SubmitButton = styled(Button)`
  height: 36px !important;
  border-radius: var(--radius-lg) !important;
  font-weight: 700 !important;
  font-size: 12.5px !important;
  background: var(--color-primary) !important;
  border: none !important;
  padding: 0 22px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.25) !important;
  transition: all var(--transition-base) !important;

  &:hover {
    background: var(--color-primary-light) !important;
    border-color: var(--color-primary-light) !important;
    box-shadow: 0 6px 20px rgba(1, 81, 75, 0.35) !important;
    transform: translateY(-1px) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
`;
