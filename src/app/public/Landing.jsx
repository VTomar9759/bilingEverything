import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import logo from "../../assets/logo.png";
import {
  PATH_LOGIN,
  PATH_SIGNUP,
  PATH_DASHBOARD,
  PATH_ORDER_COMPOSER,
  PATH_ITEMS,
  PATH_BILLING,
  PATH_SETTINGS_PRINT,
} from "../routes/pathname";
import SubscriptionSection from "../subscription/SubscriptionSection";

/* --------------------------------------------------
    KEYFRAME ANIMATIONS
-------------------------------------------------- */
const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* --------------------------------------------------
    STYLED COMPONENTS (DEFINED FIRST)
-------------------------------------------------- */
const LandingWrapper = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f172a;
  background-color: #ffffff;
  overflow-x: hidden;
  line-height: 1.5;

  * {
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

/* ─── Navbar ─── */
const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.88)"};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: ${({ $isScrolled }) => ($isScrolled ? "12px 0" : "18px 0")};
  border-bottom: 1px solid
    ${({ $isScrolled }) => ($isScrolled ? "#e2e8f0" : "#f1f5f9")};
  box-shadow: ${({ $isScrolled }) =>
    $isScrolled ? "0 4px 20px rgba(1, 81, 75, 0.06)" : "none"};
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const BrandLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const LogoImg = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const BrandTitle = styled.span`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #01514b;

  .teal {
    color: #00a389;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLinkBtn = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #01514b;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const SignInBtn = styled.button`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
`;

const GetStartedBtn = styled.button`
  background: #01514b;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 20px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #003833;
    box-shadow: 0 4px 12px rgba(1, 81, 75, 0.2);
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #0f172a;
  cursor: pointer;
  padding: 4px;

  @media (max-width: 900px) {
    display: flex;
  }
`;

const MobileDrawer = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeIn} 0.2s ease;
`;

const MobileNavLink = styled.button`
  background: none;
  border: none;
  text-align: left;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

const MobileActionWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
`;

/* ─── Hero Section ─── */
const HeroSection = styled.section`
  padding-top: 130px;
  padding-bottom: 70px;
  background: linear-gradient(180deg, #f0faf9 0%, #ffffff 100%);

  @media (max-width: 768px) {
    padding-top: 100px;
    padding-bottom: 40px;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const EyebrowBadge = styled.div`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #e6f7f5;
  color: #01514b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  width: fit-content;
`;

const HeroMainTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 16px;

  .highlight {
    color: #00a389;
  }

  @media (max-width: 768px) {
    font-size: 34px;
  }
`;

const HeroSubText = styled.p`
  font-size: 16px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 28px;
  max-width: 520px;
`;

const HeroBtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    button {
      width: 100%;
    }
  }
`;

const CtaGreenBtn = styled.button`
  background: #01514b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #003833;
    box-shadow: 0 6px 16px rgba(1, 81, 75, 0.25);
  }
`;

const ViewDemoBtn = styled.button`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
`;

const PlayIconWrap = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e6f7f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TrustTagLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
`;

/* ─── Hero Right & Dashboard Screenshot ─── */
const HeroRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FloatingMetricsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const TopMetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MetricIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricVal = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
`;

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
`;

const DashboardFrame = styled.div`
  border-radius: 16px;
  background: #01514b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(1, 81, 75, 0.15);
  overflow: hidden;
`;

const BrowserFrame = styled.div`
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 420px;
  background: #ffffff;
`;

const DashSidebar = styled.div`
  width: 170px;
  background: #01514b;
  color: #ffffff;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 640px) {
    display: none;
  }
`;

const DashSidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  .title {
    font-size: 13px;
    font-weight: 800;
  }
`;

const DashNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const DashNavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 8px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.15)" : "transparent")};
  color: #ffffff;
`;

const DashWatermark = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const DashMainContent = styled.div`
  flex: 1;
  background: #f8fafc;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DashHeaderRow = styled.div`
  .title {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
  }
`;

const DashStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DashStatCard = styled.div`
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  .label-wrap {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .val {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2px;
  }

  .sub {
    font-size: 8px;
    color: #64748b;
    margin-top: 1px;

    &.green {
      color: #10b981;
      font-weight: 700;
    }
  }
`;

const DashMiddleRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DashChartBox = styled.div`
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  .box-title {
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
  }
`;

const TrendLineSvg = styled.svg`
  width: 100%;
  height: 60px;
`;

const TrendDaysRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: #94a3b8;
  margin-top: 4px;
`;

const PeakBarsWrap = styled.div`
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  padding-top: 10px;
`;

const PeakBar = styled.div`
  flex: 1;
  background: #01514b;
  border-radius: 2px 2px 0 0;
`;

const DashBottomRow = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const DashSmallBox = styled.div`
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  .box-title {
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
  }
`;

const DonutWrap = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  margin: 0 auto;
`;

const DonutSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .num {
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
  }

  .lbl {
    font-size: 7px;
    color: #94a3b8;
  }
`;

const TopItemsProgressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProgressItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .name {
    font-size: 9px;
    font-weight: 700;
    color: #334155;
    width: 110px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bar-track {
    flex: 1;
    height: 4px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 999px;
  }
`;

/* ─── Reusable Sections ─── */
const Section = styled.section`
  padding: 80px 0;
  background: ${({ $bg }) => $bg || "#ffffff"};
  border-top: ${({ $border }) => ($border ? "1px solid #e2e8f0" : "none")};
  border-bottom: ${({ $border }) => ($border ? "1px solid #e2e8f0" : "none")};

  @media (max-width: 768px) {
    padding: 50px 0;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px auto;
`;

const EyebrowTag = styled.div`
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 999px;
  background: #e6f7f5;
  color: #01514b;
`;

const SectionTitle = styled.h2`
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-top: 8px;

  .highlight {
    color: #00a389;
  }

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const SectionSub = styled.p`
  font-size: 15px;
  color: #64748b;
  margin-top: 10px;
  line-height: 1.6;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(1, 81, 75, 0.08);
    border-color: #a1e1da;
  }
`;

const FeatureIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e6f7f5;
  color: #01514b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
`;

const FeatureDesc = styled.p`
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const BrowserHeader = styled.div`
  background: #f1f5f9;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
`;

const AddressBar = styled.div`
  background: #ffffff;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
  margin-left: 8px;
  flex: 1;
  max-width: 240px;
  border: 1px solid #e2e8f0;
`;

/* ─── POS Mockup Styles ─── */
const PosMockupBody = styled.div`
  background: #f8fafc;
  padding: 12px;
`;

const PosCategoriesScroll = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const PosCatPill = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? "#01514b" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  border: 1px solid ${({ $active }) => ($active ? "#01514b" : "#cbd5e1")};
`;

const PosSplitArea = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const PosItemCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;

  .name {
    font-size: 10px;
    font-weight: 700;
    color: #0f172a;
  }

  .price {
    font-size: 10px;
    font-weight: 800;
    color: #01514b;
    margin-top: 4px;
  }
`;

const PosCartBox = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .cart-title {
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
  }

  .cart-item-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    margin-top: 4px;
  }

  .cart-calc {
    border-top: 1px solid #f1f5f9;
    padding-top: 4px;
    margin-top: 6px;
  }

  .calc-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #64748b;
  }

  .grand-total {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2px;
  }

  .cart-btn-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 6px;
  }

  .pos-btn {
    padding: 4px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: 800;
    border: none;
    color: #ffffff;

    &.teal { background: #01514b; }
    &.blue { background: #2563eb; }
    &.orange { background: #ea580c; }
    &.purple { background: #7c3aed; }
  }
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
`;

const ChecklistSingleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
`;

const CheckListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
`;

const CheckCircleIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00a389;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
`;

/* ─── 3 Column Section Grid ─── */
const ThreeColSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* ─── Thermal Receipt Visual Ticket Card ─── */
const ThermalTicketCard = styled.div`
  font-family: 'Courier New', Courier, monospace;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  max-width: 320px;

  .ticket-header {
    text-align: center;
    padding-bottom: 8px;
    border-bottom: 1px dashed #cbd5e1;

    .store-name {
      font-weight: 900;
      font-size: 13px;
      color: #0f172a;
    }

    .store-meta {
      font-size: 9px;
      color: #64748b;
    }
  }

  .ticket-meta-block {
    padding: 6px 0;
    border-bottom: 1px dashed #cbd5e1;
    font-size: 9px;
    color: #475569;
  }

  .ticket-cust-block {
    padding: 6px 0;
    border-bottom: 1px dashed #cbd5e1;
    font-size: 9px;
    color: #475569;
  }

  .ticket-items-table {
    padding: 6px 0;
    border-bottom: 1px dashed #cbd5e1;
    font-size: 9px;

    .table-head {
      display: flex;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .table-row {
      display: flex;
      color: #334155;
      margin-top: 2px;
    }
  }

  .ticket-calc-block {
    padding: 6px 0;
    font-size: 9px;

    .row {
      display: flex;
      justify-content: space-between;
      color: #475569;
      margin-top: 2px;
    }

    .grand-row {
      display: flex;
      justify-content: space-between;
      font-weight: 900;
      font-size: 11px;
      color: #0f172a;
      border-top: 1px dashed #0f172a;
      padding-top: 4px;
      margin-top: 4px;
    }

    .paid {
      color: #10b981;
      font-weight: 800;
    }
  }

  .ticket-qr-block {
    text-align: center;
    padding-top: 8px;
    border-top: 1px dashed #cbd5e1;

    .qr-box {
      background: #f1f5f9;
      padding: 6px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
    }

    .footer-msg {
      font-size: 8px;
      color: #94a3b8;
      margin-top: 4px;
    }
  }
`;

/* ─── Pre-Footer Dark Teal Section ("GET STARTED TODAY") ─── */
const DarkTealPreFooter = styled.section`
  padding: 80px 0;
  background: #003833;
  color: #ffffff;
`;

const PreFooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BrandLogoTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;

  .brand-name {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;

    .highlight {
      color: #00a389;
    }
  }
`;

const DarkEyebrowBadge = styled.div`
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #a1e1da;
  margin-bottom: 16px;
`;

const DarkHeadline = styled.h2`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const DarkSubText = styled.p`
  font-size: 15px;
  color: #d0f0ed;
  line-height: 1.6;
  margin-bottom: 28px;
`;

const DarkBtnGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 640px) {
    flex-direction: column;
    button { width: 100%; }
  }
`;

const BrightTealBtn = styled.button`
  background: #00a389;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  padding: 12px 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #008772;
  }
`;

const DarkOutlinedBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DarkCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DarkIconCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 20px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 24px;
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;
  }
`;

/* ─── Footer ─── */
const FooterContainer = styled.footer`
  background: #0b131f;
  color: #94a3b8;
  padding: 60px 0 30px 0;
  border-top: 1px solid #1e293b;
`;

const FooterMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 32px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 12px;

  .title {
    font-size: 16px;
    font-weight: 800;
    color: #ffffff;

    .highlight {
      color: #00a389;
    }
  }
`;

const FooterTagline = styled.p`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
`;

const FooterColHeader = styled.h4`
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
`;

const FooterLinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  a, button {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #ffffff;
    }
  }
`;

const FooterBottomRow = styled.div`
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
`;

const SocialLinksRow = styled.div`
  display: flex;
  gap: 12px;

  span {
    color: #94a3b8;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: #ffffff;
    }
  }
`;

/* ─── FAQ Accordion Styled Components ─── */
const FaqGrid = styled.div`
  max-width: 840px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FaqItem = styled.div`
  background: #ffffff;
  border: 1px solid ${({ $isOpen }) => ($isOpen ? "#00a389" : "#e2e8f0")};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: ${({ $isOpen }) =>
    $isOpen ? "0 8px 20px rgba(1, 81, 75, 0.08)" : "0 2px 6px rgba(0, 0, 0, 0.02)"};
  transition: all 0.25s ease;

  &:hover {
    border-color: #00a389;
  }
`;

const FaqQuestionBtn = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  cursor: pointer;

  .question-text {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
  }
`;

const FaqIconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $isOpen }) => ($isOpen ? "#01514b" : "#f1f5f9")};
  color: ${({ $isOpen }) => ($isOpen ? "#ffffff" : "#64748b")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.25s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const FaqAnswer = styled.div`
  padding: 0 24px 20px 24px;
  font-size: 14.5px;
  color: #475569;
  line-height: 1.6;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  animation: ${fadeIn} 0.2s ease;
`;

const faqList = [
  {
    question: "What is Billing Every Thing and how does it work?",
    answer:
      "Billing Every Thing is a complete cloud-based restaurant POS and billing management solution. It allows you to manage POS orders, table occupancy, kitchen order tickets (KOT), GST-compliant invoicing, menu items, and real-time sales reports all in one dashboard.",
  },
  {
    question: "Can I generate GST-compliant invoices and print thermal receipts?",
    answer:
      "Yes! You can easily set your GST rates, business details, logo, and print thermal receipts or KOT tickets directly to any USB or Bluetooth thermal printer (2-inch or 3-inch format).",
  },
  {
    question: "Does it support table reservation and Dine-In orders?",
    answer:
      "Yes, our Table Management system lets you define custom dining tables, track real-time occupancy, take order items for specific tables, and generate final customer bills effortlessly.",
  },
  {
    question: "Can my staff use the system on multiple devices simultaneously?",
    answer:
      "Absolutely. Billing Every Thing supports role-based access for admins, cashiers, and kitchen managers. Your team can access the system simultaneously from desktops, tablets, or laptops.",
  },
  {
    question: "Is my data secure and backed up automatically?",
    answer:
      "Yes, all data is securely stored on enterprise cloud servers with SSL encryption and automatic daily backups to guarantee data integrity and 99.9% uptime.",
  },
  {
    question: "How do I upgrade or manage my subscription plan?",
    answer:
      "You can view and upgrade your subscription plan anytime from the Subscription section on the dashboard. Upgrades take effect immediately with full access to premium features.",
  },
];


/* --------------------------------------------------
    MAIN LANDING COMPONENT
-------------------------------------------------- */
const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <LandingWrapper>
      {/* --------------------------------------------------
          NAVBAR
      -------------------------------------------------- */}
      <Nav $isScrolled={isScrolled}>
        <NavContainer>
          {/* Logo */}
          <BrandLink onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <LogoImg src={logo} alt="BillingEveryThing Logo" />
            <BrandTitle>
              Billing<span className="teal">EveryThing</span>
            </BrandTitle>
          </BrandLink>

          {/* Links - Desktop */}
          <NavLinks>
            <NavLinkBtn onClick={() => scrollToSection("features")}>Features</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection("solutions")}>Solutions</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection("how-it-works")}>How It Works</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection("screenshots")}>Screenshots</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection("pricing")}>Pricing</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection("faq")}>FAQ</NavLinkBtn>
          </NavLinks>

          {/* Actions */}
          <NavActions>
            <SignInBtn onClick={() => navigate(PATH_LOGIN)}>Sign In</SignInBtn>
            <GetStartedBtn onClick={() => navigate(PATH_SIGNUP)}>Get Started</GetStartedBtn>
          </NavActions>

          {/* Mobile Hamburger */}
          <HamburgerBtn onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </HamburgerBtn>
        </NavContainer>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <MobileDrawer>
            <MobileNavLink onClick={() => scrollToSection("features")}>Features</MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection("solutions")}>Solutions</MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection("how-it-works")}>How It Works</MobileNavLink>
            <MobileNavLink onClick={() => scrollToSection("screenshots")}>Screenshots</MobileNavLink>
            {/* <MobileNavLink onClick={() => scrollToSection("pricing")}>Pricing</MobileNavLink> */}
            <MobileNavLink onClick={() => scrollToSection("faq")}>FAQ</MobileNavLink>
            <MobileActionWrap>
              <SignInBtn style={{ width: "100%", padding: "10px", textAlign: "center" }} onClick={() => navigate(PATH_LOGIN)}>
                Sign In
              </SignInBtn>
              <GetStartedBtn style={{ width: "100%", padding: "12px", justifyContent: "center" }} onClick={() => navigate(PATH_SIGNUP)}>
                Get Started
              </GetStartedBtn>
            </MobileActionWrap>
          </MobileDrawer>
        )}
      </Nav>

      {/* --------------------------------------------------
          1. HERO SECTION
      -------------------------------------------------- */}
      <HeroSection>
        <Container>
          <HeroGrid>
            {/* Left Column: Headline & CTAs */}
            <HeroLeft>
              <EyebrowBadge>RESTAURANT POS • BILLING • MANAGEMENT</EyebrowBadge>

              <HeroMainTitle>
                Everything You Need to Run Your <span className="highlight">Restaurant.</span>
              </HeroMainTitle>

              <HeroSubText>
                Manage orders, tables, billing, menu items, kitchen operations and more — all from one powerful dashboard.
              </HeroSubText>

              <HeroBtnRow>
                <CtaGreenBtn onClick={() => navigate(PATH_SIGNUP)}>
                  Start Managing Your Restaurant →
                </CtaGreenBtn>

                <ViewDemoBtn onClick={() => scrollToSection("screenshots")}>
                  <PlayIconWrap>
                    <svg width="10" height="12" fill="#01514b" viewBox="0 0 10 12">
                      <path d="M0 0l10 6-10 6V0z" />
                    </svg>
                  </PlayIconWrap>
                  <span>View Demo</span>
                </ViewDemoBtn>
              </HeroBtnRow>

              <TrustTagLine>
                <svg width="16" height="16" fill="none" stroke="#00a389" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Built for restaurants, cafés, bars & food businesses</span>
              </TrustTagLine>
            </HeroLeft>

            {/* Right Column: Dashboard Mockup & Floating Badges */}
            <HeroRight>
              {/* Top Floating Metric Badges Bar */}
              <FloatingMetricsBar>
                <TopMetricItem>
                  <MetricIcon $bg="#e6f7f5" $color="#01514b">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </MetricIcon>
                  <div>
                    <MetricVal>₹10,700</MetricVal>
                    <MetricLabel>Today's Revenue</MetricLabel>
                  </div>
                </TopMetricItem>

                <TopMetricItem>
                  <MetricIcon $bg="#eff6ff" $color="#2563eb">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </MetricIcon>
                  <div>
                    <MetricVal>16</MetricVal>
                    <MetricLabel>Active Orders</MetricLabel>
                  </div>
                </TopMetricItem>

                <TopMetricItem>
                  <MetricIcon $bg="#fff7ed" $color="#ea580c">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </MetricIcon>
                  <div>
                    <MetricVal>33%</MetricVal>
                    <MetricLabel>Table Occupancy</MetricLabel>
                  </div>
                </TopMetricItem>
              </FloatingMetricsBar>

              {/* Comprehensive Dashboard Screenshot Visual */}
              <DashboardFrame>
                <DashboardContainer>
                  {/* Left Dark Teal Sidebar */}
                  <DashSidebar>
                    <DashSidebarHeader>
                      <img src={logo} alt="BE" style={{ width: "22px", height: "22px" }} />
                      <span className="title">Test Hub</span>
                    </DashSidebarHeader>

                    <DashNavList>
                      <DashNavItem $active><span>📊</span> Dashboard</DashNavItem>
                      <DashNavItem><span>📁</span> Categories</DashNavItem>
                      <DashNavItem><span>🪑</span> Tables</DashNavItem>
                      <DashNavItem><span>📦</span> Items Catalog</DashNavItem>
                      <DashNavItem><span>🛍</span> Orders</DashNavItem>
                      <DashNavItem><span>💳</span> Billing</DashNavItem>
                      <DashNavItem><span>📋</span> Order Queue</DashNavItem>
                      <DashNavItem><span>⚙</span> Settings</DashNavItem>
                    </DashNavList>

                    <DashWatermark>
                      <img src={logo} alt="Logo" style={{ width: "16px", height: "16px" }} />
                      <span>Billing Every Thing</span>
                    </DashWatermark>
                  </DashSidebar>

                  {/* Main Analytics Content Area */}
                  <DashMainContent>
                    <DashHeaderRow>
                      <div className="title">Test Hub</div>
                    </DashHeaderRow>

                    {/* Top 4 Stats Cards */}
                    <DashStatsGrid>
                      <DashStatCard>
                        <div className="label-wrap"><span className="icon">$</span> Total Revenue</div>
                        <div className="val">Rs. 10,700</div>
                        <div className="sub green">+12.5% vs yesterday</div>
                      </DashStatCard>

                      <DashStatCard>
                        <div className="label-wrap"><span className="icon">🛍</span> Active Orders</div>
                        <div className="val">16</div>
                        <div className="sub">10 kitchen preparation</div>
                      </DashStatCard>

                      <DashStatCard>
                        <div className="label-wrap"><span className="icon">🪑</span> Table Occupancy</div>
                        <div className="val">33%</div>
                        <div className="sub">7 occupied of 9 total</div>
                      </DashStatCard>

                      <DashStatCard>
                        <div className="label-wrap"><span className="icon">📦</span> Total Items</div>
                        <div className="val">0</div>
                        <div className="sub">0 Available • 0 Out of Stock</div>
                      </DashStatCard>
                    </DashStatsGrid>

                    {/* Charts Middle Row */}
                    <DashMiddleRow>
                      {/* Weekly Sales Trend Line Visual */}
                      <DashChartBox>
                        <div className="box-title">Weekly Sales Trend</div>
                        <TrendLineSvg viewBox="0 0 300 80">
                          <path
                            d="M 0 60 Q 50 10, 100 40 T 200 20 T 300 50 L 300 80 L 0 80 Z"
                            fill="rgba(1, 81, 75, 0.12)"
                          />
                          <path
                            d="M 0 60 Q 50 10, 100 40 T 200 20 T 300 50"
                            fill="none"
                            stroke="#01514b"
                            strokeWidth="2.5"
                          />
                          <circle cx="150" cy="22" r="4" fill="#01514b" />
                        </TrendLineSvg>
                        <TrendDaysRow>
                          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </TrendDaysRow>
                      </DashChartBox>

                      {/* Peak Hours Bar Chart */}
                      <DashChartBox>
                        <div className="box-title">Peak Dine-in Hours</div>
                        <PeakBarsWrap>
                          {[20, 35, 45, 60, 90, 70, 50, 40].map((h, i) => (
                            <PeakBar key={i} style={{ height: `${h}%` }} />
                          ))}
                        </PeakBarsWrap>
                      </DashChartBox>
                    </DashMiddleRow>

                    {/* Bottom Row: Donut + Top Selling Items */}
                    <DashBottomRow>
                      {/* Donut Chart Representation */}
                      <DashSmallBox>
                        <div className="box-title">Order Status</div>
                        <DonutWrap>
                          <DonutSvg viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="3.8"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#01514b"
                              strokeWidth="3.8"
                              strokeDasharray="65, 100"
                            />
                          </DonutSvg>
                          <DonutCenter>
                            <span className="num">23</span>
                            <span className="lbl">TOTAL</span>
                          </DonutCenter>
                        </DonutWrap>
                      </DashSmallBox>

                      {/* Top Selling Items Progress Bars */}
                      <DashSmallBox style={{ flex: 1 }}>
                        <div className="box-title">Top Selling Items</div>
                        <TopItemsProgressList>
                          {[
                            { name: "Penne Arrabbiata", width: "95%", color: "#ef4444" },
                            { name: "Classic Veg Burger", width: "80%", color: "#3b82f6" },
                            { name: "Farmhouse Pizza", width: "70%", color: "#f59e0b" },
                            { name: "White Sauce Pasta", width: "60%", color: "#10b981" },
                            { name: "Paneer Butter Masala", width: "45%", color: "#8b5cf6" },
                          ].map((item, idx) => (
                            <ProgressItemRow key={idx}>
                              <span className="name">{item.name}</span>
                              <div className="bar-track">
                                <div className="bar-fill" style={{ width: item.width, background: item.color }} />
                              </div>
                            </ProgressItemRow>
                          ))}
                        </TopItemsProgressList>
                      </DashSmallBox>
                    </DashBottomRow>
                  </DashMainContent>
                </DashboardContainer>
              </DashboardFrame>
            </HeroRight>
          </HeroGrid>
        </Container>
      </HeroSection>

      {/* --------------------------------------------------
          2. PRODUCT VALUE SECTION ("POWERFUL FEATURES")
      -------------------------------------------------- */}
      <Section id="features" $bg="#ffffff">
        <Container>
          <SectionHeader>
            <EyebrowTag>POWERFUL FEATURES</EyebrowTag>
            <SectionTitle>
              Run Your Restaurant From <span className="highlight">One Place</span>
            </SectionTitle>
            <SectionSub>
              From the first order to the final bill, Billing Every Thing keeps your restaurant operations connected.
            </SectionSub>
          </SectionHeader>

          <CardGrid $cols={3}>
            {/* 1. Smart POS */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Smart POS</FeatureTitle>
              <FeatureDesc>Create and manage restaurant orders quickly.</FeatureDesc>
            </FeatureCard>

            {/* 2. Table Management */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Table Management</FeatureTitle>
              <FeatureDesc>Track tables, seating and occupancy in real time.</FeatureDesc>
            </FeatureCard>

            {/* 3. Fast Billing */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Fast Billing</FeatureTitle>
              <FeatureDesc>Generate accurate bills with GST and payment tracking.</FeatureDesc>
            </FeatureCard>

            {/* 4. Menu Management */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Menu Management</FeatureTitle>
              <FeatureDesc>Manage categories, products, pricing and availability.</FeatureDesc>
            </FeatureCard>

            {/* 5. Kitchen & Order Queue */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Kitchen & Order Queue</FeatureTitle>
              <FeatureDesc>Keep kitchen orders organized and easy to track.</FeatureDesc>
            </FeatureCard>

            {/* 6. Business Dashboard */}
            <FeatureCard>
              <FeatureIconWrap>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </FeatureIconWrap>
              <FeatureTitle>Business Dashboard</FeatureTitle>
              <FeatureDesc>Monitor sales, orders and restaurant performance.</FeatureDesc>
            </FeatureCard>
          </CardGrid>
        </Container>
      </Section>

      {/* --------------------------------------------------
          3. POS SECTION ("FAST & SIMPLE")
      -------------------------------------------------- */}
      <Section id="how-it-works" $bg="#f8fafc" $border>
        <Container>
          <TwoColGrid>
            {/* Left Column: POS New Order Screenshot Browser Mockup */}
            <BrowserFrame style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
              <BrowserHeader>
                <Dot $bg="#ff5f56" />
                <Dot $bg="#ffbd2e" />
                <Dot $bg="#27c93f" />
                <AddressBar>app.billingeverything.com/composer</AddressBar>
              </BrowserHeader>

              <PosMockupBody>
                {/* Category Pills Header */}
                <PosCategoriesScroll>
                  {["All Items", "Pizza", "Burgers", "Pasta", "Momos", "Sandwiches", "Starters", "Chinese", "Main Course", "Beverages", "Desserts"].map((cat, i) => (
                    <PosCatPill key={i} $active={i === 0}>{cat}</PosCatPill>
                  ))}
                </PosCategoriesScroll>

                {/* Items Grid & Cart Ticket */}
                <PosSplitArea>
                  {/* Food Item Grid */}
                  <PosGrid>
                    {[
                      { name: "Cheese Burger", price: "Rs. 199" },
                      { name: "White Sauce Pasta", price: "Rs. 249" },
                      { name: "Veg Momos", price: "Rs. 149" },
                      { name: "Veg Momos", price: "Rs. 149" },
                      { name: "Veg Grilled Sandwich", price: "Rs. 179" },
                      { name: "Chicken Tikka", price: "Rs. 329" },
                    ].map((food, idx) => (
                      <PosItemCard key={idx}>
                        <div className="name">{food.name}</div>
                        <div className="price">{food.price}</div>
                      </PosItemCard>
                    ))}
                  </PosGrid>

                  {/* Composition Ticket Cart */}
                  <PosCartBox>
                    <div className="cart-title">Composition Ticket</div>
                    <div className="cart-item-row">
                      <div>Veg Grilled Sandwich (QTY: 1)</div>
                      <div>Rs. 179</div>
                    </div>
                    <div className="cart-item-row">
                      <div>Veg Hakka Noodle (QTY: 1)</div>
                      <div>Rs. 169</div>
                    </div>

                    <div className="cart-calc">
                      <div className="calc-row"><span>Subtotal</span><span>Rs. 426.00</span></div>
                      <div className="calc-row"><span>GST (5%)</span><span>Rs. 18.40</span></div>
                      <div className="grand-total"><span>Grand Total</span><span>Rs. 444.40</span></div>
                    </div>

                    <div className="cart-btn-grid">
                      <button className="pos-btn teal">Place Order</button>
                      <button className="pos-btn blue">Place & Print</button>
                      <button className="pos-btn orange">KOT</button>
                      <button className="pos-btn purple">KOT & Print</button>
                    </div>
                  </PosCartBox>
                </PosSplitArea>
              </PosMockupBody>
            </BrowserFrame>

            {/* Right Column: POS Content & Checklist */}
            <div>
              <EyebrowTag>FAST & SIMPLE</EyebrowTag>
              <SectionTitle style={{ textAlign: "left", marginTop: "8px" }}>
                Take Orders <span className="highlight">Faster</span>
              </SectionTitle>
              <SectionSub style={{ textAlign: "left", marginTop: "12px", maxWidth: "100%" }}>
                Give your staff a fast and simple POS experience designed for busy restaurant environments.
              </SectionSub>

              {/* 2-Column Checklist */}
              <ChecklistGrid>
                {[
                  "Category-based menu",
                  "Fast item selection",
                  "Table selection",
                  "Customer information",
                  "Quantity controls",
                  "GST calculation",
                  "Cash / Card / Online payments",
                  "Place Order",
                  "Print Bill",
                  "KOT",
                  "KOT & Print",
                ].map((item, idx) => (
                  <CheckListItem key={idx}>
                    <CheckCircleIcon>✓</CheckCircleIcon>
                    <span>{item}</span>
                  </CheckListItem>
                ))}
              </ChecklistGrid>

              <div style={{ marginTop: "28px" }}>
                <CtaGreenBtn onClick={() => navigate(PATH_ORDER_COMPOSER)}>
                  Explore POS →
                </CtaGreenBtn>
              </div>
            </div>
          </TwoColGrid>
        </Container>
      </Section>

      {/* --------------------------------------------------
          4. BILLING & ANALYTICS SECTION (3 COLUMNS)
      -------------------------------------------------- */}
      <Section id="screenshots" $bg="#ffffff">
        <Container>
          <ThreeColSectionGrid>
            {/* Left Column: Billing Content */}
            <div>
              <EyebrowTag>ACCURATE & PROFESSIONAL</EyebrowTag>
              <SectionTitle style={{ textAlign: "left", marginTop: "8px" }}>
                Billing Made <span className="highlight">Simple</span>
              </SectionTitle>
              <SectionSub style={{ textAlign: "left", marginTop: "12px", maxWidth: "100%" }}>
                Create accurate restaurant bills in seconds with GST, discounts, payment modes and professional receipts.
              </SectionSub>

              <ChecklistSingleCol>
                {[
                  "GST calculation",
                  "Discounts",
                  "Multiple payment modes",
                  "Invoice numbers",
                  "Order numbers",
                  "Table information",
                  "Customer details",
                  "Receipt printing",
                  "Multiple copies",
                  "Custom print settings",
                ].map((item, idx) => (
                  <CheckListItem key={idx}>
                    <CheckCircleIcon>✓</CheckCircleIcon>
                    <span>{item}</span>
                  </CheckListItem>
                ))}
              </ChecklistSingleCol>

              <div style={{ marginTop: "24px" }}>
                <CtaGreenBtn onClick={() => navigate(PATH_BILLING)}>
                  Create Your First Bill →
                </CtaGreenBtn>
              </div>
            </div>

            {/* Center Column: Realistic Thermal Receipt Visual Card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ThermalTicketCard>
                <div className="ticket-header">
                  <div className="store-name">TEST HUB</div>
                  <div className="store-meta">Sector 117 / Sector 118 (TDI City) Park Street</div>
                  <div className="store-meta">Ph No: +91 9871308342</div>
                  <div className="store-meta">Email: customer@gmail.com</div>
                  <div className="store-meta">GSTIN: 32AABFA0123A</div>
                </div>

                <div className="ticket-meta-block">
                  <div className="row"><span>Invoice: INV-2026-0042</span></div>
                  <div className="row"><span>Order: #ORD-108</span></div>
                  <div className="row"><span>Date: 9/20/2026 07:30 AM</span></div>
                  <div className="row"><span>Table: T-01 (Dine-In)</span></div>
                </div>

                <div className="ticket-cust-block">
                  <div>Customer: John Doe</div>
                  <div>Contact: +91 9876543210</div>
                </div>

                <div className="ticket-items-table">
                  <div className="table-head">
                    <span style={{ width: "20%" }}>SKU</span>
                    <span style={{ width: "40%" }}>Item</span>
                    <span style={{ width: "10%" }}>Qty</span>
                    <span style={{ width: "15%", textAlign: "right" }}>Rate</span>
                    <span style={{ width: "15%", textAlign: "right" }}>Total</span>
                  </div>
                  <div className="table-row">
                    <span style={{ width: "20%" }}>BUR-01</span>
                    <span style={{ width: "40%" }}>Paneer Tikka Burger</span>
                    <span style={{ width: "10%" }}>2</span>
                    <span style={{ width: "15%", textAlign: "right" }}>180</span>
                    <span style={{ width: "15%", textAlign: "right" }}>360</span>
                  </div>
                  <div className="table-row">
                    <span style={{ width: "20%" }}>BEV-03</span>
                    <span style={{ width: "40%" }}>Iced Cappuccino</span>
                    <span style={{ width: "10%" }}>1</span>
                    <span style={{ width: "15%", textAlign: "right" }}>140</span>
                    <span style={{ width: "15%", textAlign: "right" }}>120</span>
                  </div>
                </div>

                <div className="ticket-calc-block">
                  <div className="row"><span>Subtotal:</span><span>Rs.500.00</span></div>
                  <div className="row"><span>Discount:</span><span>-Rs.20.00</span></div>
                  <div className="row"><span>CGST (2.5%):</span><span>Rs.12.00</span></div>
                  <div className="row"><span>SGST (2.5%):</span><span>Rs.12.00</span></div>
                  <div className="grand-row">
                    <span>GRAND TOTAL:</span>
                    <span>Rs.504.00</span>
                  </div>
                  <div className="row"><span>Payment Mode:</span><span>UPI / GPay</span></div>
                  <div className="row"><span>Status:</span><span className="paid">PAID</span></div>
                </div>

                {/* QR Code Scan to Pay Visual */}
                <div className="ticket-qr-block">
                  <div className="qr-box">Scan to Pay via UPI</div>
                  <div className="footer-msg">Thank You! Visit Again.</div>
                </div>
              </ThermalTicketCard>
            </div>

            {/* Right Column: Dashboard Analytics Content */}
            <div>
              <EyebrowTag>REAL-TIME INSIGHTS</EyebrowTag>
              <SectionTitle style={{ textAlign: "left", marginTop: "8px" }}>
                Know What's Happening in Your <span className="highlight">Restaurant</span>
              </SectionTitle>
              <SectionSub style={{ textAlign: "left", marginTop: "12px", maxWidth: "100%" }}>
                Get complete visibility with real-time data and powerful analytics.
              </SectionSub>

              <ChecklistGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
                {[
                  "Total Revenue",
                  "Active Orders",
                  "Table Occupancy",
                  "Total Items",
                  "Weekly Sales Trend",
                  "Peak Dine-in Hours",
                  "Order Status",
                  "Top Selling Items",
                ].map((item, idx) => (
                  <CheckListItem key={idx}>
                    <CheckCircleIcon>✓</CheckCircleIcon>
                    <span>{item}</span>
                  </CheckListItem>
                ))}
              </ChecklistGrid>

              <div style={{ marginTop: "28px" }}>
                <CtaGreenBtn onClick={() => navigate(PATH_DASHBOARD)}>
                  View Dashboard →
                </CtaGreenBtn>
              </div>
            </div>
          </ThreeColSectionGrid>
        </Container>
      </Section>

      {/* --------------------------------------------------
          SUBSCRIPTION PRICING CARDS
      -------------------------------------------------- */}
      {/* <SubscriptionSection id="pricing" /> */}

      {/* --------------------------------------------------
          5. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
      -------------------------------------------------- */}
      <Section id="faq" $bg="#f8fafc" $border>
        <Container>
          <SectionHeader>
            <EyebrowTag>GOT QUESTIONS?</EyebrowTag>
            <SectionTitle>
              Frequently Asked <span className="highlight">Questions</span>
            </SectionTitle>
            <SectionSub>
              Everything you need to know about Billing Every Thing and how it helps your restaurant.
            </SectionSub>
          </SectionHeader>

          <FaqGrid>
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <FaqItem key={idx} $isOpen={isOpen}>
                  <FaqQuestionBtn onClick={() => toggleFaq(idx)}>
                    <span className="question-text">{item.question}</span>
                    <FaqIconCircle $isOpen={isOpen}>
                      {isOpen ? "−" : "+"}
                    </FaqIconCircle>
                  </FaqQuestionBtn>
                  {isOpen && <FaqAnswer>{item.answer}</FaqAnswer>}
                </FaqItem>
              );
            })}
          </FaqGrid>
        </Container>
      </Section>


      {/* --------------------------------------------------
          5. PRE-FOOTER CTA SECTION ("GET STARTED TODAY")
      -------------------------------------------------- */}
      <DarkTealPreFooter>
        <Container>
          <PreFooterGrid>
            {/* Left Content */}
            <div>
              <BrandLogoTitleRow>
                <img src={logo} alt="BE" style={{ width: "36px", height: "36px" }} />
                <span className="brand-name">Billing<span className="highlight">EveryThing</span></span>
              </BrandLogoTitleRow>

              <DarkEyebrowBadge>GET STARTED TODAY</DarkEyebrowBadge>

              <DarkHeadline>
                Ready to Simplify Your Restaurant Operations?
              </DarkHeadline>

              <DarkSubText>
                Bring orders, billing, tables, menu management and restaurant operations together in one powerful platform.
              </DarkSubText>

              <DarkBtnGroup>
                <BrightTealBtn onClick={() => navigate(PATH_SIGNUP)}>
                  Get Started →
                </BrightTealBtn>

                <DarkOutlinedBtn onClick={() => scrollToSection("screenshots")}>
                  View Demo
                </DarkOutlinedBtn>
              </DarkBtnGroup>
            </div>

            {/* Right Side 6 Icon Cards Grid */}
            <DarkCardsGrid>
              <DarkIconCard>
                <div className="icon">🛒</div>
                <div className="label">Fast Order Management</div>
              </DarkIconCard>

              <DarkIconCard>
                <div className="icon">🧾</div>
                <div className="label">Simple Billing</div>
              </DarkIconCard>

              <DarkIconCard>
                <div className="icon">💻</div>
                <div className="label">Restaurant POS</div>
              </DarkIconCard>

              <DarkIconCard>
                <div className="icon">🪑</div>
                <div className="label">Table Management</div>
              </DarkIconCard>

              <DarkIconCard>
                <div className="icon">📋</div>
                <div className="label">GST Support</div>
              </DarkIconCard>

              <DarkIconCard>
                <div className="icon">🖨</div>
                <div className="label">Professional Printing</div>
              </DarkIconCard>
            </DarkCardsGrid>
          </PreFooterGrid>
        </Container>
      </DarkTealPreFooter>

      {/* --------------------------------------------------
          6. FOOTER
      -------------------------------------------------- */}
      <FooterContainer>
        <Container>
          <FooterMainGrid>
            {/* Left Brand Col */}
            <div>
              <FooterBrandRow onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <img src={logo} alt="BE" style={{ width: "24px", height: "24px" }} />
                <span className="title">Billing<span className="highlight">EveryThing</span></span>
              </FooterBrandRow>
              <FooterTagline>Restaurant management made simple.</FooterTagline>
            </div>

            {/* Column 1: Product */}
            <div>
              <FooterColHeader>Product</FooterColHeader>
              <FooterLinkList>
                <li><button onClick={() => navigate(PATH_DASHBOARD)}>Dashboard</button></li>
                <li><button onClick={() => navigate(PATH_ORDER_COMPOSER)}>POS</button></li>
                <li><button onClick={() => navigate(PATH_BILLING)}>Billing</button></li>
                <li><button onClick={() => navigate(PATH_ITEMS)}>Tables</button></li>
                <li><button onClick={() => navigate(PATH_ITEMS)}>Menu Management</button></li>
                <li><button onClick={() => navigate(PATH_SETTINGS_PRINT)}>Printing</button></li>
              </FooterLinkList>
            </div>

            {/* Column 2: Company */}
            <div>
              <FooterColHeader>Company</FooterColHeader>
              <FooterLinkList>
                <li><a href="#features">About</a></li>
                <li><a href="#solutions">Contact</a></li>
                {/* <li><a href="#pricing">Pricing</a></li> */}
                <li><a href="#faq">FAQ</a></li>
              </FooterLinkList>
            </div>

            {/* Column 3: Resources */}
            <div>
              <FooterColHeader>Resources</FooterColHeader>
              <FooterLinkList>
                <li><a href="#faq">Help Center</a></li>
                <li><a href="#faq">Documentation</a></li>
                <li><a href="#faq">Support</a></li>
              </FooterLinkList>
            </div>

            {/* Column 4: Legal */}
            <div>
              <FooterColHeader>Legal</FooterColHeader>
              <FooterLinkList>
                <li><a href="#faq">Privacy Policy</a></li>
                <li><a href="#faq">Terms & Conditions</a></li>
              </FooterLinkList>
            </div>
          </FooterMainGrid>

          <FooterBottomRow>
            <div>© 2026 Billing Every Thing. All rights reserved.</div>
            <SocialLinksRow>
              <span>f</span>
              <span>X</span>
              <span>in</span>
              <span>yt</span>
            </SocialLinksRow>
          </FooterBottomRow>
        </Container>
      </FooterContainer>
    </LandingWrapper>
  );
};

export default Landing;