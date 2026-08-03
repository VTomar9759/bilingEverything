import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Modal } from "antd";
import UpdateProfile from "../app/modal/UpdateProfile";
import ChangePassword from "../app/modal/ChangePassword";
import ConfirmModal from "../app/modal/ConfirmModal";
import { emptyStore } from "../app/store/actions";
import { useDispatch } from "react-redux";

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Setting = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside - only relevant if it was a dropdown, but keeping simple structure
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // For modal, AntD handles its own clicks outside, but keeping this safe
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOption = (option) => {
    setIsOpen(false);
    if (option === "profile") setIsProfileModalOpen(true);
    else if (option === "password") setIsPasswordModalOpen(true);
    else if (option === "logout") setLogoutModal(true);
  };

  const handleLogout = () => dispatch(emptyStore());

  return (
    <Container ref={containerRef}>
      <IconBtn
        onClick={() => setIsOpen((prev) => !prev)}
        $active={isOpen}
        aria-label="Settings"
        title="Settings"
      >
        <SettingsIcon />
      </IconBtn>

      {logoutModal && (
        <ConfirmModal
          visible={logoutModal}
          title="Logout"
          btntext="Logout"
          message="Are you sure you want to logout? You will need to sign in again."
          onConfirm={handleLogout}
          onCancel={() => setLogoutModal(false)}
        />
      )}

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        centered
        width={400}
        styles={{
          body: { padding: 0 }
        }}
        closeIcon={<span style={{ fontSize: "20px", color: "var(--color-text-muted)", cursor: "pointer" }}>×</span>}
      >
        <ModalWrapper>
          <HeaderContainer>
            <Title>Settings</Title>
            <Subtitle>Manage your account settings & preferences</Subtitle>
          </HeaderContainer>

          <OptionsList>
            <OptionCard onClick={() => handleOption("profile")}>
              <OptionIconWrap>
                <ProfileIcon />
              </OptionIconWrap>
              <OptionText>
                <OptionTitle>Edit Profile</OptionTitle>
                <OptionDesc>Update your name and avatar</OptionDesc>
              </OptionText>
            </OptionCard>

            <OptionCard onClick={() => handleOption("password")}>
              <OptionIconWrap>
                <LockIcon />
              </OptionIconWrap>
              <OptionText>
                <OptionTitle>Change Password</OptionTitle>
                <OptionDesc>Update your security credentials</OptionDesc>
              </OptionText>
            </OptionCard>

            <OptionCard $danger onClick={() => handleOption("logout")}>
              <OptionIconWrap $danger>
                <LogoutIcon />
              </OptionIconWrap>
              <OptionText>
                <OptionTitle $danger>Logout</OptionTitle>
                <OptionDesc>Logout from your account</OptionDesc>
              </OptionText>
            </OptionCard>
          </OptionsList>
        </ModalWrapper>
      </Modal>

      <UpdateProfile open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ChangePassword open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </Container>
  );
};

export default Setting;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: ${({ $active }) => ($active ? "var(--color-primary-50)" : "var(--color-bg)")};
  border: 1px solid ${({ $active }) => ($active ? "var(--color-primary-100)" : "var(--color-border)")};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
`;

const ModalWrapper = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: var(--color-text-muted);
  line-height: 1.4;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast) ease-in-out;

  &:active {
    transform: translateY(0);
  }
`;

const OptionIconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-primary)")};
  flex-shrink: 0;
  transition: all var(--transition-fast);

  ${OptionCard}:hover & {
    background: ${({ $danger }) => ($danger ? "rgba(239, 68, 68, 0.08)" : "var(--color-primary-100)")};
    border-color: ${({ $danger }) => ($danger ? "rgba(239, 68, 68, 0.15)" : "var(--color-primary-100)")};
  }
`;

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const OptionTitle = styled.div`
  font-size: 14.5px;
  font-weight: 600;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-text-primary)")};
  transition: color var(--transition-fast);
`;

const OptionDesc = styled.div`
  font-size: 11.5px;
  color: var(--color-text-muted);
  line-height: 1.3;
`;
