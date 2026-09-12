import styled, { keyframes } from "styled-components";
import { Button } from "antd";

const ConfirmModal = ({
  btntext,
  title,
  message,
  visible,
  onConfirm,
  onCancel,
  loading,
  danger,
}) => {
  if (!visible) return null;

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <IconArea $danger={danger}>
          {danger ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </IconArea>

        <ModalHeader>
          <ModalTitle>{title || "Confirm Action"}</ModalTitle>
        </ModalHeader>

        <ModalContent>
          <ModalMessage>
            {message || "Are you sure you want to perform this action?"}
          </ModalMessage>
        </ModalContent>

        <ModalFooter>
          <CancelBtn onClick={onCancel} disabled={loading}>
            No, Cancel
          </CancelBtn>
          <ConfirmBtn
            $danger={danger}
            loading={loading}
            onClick={onConfirm}
          >
            Yes, {btntext}
          </ConfirmBtn>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmModal;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ─── Styled ─── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 23, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContainer = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`;

const IconArea = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $danger }) => ($danger ? "rgba(239,68,68,0.08)" : "rgba(1,81,75,0.08)")};
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-primary)")};
  border: 2px solid ${({ $danger }) => ($danger ? "rgba(239,68,68,0.15)" : "rgba(1,81,75,0.15)")};
`;

const ModalHeader = styled.div``;

const ModalTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const ModalContent = styled.div``;

const ModalMessage = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  flex: 1;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);

  &:hover:not(:disabled) {
    background: var(--color-border-light);
    border-color: var(--color-text-disabled);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmBtn = styled(Button)`
  flex: 1 !important;
  height: 40px !important;
  border-radius: var(--radius-md) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  border: none !important;
  background: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-primary)")} !important;
  color: white !important;
  box-shadow: ${({ $danger }) =>
    $danger ? "0 4px 12px rgba(239,68,68,0.25)" : "0 4px 12px rgba(1,81,75,0.25)"} !important;

  &:hover {
    background: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary-dark)")} !important;
    transform: translateY(-1px);
    box-shadow: ${({ $danger }) =>
      $danger ? "0 6px 16px rgba(239,68,68,0.35)" : "0 6px 16px rgba(1,81,75,0.35)"} !important;
  }

  &:active {
    transform: translateY(0);
  }
`;
