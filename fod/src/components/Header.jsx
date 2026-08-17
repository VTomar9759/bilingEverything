import styled from "styled-components";
import sunLogo from "../assets/sun-logo.png";
import Setting from "./Setting";
import { useSelector } from "react-redux";
import InstallPWA from "./InstallPWA";
import ThemeToggle from "./themeToggle";

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const { userData } = useSelector((state) => state.authSlice);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <HeaderStyle $isSidebarOpen={isSidebarOpen}>
      <LeftArea>
        {!isSidebarOpen && (
          <HamburgerBtn onClick={toggleSidebar} aria-label="Open sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </HamburgerBtn>
        )}
        <LogoWrap>
          <img src={sunLogo} alt="Logo" height="28" />
        </LogoWrap>
      </LeftArea>

      <RightSection>
      
        <UserChip>
          <UserAvatar $hasImage={!!userData?.profile_image}>
            {userData?.profile_image ? (
              <img src={userData.profile_image} alt="avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </UserAvatar>
          <UserInfo>
            <UserName>{userData?.fullName || "User"}</UserName>
            <UserRole>HR Department</UserRole>
          </UserInfo>
        </UserChip>
      </RightSection>
    </HeaderStyle>
  );
};

export default Header;

const HeaderStyle = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  padding: 0 24px;
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  box-shadow: var(--shadow-xs);

  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

const LeftArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const HamburgerBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-100);
    color: var(--color-primary);
  }
`;

const LogoWrap = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 28px;
    object-fit: contain;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border);
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-100);
  }

  @media (max-width: 480px) {
    padding: 5px;
    background: transparent;
    border: none;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ $hasImage }) => ($hasImage ? "transparent" : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--color-primary-100);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: 11px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
  }
`;

const UserInfo = styled.div`
  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  white-space: nowrap;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.2;
  white-space: nowrap;
`;
