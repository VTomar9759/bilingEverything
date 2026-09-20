import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import publicBackground from "../../assets/pubicbackground.jpg";
import logo from "../../assets/logo.png";
import { PATH_LANDING } from "../routes/pathname";

const PublicLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (PATH_LANDING === location.pathname) {
    return <Outlet />;
  }

  return (
    <PublicLayoutStyle>
      {/* Top Floating Nav to return to Landing Page */}
      <TopAuthNav>
        <NavBrand onClick={() => navigate(PATH_LANDING)}>
          <img src={logo} alt="Billing EveryThing Logo" />
          <span>Billing<span className="highlight">EveryThing</span></span>
        </NavBrand>
        <BackToLandingBtn onClick={() => navigate(PATH_LANDING)}>
          ← Back to Home
        </BackToLandingBtn>
      </TopAuthNav>

      <PublicCard>
        <LeftSection>
          <BrandBadge onClick={() => navigate(PATH_LANDING)} style={{ cursor: "pointer" }}>
            CRM
          </BrandBadge>

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
  );
};

export default PublicLayout;

/* ── Public layout styled components ── */
const TopAuthNav = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 36px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  @media (max-width: 640px) {
    padding: 12px 16px;
  }
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  span {
    font-size: 17px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.3px;

    .highlight {
      color: #00a389;
    }
  }
`;

const BackToLandingBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: #01514b;
    border-color: #00a389;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 163, 137, 0.3);
  }
`;

const PublicLayoutStyle = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 90px 16px 32px;
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
  width: 100%;
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
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
