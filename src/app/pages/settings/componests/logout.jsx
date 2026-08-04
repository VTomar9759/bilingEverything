import styled from "styled-components";
import { LogoutOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { emptyStore } from "../../../store/actions";
import ConfirmModal from "../../../modal/ConfirmModal";
import { useState } from "react";

const LogoutButton = ({ compact = false, showLabel = true, className }) => {
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmLogout = () => {
    dispatch(emptyStore());
    setShowConfirmModal(false);
  };

  return (
    <>
      <StyledLogoutButton
        type="button"
        onClick={() => setShowConfirmModal(true)}
        $compact={compact}
        className={className}
        title="Logout from account"
      >
        <IconContainer className="logout-icon-wrap">
          <LogoutOutlined />
        </IconContainer>
        {showLabel && <ButtonLabel>Logout</ButtonLabel>}
      </StyledLogoutButton>

      <ConfirmModal
        visible={showConfirmModal}
        title="Confirm Logout"
        btntext="Logout"
        danger={true}
        message="Are you sure you want to log out of your account? You will need to sign in again to access your workspace."
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default LogoutButton;

/* ─── Styled Components ─── */

const StyledLogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${({ $compact }) => ($compact ? "4px 10px" : "6px 12px")};
  height: ${({ $compact }) => ($compact ? "28px" : "32px")};
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  font-family: inherit;

  &:hover {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-color: #dc2626;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
    transform: translateY(-1.5px);

    .logout-icon-wrap {
      transform: translateX(2px);
      color: #ffffff;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: transform 0.2s ease, color 0.2s ease;
`;

const ButtonLabel = styled.span`
  letter-spacing: -0.1px;
  white-space: nowrap;
`;