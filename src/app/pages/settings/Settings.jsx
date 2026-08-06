import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  UserOutlined,
  LockOutlined,
  ShopOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import InstallPWA from "../../../components/InstallPWA";
import ThemeToggle from "../../../components/themeToggle";
import LogoutButton from "./componests/logout";
import {
  PATH_ADMINS,
  PATH_CHANGE_PASSWORD,
  PATH_SETTINGS,
  PATH_SETTINGS_BUSINESS,
  PATH_SETTINGS_PROFILE,
} from "../../routes/pathname";

const settingsTabs = [
  {
    path: PATH_SETTINGS_PROFILE,
    label: "Organization Logo",
    icon: <ShopOutlined />,
    badge: "Branding",
  },
  {
    path: PATH_SETTINGS_BUSINESS,
    label: "Business Details",
    icon: <ShopOutlined />,
    badge: "Org",
  },
  {
    path: PATH_CHANGE_PASSWORD,
    label: "Change Password",
    icon: <LockOutlined />,
    badge: "Auth",
  },
  {
    path: PATH_ADMINS,
    label: "Admins",
    icon: <UserOutlined />,
    badge: "Admins",
  },
];

const SettingsLayout = () => {
  const { userData } = useSelector((state) => state.authSlice);
  const location = useLocation();

  return (
    <LayoutWrapper>
      {/* Header Banner */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIconWrap>
            <SettingOutlined />
          </HeaderIconWrap>
          <HeaderTextGroup>
            <HeaderTitleRow>
              <HeaderTitle>Settings & Administration</HeaderTitle>
              <StatusChip>
                <StatusDot />
                <span>{userData?.business_name || "Active Workspace"}</span>
              </StatusChip>
            </HeaderTitleRow>
            <HeaderDesc>
              Manage your personal profile, authentication & organization
              details.
            </HeaderDesc>
          </HeaderTextGroup>
        </HeaderLeft>

        <HeaderActions>
          <ControlWidget>
            <ThemeToggle showLabel={true} />
          </ControlWidget>

          <InstallPWA alwaysShow={true} />

          <LogoutButton />
        </HeaderActions>
      </HeaderCard>

      {/* Navigation Tab Bar */}
      <TabsNavigationContainer>
        <TabsList>
          {settingsTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <TabNavLink
                key={tab.path}
                to={tab.path}
                className={isActive ? "active" : ""}
              >
                <TabIconWrap className="tab-icon">{tab.icon}</TabIconWrap>
                <TabTitle>{tab.label}</TabTitle>
                <TabBadge className="tab-badge">{tab.badge}</TabBadge>
              </TabNavLink>
            );
          })}
        </TabsList>
      </TabsNavigationContainer>
      <MainContentCard>
        <Outlet />
      </MainContentCard>
    </LayoutWrapper>
  );
};

export default SettingsLayout;

/* ─── Styled Components ─── */

const LayoutWrapper = styled.div`
  width:100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HeaderCard = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.25s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 260px;
`;

const HeaderIconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--color-primary-50, rgba(1, 81, 75, 0.1)) 0%,
    var(--color-primary-100, rgba(1, 81, 75, 0.18)) 100%
  );
  color: var(--color-primary, #01514b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px var(--color-primary-100, rgba(1, 81, 75, 0.2));
`;

const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  letter-spacing: -0.3px;
`;

const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-bg, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 2px 8px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary, #4b5563);
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
`;

const HeaderDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted, #6b7280);
  line-height: 1.35;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ControlWidget = styled.div`
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlLabel = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-muted, #64748b);
`;

const TabsNavigationContainer = styled.nav`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 10px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabsList = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: max-content;
`;

const TabNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-text-secondary, #4b5563);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--color-primary, #01514b);
    background: var(--color-primary-50, rgba(1, 81, 75, 0.06));
  }

  &.active {
    color: var(--color-primary, #01514b);
    font-weight: 600;
    background: var(--color-primary-50, rgba(1, 81, 75, 0.12));
    border-color: var(--color-primary-100, rgba(1, 81, 75, 0.25));
    box-shadow: 0 2px 6px rgba(1, 81, 75, 0.08);

    .tab-icon {
      transform: scale(1.08);
      color: var(--color-primary, #01514b);
    }

    .tab-badge {
      background: var(--color-primary, #01514b);
      color: #ffffff;
    }
  }
`;

const TabIconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
`;

const TabTitle = styled.span`
  white-space: nowrap;
`;

const TabBadge = styled.span`
  font-size: 9.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--color-bg, #e5e7eb);
  color: var(--color-text-muted, #6b7280);
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
`;

const MainContentCard = styled.main`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  min-height: 360px;

  @media (max-width: 768px) {
    padding: 12px 14px;
  }
`;
