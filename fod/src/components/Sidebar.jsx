import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import styled, { css, keyframes } from "styled-components";
import { emptyStore } from "../app/store/actions";
import ConfirmModal from "../app/modal/ConfirmModal";
import { navItems } from "../app/routes/pathname";
import Setting from "./Setting";
import InstallPWA from "./InstallPWA";
import ThemeToggle from "./themeToggle";

/* ─── Icons ─── */
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const OrdersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const TablesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

const BillingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const KitchenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v4M12 15v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5M17 8V2M21 2c0 3.2-1.4 6-3.8 8l1.8 12" />
  </svg>
);

const ItemsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="7" height="7" rx="1.5" />
    <rect x="15" y="3" width="7" height="7" rx="1.5" />
    <rect x="15" y="14" width="7" height="7" rx="1.5" />
    <rect x="2" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const StaffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <path d="M3 3v18h18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);



const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const iconMap = {
  Dashboard: <DashboardIcon />,
  Orders: <OrdersIcon />,
  Tables: <TablesIcon />,
  Billing: <BillingIcon />,
  Kitchen: <KitchenIcon />,
  "Items Catalog": <ItemsIcon />,
  Inventory: <InventoryIcon />,
  Staff: <StaffIcon />,
  Reports: <ReportsIcon />,
  "Database Admin": <DatabaseIcon />,
  Settings: <SettingsIcon />,
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state) => state.authSlice);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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
        <TopSection>


          {isOpen && (
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
          )}


          <HamburgerBtn onClick={toggleSidebar} aria-label="Open sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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


        <FooterSection>
          <InstallPWA />
          <Separator />
          <ThemeToggle />
          <Separator />
          <Setting />
        </FooterSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;


/* ─── Animations ─── */
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border);
`;
/* ─── Styled Components ─── */

const HamburgerBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
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

const LogoWrap = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 28px;
    object-fit: contain;
  }
`;
const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    z-index: calc(var(--z-sidebar) - 1);
  }
`;
const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);


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
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.2;
  white-space: nowrap;
`;

const SidebarContainer = styled.div`
  width: ${({ $isOpen }) => ($isOpen ? "240px" : "80px")};
  height: 100vh;
  background: ${({ theme }) =>
    theme?.colors?.bg === "#0f172a"
      ? theme.colors.surface   /* dark mode → dark slate surface */
      : "linear-gradient(165deg, #01514b 0%, #013d38 100%)"}; /* light mode → green */
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: width var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  overflow: hidden;
  z-index: var(--z-sidebar);
  box-shadow: 4px 0 24px rgba(1,81,75,0.18);

  @media (max-width: 768px) {
    width: ${({ $isOpen }) => ($isOpen ? "240px" : "0")};
  }
`;

const TopSection = styled.div`
  width: 100%;
  padding: 24px 21px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) =>
    theme?.colors?.bg === "#0f172a" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)"};
`;



const LogoBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  color: white;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
`;

const LogoText = styled.div`
  min-width: 0;
  animation: ${slideIn} 0.2s ease;
`;

const LogoName = styled.div`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  color: white;
  white-space: nowrap;
  letter-spacing: -0.3px;
`;

const LogoSub = styled.div`
  font-size: 10px;
  font-weight: 500;
  color:white;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1px;
`;

const CollapseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    background: rgba(255,255,255,0.15);
    color: white;
  }
`;

const NavSection = styled.div`
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar { display: none; }
`;

const NavLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  color:white;
  letter-spacing: 1px;
  padding: 0 8px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ $isOpen }) => ($isOpen ? "10px 12px" : "10px")};
  margin-bottom: 2px;
  border-radius: 10px;
  cursor: pointer;
  gap: 10px;
  position: relative;
  transition: all var(--transition-fast);
  justify-content: ${({ $isOpen }) => ($isOpen ? "flex-start" : "center")};
  background: ${({ $active, theme }) =>
    $active
      ? theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.25)"
        : "rgba(255,255,255,0.12)"
      : "transparent"};
  border: 1px solid ${({ $active, theme }) =>
    $active
      ? theme?.colors?.bg === "#0f172a"
        ? "rgba(1,122,113,0.4)"
        : "rgba(255,255,255,0.15)"
      : "transparent"};

  &:hover {
    background: ${({ theme }) =>
    theme?.colors?.bg === "#0f172a" ? "rgba(1,122,113,0.15)" : "rgba(255,255,255,0.1)"};
    border-color: ${({ theme }) =>
    theme?.colors?.bg === "#0f172a" ? "rgba(1,122,113,0.3)" : "rgba(255,255,255,0.1)"};
  }
`;

const NavIconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
  color: ${({ $active, $danger, theme }) =>
    $danger
      ? "red"
      : $active
        ? theme?.colors?.bg === "#ffffff" ? "#ffffff" : "white"
        : "white"}; 
  background: ${({ $active, theme }) =>
    $active
      ? theme?.colors?.bg === "#0f172a" ? "rgba(1,122,113,0.2)" : "rgba(255,255,255,0.1)"
      : "transparent"};
  transition: all var(--transition-fast);

  ${NavItem}:hover & {
    color: ${({ $danger, theme }) =>
    $danger ? "#ef4444" : theme?.colors?.bg === "#ffffff" ? "#4ade80" : "white"};
  }
`;

const NavLabel2 = styled.span`
  font-size: 13.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color:white;
  white-space: nowrap;
  flex: 1;
  animation: ${slideIn} 0.15s ease;
  transition: color var(--transition-fast);
`;

const ActiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.8);
  flex-shrink: 0;
`;

const FooterSection = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;


const LogoutItem = styled(NavItem)`
  background: rgba(239,68,68,0.06);
  border-color: rgba(239,68,68,0.1);

  &:hover {
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.2);
  }
`;
