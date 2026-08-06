import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import styled, { css, keyframes } from "styled-components";
import { navItems } from "../app/routes/pathname";
import logo from "../assets/logo.png";
import { SIDEBAR_CLOSED_WIDTH, SIDEBAR_OPEN_WIDTH } from "../app/layout";
import { BrandTitle } from "../app/utils/commons_style";

/* ─── Icons ─── */
const DashboardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const OrdersIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const TablesIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

const BillingIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const ItemsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="7" height="7" rx="1.5" />
    <rect x="15" y="3" width="7" height="7" rx="1.5" />
    <rect x="15" y="14" width="7" height="7" rx="1.5" />
    <rect x="2" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const CategoriesIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const AdminsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const iconMap = {
  Dashboard: <DashboardIcon />,
  Admins: <AdminsIcon />,
  Orders: <OrdersIcon />,
  Tables: <TablesIcon />,
  Billing: <BillingIcon />,
  "Items Catalog": <ItemsIcon />,
  Categories: <CategoriesIcon />,
  Settings: <SettingsIcon />,
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state) => state.authSlice);
  console.log(userData,"sddddddd")

  const initials = userData?.business_name
    ? userData.business_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (item) =>
    item.activePath?.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <MobileOverlay onClick={toggleSidebar} />}

      <SidebarContainer $isOpen={isOpen}>
        {/* Logo area */}
        <TopSection $isOpen={isOpen}>
          {isOpen && (
            <UserChip>
              <UserAvatar $hasImage={!!userData?.logo_image}>
                {userData?.logo_image ? (
                  <img src={userData.logo_image} alt="avatar" />
                ) : (
                  <span>{initials}</span>
                )}
              </UserAvatar>
              <UserInfo>
                <UserName>{userData?.business_name || "User"}</UserName>
                <UserEmail>
                  {userData?.email || userData?.full_name || "Account Details"}
                </UserEmail>
              </UserInfo>
            </UserChip>
          )}

          <HamburgerBtn onClick={toggleSidebar} aria-label="Open sidebar">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </HamburgerBtn>
        </TopSection>

        {/* Navigation */}
        <NavSection>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <NavItem
                key={item.path}
                $active={active}
                $isOpen={isOpen}
                onClick={() => handleNavClick(item.path)}
                title={!isOpen ? item.label : undefined}
              >
                <NavIconWrap $active={active}>
                  {iconMap[item.label] || <ItemsIcon />}
                </NavIconWrap>
                {isOpen && <NavLabel2 $active={active}>{item.label}</NavLabel2>}
                {isOpen && active && <ActiveDot />}
              </NavItem>
            );
          })}
        </NavSection>
        {/* Brand Watermark */}
        <WatermarkContainer $isOpen={isOpen} title="BillingEveryThing">
          <WatermarkLogo src={logo} alt="BillingEveryThing" />
          {isOpen && (
            <BrandTitle fontSize="12px">
              Billing <span className="highlight">Every Thing</span>
            </BrandTitle>
          )}
        </WatermarkContainer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;

/* ─── Animations ─── */
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ─── Styled Components ─── */

const HamburgerBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0;
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

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: calc(var(--z-sidebar) - 1);
  }
`;
const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ $hasImage }) =>
    $hasImage
      ? "transparent"
      : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid var(--color-primary-100);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.3px;
  }
`;

const UserInfo = styled.div`
  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 115px;
`;

const UserEmail = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 115px;
  margin-top: 1px;
`;

const SidebarContainer = styled.div`
  width: ${({ $isOpen }) =>
    $isOpen ? `${SIDEBAR_OPEN_WIDTH}px` : `${SIDEBAR_CLOSED_WIDTH}px`};
  height: 100vh;
  background: ${({ theme }) =>
    theme?.colors?.bg === "#0f172a"
      ? theme.colors.surface /* dark mode → dark slate surface */
      : "linear-gradient(165deg, #01514b 0%, #013d38 100%)"}; /* light mode → green */
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition:
    width var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1),
    background 0.3s ease;
  overflow: hidden;
  z-index: var(--z-sidebar);
  box-shadow: 3px 0 16px rgba(1, 81, 75, 0.15);

  @media (max-width: 768px) {
    width: ${({ $isOpen }) => ($isOpen ? "210px" : "0")};
  }
`;

const TopSection = styled.div`
  width: 100%;
  padding: ${({ $isOpen }) => ($isOpen ? "8px 10px" : "8px 20px")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid
    ${({ theme }) =>
      theme?.colors?.bg === "#0f172a"
        ? "rgba(255,255,255,0.06)"
        : "rgba(255,255,255,0.08)"};
`;

const NavSection = styled.div`
  flex: 1;
  padding: 8px 8px;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ $isOpen }) => ($isOpen ? "5px 8px" : "5px 0")};
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  gap: 8px;
  position: relative;
  transition: all var(--transition-fast);
  justify-content: ${({ $isOpen }) => ($isOpen ? "flex-start" : "center")};
  background: ${({ $active, theme }) =>
    $active
      ? theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.25)"
        : "rgba(255,255,255,0.12)"
      : "transparent"};
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme?.colors?.bg === "#0f172a"
          ? "rgba(1,122,113,0.4)"
          : "rgba(255,255,255,0.15)"
        : "transparent"};

  &:hover {
    background: ${({ theme }) =>
      theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.15)"
        : "rgba(255,255,255,0.1)"};
    border-color: ${({ theme }) =>
      theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.3)"
        : "rgba(255,255,255,0.1)"};
  }
`;

const NavIconWrap = styled.div`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  flex-shrink: 0;
  color: ${({ $active, $danger, theme }) =>
    $danger
      ? "red"
      : $active
        ? theme?.colors?.bg === "#ffffff"
          ? "#ffffff"
          : "white"
        : "white"};
  background: ${({ $active, theme }) =>
    $active
      ? theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.2)"
        : "rgba(255,255,255,0.1)"
      : "transparent"};
  transition: all var(--transition-fast);

  ${NavItem}:hover & {
    color: ${({ $danger, theme }) =>
      $danger
        ? "#ef4444"
        : theme?.colors?.bg === "#ffffff"
          ? "#4ade80"
          : "white"};
  }
`;

const NavLabel2 = styled.span`
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "450")};
  color: white;
  white-space: nowrap;
  flex: 1;
  animation: ${slideIn} 0.15s ease;
  transition: color var(--transition-fast);
`;

const ActiveDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
`;

const FooterSection = styled.div`
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const WatermarkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => ($isOpen ? "flex-start" : "center")};
  gap: 5px;
  padding: ${({ $isOpen }) => ($isOpen ? "0px 8px" : "8px 0")};
  margin: 0;
  border-top: 1px solid
    ${({ theme }) =>
      theme?.colors?.bg === "#0f172a"
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(255, 255, 255, 0.1)"};
  &:hover {
    opacity: 0.9;
  }
`;

const WatermarkLogo = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  flex-shrink: 0;
`;
