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
  gap: 10px;
  animation: pageIn 0.3s ease;

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Two-column layout ── */
export const BoxSection = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 12px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Section card ── */
export const SectionCard = styled(Card)`
  border-radius: var(--radius-xl) !important;
  border: 1px solid var(--color-border-light) !important;
  box-shadow: var(--shadow-sm) !important;
  background: var(--color-surface) !important;

  .ant-card-head {
    border-bottom: 1px solid var(--color-border-light) !important;
    padding: 0 14px !important;
    min-height: 36px !important;
  }

  .ant-card-head-title {
    font-size: 12px !important;
    font-weight: 700 !important;
    color: var(--color-text-primary) !important;
    font-family: var(--font-display) !important;
    letter-spacing: -0.2px !important;
    padding: 8px 0 !important;
  }

  .ant-card-body {
    padding: 12px 14px 14px !important;
  }
`;

/* ── Form column (right side) ── */
export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

/* ── Styled form ── */
export const StyledForm = styled(Form)`
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }

  .ant-form-item {
    margin-bottom: 10px;
  }

  .ant-form-item:last-child {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-bottom: 2px !important;
  }

  .ant-form-item-label > label {
    font-size: 11.5px !important;
    font-weight: 600 !important;
    color: var(--color-text-primary) !important;
    letter-spacing: 0.01em !important;
  }
`;

/* ── Input styles ── */
export const StyledInput = styled(Input)`
  height: 32px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 12.5px !important;
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
    box-shadow: 0 0 0 3px rgba(1,81,75,0.08) !important;
    background: var(--color-surface) !important;
  }

  .ant-input-prefix {
    color: var(--color-text-muted) !important;
    margin-right: 8px !important;
  }

  .ant-input {
    background: transparent !important;
  }
`;

export const StyledInputNumber = styled(InputNumber)`
  width: 100% !important;
  height: 32px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 12.5px !important;
  display: flex !important;
  align-items: center !important;
  

  .ant-input-number-input-wrapper { height: 100% !important; }
  .ant-input-number-input { height: 30px !important; background: transparent !important; color: var(--color-text-primary) !important;}

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: var(--color-surface) !important;
  }

  &.ant-input-number-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1,81,75,0.08) !important;
    background: var(--color-surface) !important;
  }

  .ant-input-number-prefix {
    color: var(--color-text-muted) !important;
    margin: 0 8px 0 12px !important;
  }
`;

export const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 32px !important;
    border-radius: var(--radius-md) !important;
    border: 1.5px solid var(--color-border) !important;
    background: var(--color-bg) !important;
    display: flex !important;
    align-items: center !important;
    font-size: 12.5px !important;
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
    box-shadow: 0 0 0 3px rgba(1,81,75,0.08) !important;
    background: var(--color-surface) !important;
  }
`;

export const StyledTextArea = styled(TextArea)`
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  padding: 8px 12px !important;
  font-size: 12.5px !important;
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
    box-shadow: 0 0 0 3px rgba(1,81,75,0.08) !important;
    background: var(--color-surface) !important;
  }
`;

/* ── Upload wrapper ── */
export const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;

  .image-uploader {
    width: 100%;

    .ant-upload-wrapper { width: 100% !important; }

    .ant-upload.ant-upload-select {
      width: 100% !important;
      height: 200px !important;
      border-radius: var(--radius-lg) !important;
      background: var(--color-bg) !important;
      border: 2px dashed var(--color-border) !important;
      margin: 0 !important;
      transition: all var(--transition-base) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      &:hover {
        border-color: var(--color-primary) !important;
        background: var(--color-primary-50) !important;
      }
    }
  }

  .remove-btn {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--color-error);
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 6px;
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.15);
    transition: all var(--transition-fast);

    &:hover {
      background: rgba(239,68,68,0.1);
    }
  }
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);

  .upload-icon {
    font-size: 26px;
    color: var(--color-text-disabled);
  }

  p {
    font-size: 11.5px;
    font-weight: 500;
    margin: 0;
  }

  span {
    font-size: 9.5px;
    color: var(--color-text-disabled);
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  border-radius: var(--radius-lg);
`;

/* ── Form footer ── */
export const FormFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  margin-top: 10px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-xs);
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    > * { width: 100%; }
  }
`;

export const CancelButton = styled(Button)`
  height: 32px !important;
  border-radius: var(--radius-md) !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  background: var(--color-bg) !important;
  border: 1.5px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  padding: 0 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;

  &:hover {
    background: var(--color-border-light) !important;
    border-color: var(--color-text-disabled) !important;
    color: var(--color-text-primary) !important;
  }
`;

export const SubmitButton = styled(Button)`
  height: 32px !important;
  border-radius: var(--radius-md) !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  background: var(--color-primary) !important;
  border: none !important;
  padding: 0 18px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  box-shadow: 0 4px 12px rgba(1,81,75,0.22) !important;
  transition: all var(--transition-base) !important;

  &:hover {
    background: var(--color-primary-light) !important;
    border-color: var(--color-primary-light) !important;
    box-shadow: 0 6px 18px rgba(1,81,75,0.32) !important;
    transform: translateY(-1px) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
`;
