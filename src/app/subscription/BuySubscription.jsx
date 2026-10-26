import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import SubscriptionCard from "./SubscriptionCard";
import { fetchSubscriptionPlans } from "./subscription-plan";

/**
 * BuySubscription
 * ----------------
 * Full-page wall shown to logged-in users whose `user_subscription.subscription`
 * is `false`. There is no sidebar / top-nav — just the plans and a logout option.
 */
const BuySubscription = ({ onLogout }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("BuySubscription – error loading plans:", err);
      setError("Unable to load subscription plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleSelectPlan = (plan) => {
    // TODO: wire up your purchase / payment flow here
    console.log("Selected plan:", plan);
    alert(`Selected: ${plan.plan_name || plan.name} – payment flow coming soon!`);
  };

  return (
    <PageWrapper>
      {/* Top bar – brand + logout only, no navigation */}
      <TopBar>
        <Brand>
          <BrandDot />
          BillingEverything
        </Brand>
        {onLogout && (
          <LogoutBtn onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </LogoutBtn>
        )}
      </TopBar>

      <HeroSection>
        <HeroPill>🔒 Subscription Required</HeroPill>
        <HeroTitle>Unlock Full Access</HeroTitle>
        <HeroSubtitle>
          Choose a plan below to start managing your restaurant operations — billing, orders, inventory &amp; more.
        </HeroSubtitle>
      </HeroSection>

      <PlansSection>
        <SectionHeader>
          <EyebrowTag>SUBSCRIPTION PLANS</EyebrowTag>
          <SectionTitle>Simple, Transparent Pricing</SectionTitle>
          <SectionSubtitle>
            No hidden fees. Cancel anytime. Pick the plan that fits your restaurant.
          </SectionSubtitle>
        </SectionHeader>

        {loading && (
          <CardsGrid>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i}>
                <SkeletonBadge />
                <SkeletonTitle />
                <SkeletonSubtitle />
                <SkeletonPrice />
                <SkeletonFeatures>
                  {[90, 80, 85, 75].map((w, idx) => (
                    <SkeletonLine key={idx} $width={`${w}%`} />
                  ))}
                </SkeletonFeatures>
                <SkeletonButton />
              </SkeletonCard>
            ))}
          </CardsGrid>
        )}

        {!loading && plans.length === 0 && (
          <EmptyBox>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>No Plans Available</EmptyTitle>
            <EmptyText>
              {error || "No active subscription plans found. Please contact support."}
            </EmptyText>
            <RetryBtn onClick={loadPlans}>Retry</RetryBtn>
          </EmptyBox>
        )}

        {!loading && plans.length > 0 && (
          <CardsGrid>
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </CardsGrid>
        )}
      </PlansSection>

      <Footer>
        <FooterText>
          Need help?{" "}
          <FooterLink href="mailto:support@billingeverything.com">
            Contact Support
          </FooterLink>
        </FooterText>
      </Footer>
    </PageWrapper>
  );
};

export default BuySubscription;

/* ─── Animations ─────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

/* ─── Layout ─────────────────────────────────────────────────────── */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(160deg, #f0fdfb 0%, #f8fafc 60%, #eef2ff 100%);
  display: flex;
  flex-direction: column;
  font-family: "Inter", "Segoe UI", sans-serif;
`;

/* ─── Top bar ────────────────────────────────────────────────────── */
const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(1, 81, 75, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 600px) {
    padding: 14px 20px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
`;

const BrandDot = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #01514b, #00a389);
  flex-shrink: 0;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }
`;

/* ─── Hero ───────────────────────────────────────────────────────── */
const HeroSection = styled.section`
  text-align: center;
  padding: 72px 24px 48px;
  animation: ${fadeUp} 0.55s ease both;
`;

const HeroPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #01514b;
  background: #e6f7f5;
  border: 1px solid #b2e8e2;
  padding: 5px 16px;
  border-radius: 999px;
  margin-bottom: 18px;
`;

const HeroTitle = styled.h1`
  font-size: 46px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.035em;
  margin: 0 0 14px;
  background: linear-gradient(120deg, #0f172a 30%, #01514b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 600px) {
    font-size: 30px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.65;
`;

/* ─── Plans section ──────────────────────────────────────────────── */
const PlansSection = styled.section`
  flex: 1;
  padding: 0 24px 80px;
  animation: ${fadeUp} 0.65s 0.1s ease both;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 580px;
  margin: 0 auto 52px;
`;

const EyebrowTag = styled.div`
  display: inline-block;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 14px;
  border-radius: 999px;
  background: #e6f7f5;
  color: #01514b;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0 0 10px;

  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;

  @media (max-width: 1150px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
`;

/* ─── Skeletons ──────────────────────────────────────────────────── */
const SkeletonCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${pulse} 1.8s ease-in-out infinite;
`;
const SkeletonBadge = styled.div`
  width: 70px;
  height: 18px;
  background: #e2e8f0;
  border-radius: 999px;
`;
const SkeletonTitle = styled.div`
  width: 60%;
  height: 24px;
  background: #e2e8f0;
  border-radius: 6px;
`;
const SkeletonSubtitle = styled.div`
  width: 85%;
  height: 14px;
  background: #f1f5f9;
  border-radius: 4px;
`;
const SkeletonPrice = styled.div`
  width: 50%;
  height: 38px;
  background: #e2e8f0;
  border-radius: 8px;
  margin: 12px 0;
`;
const SkeletonFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  flex: 1;
`;
const SkeletonLine = styled.div`
  width: ${({ $width }) => $width || "100%"};
  height: 12px;
  background: #f1f5f9;
  border-radius: 4px;
`;
const SkeletonButton = styled.div`
  width: 100%;
  height: 44px;
  background: #e2e8f0;
  border-radius: 12px;
  margin-top: 16px;
`;

/* ─── Empty / Error ──────────────────────────────────────────────── */
const EmptyBox = styled.div`
  text-align: center;
  padding: 60px 24px;
  background: #fff;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
  max-width: 540px;
  margin: 0 auto;
`;
const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
`;
const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
`;
const EmptyText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 20px;
`;
const RetryBtn = styled.button`
  background: #01514b;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #023834;
    transform: translateY(-1px);
  }
`;

/* ─── Footer ─────────────────────────────────────────────────────── */
const Footer = styled.footer`
  padding: 24px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.6);
`;
const FooterText = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
`;
const FooterLink = styled.a`
  color: #01514b;
  font-weight: 700;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
