import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import logo from "../../assets/logo.png";
import useOrgData from "../hooks/useOrgData";

export const SIDEBAR_OPEN_WIDTH = 230;
export const SIDEBAR_CLOSED_WIDTH = 70;

const PrivateLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { userData } = useOrgData();

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <LayoutStyle>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <MainContent $sidebarWidth={isSidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH}>
                <MobileHeader>
                    <MobileHamburgerBtn onClick={toggleSidebar} aria-label="Toggle navigation">
                        <svg
                            width="18"
                            height="18"
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
                    </MobileHamburgerBtn>
                    <MobileBrand>
                        <MobileBrandLogo src={logo} alt="Logo" />
                        <MobileBrandTitle>{userData?.business_name || "BillingEveryThing"}</MobileBrandTitle>
                    </MobileBrand>
                </MobileHeader>

                <ContentArea>
                    <Outlet />
                </ContentArea>
            </MainContent>
        </LayoutStyle>
    );
};

export default PrivateLayout;

/* ── Private layout styled components ── */
const LayoutStyle = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
`;

const MobileHeader = styled.header`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 14px;
    background: linear-gradient(165deg, #01514b 0%, #013d38 100%);
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 99;
  }
`;

const MobileHamburgerBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;

const MobileBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileBrandLogo = styled.img`
  width: 26px;
  height: 26px;
  object-fit: contain;
`;

const MobileBrandTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MainContent = styled.div`
  margin-left: ${({ $sidebarWidth }) => $sidebarWidth}px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;

  @media (max-width: 720px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 10px 14px;
  overflow-y: auto;

  @media (max-width: 1024px) {
    padding: 12px 14px;
  }

  @media (max-width: 720px) {
    padding: 10px 12px;
  }
`;
