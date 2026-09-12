import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import logo from "../../assets/logo.png";
import useOrgData from "../hooks/useOrgData";
import publicBackground from "../../assets/pubicbackground.jpg";

export const layoutType = {
  public: "public",
  private: "private",
};

export const SIDEBAR_OPEN_WIDTH = 230;
export const SIDEBAR_CLOSED_WIDTH = 70;

const index = ({ type }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData } = useOrgData();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return type === layoutType.public ? (
    <PublicLayoutStyle>
      <PublicCard>
        <LeftSection>
          <BrandBadge>CRM</BrandBadge>

          <HeroTitle>
            Everything<br />
            Order & Billing<br />
            Dashboard
          </HeroTitle>

          <HeroDesc>
            Manage restaurant orders, billing, menu items, kitchen operations,
            staff activity, and customer management from one smart CRM dashboard.
          </HeroDesc>

          <FeaturePills>
            {[
              "Order Management",
              "Table Booking",
              "Kitchen Tracking",
              "Billing & GST",
              
            ].map((f) => (
              <Pill key={f}>{f}</Pill>
            ))}
          </FeaturePills>
        </LeftSection>
        <RightSection>
          <Outlet />
        </RightSection>
      </PublicCard>
    </PublicLayoutStyle>
  ) : (
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

export default index;

/* ── Private layout ── */
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

/* ── Public layout ── */
const PublicLayoutStyle = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url(${publicBackground});
    background-size: cover;
    background-position: center;
    filter: blur(1px);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }
`;
const PublicCard = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    max-width: 440px;
    gap: 0;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: white;

  @media (max-width: 860px) {
    display: none;
  }
`;

const BrandBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;

  letter-spacing: 1px;
  text-transform: uppercase;
  width: fit-content;
`;

const HeroTitle = styled.h1`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 38px;
  line-height: 1.15;
  letter-spacing: -1px;
`;

const HeroDesc = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  max-width: 340px;
`;

const FeaturePills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.span`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
