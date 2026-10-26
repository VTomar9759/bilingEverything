import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "./SubscriptionCard";
import { fetchSubscriptionPlans } from "./subscription-plan";
import { PATH_SIGNUP } from "../routes/pathname";

const SubscriptionSection = ({ id = "pricing" }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSubscriptionPlans();
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error loading plans from database table:", err);
      setError("Unable to load subscription plans from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleSelectPlan = (plan) => {
    navigate(PATH_SIGNUP, {
      state: {
        selectedPlan: plan.id,
        planName: plan.plan_name || plan.name,
        durationMonths: plan.duration_months,
        price: plan.price,
        isFreeTrial: plan.is_free_trial,
      },
    });
  };

  return (
    <SectionWrapper id={id}>
      <Container>
        <HeaderArea>
          <EyebrowTag>SUBSCRIPTION PLANS</EyebrowTag>
          <MainTitle>Simple, Transparent Pricing</MainTitle>
          <SubTitle>
            Choose the right plan to power your restaurant operations. No hidden fees.
          </SubTitle>
        </HeaderArea>

        {/* Loading Skeletons */}
        {loading && (
          <CardsGrid>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i}>
                <SkeletonBadge />
                <SkeletonTitle />
                <SkeletonSubtitle />
                <SkeletonPrice />
                <SkeletonFeatures>
                  <SkeletonLine $width="90%" />
                  <SkeletonLine $width="80%" />
                  <SkeletonLine $width="85%" />
                  <SkeletonLine $width="75%" />
                </SkeletonFeatures>
                <SkeletonButton />
              </SkeletonCard>
            ))}
          </CardsGrid>
        )}

        {/* Empty / Error State */}
        {!loading && plans.length === 0 && (
          <EmptyContainer>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>No Subscription Plans Available</EmptyTitle>
            <EmptyText>
              {error ||
                "No active plans found in the subscription_plan database table. Check your database or RLS permissions."}
            </EmptyText>
            <RetryButton onClick={loadPlans}>Refresh Plans</RetryButton>
          </EmptyContainer>
        )}

        {/* Cards Grid */}
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
      </Container>
    </SectionWrapper>
  );
};

export default SubscriptionSection;

/* --------------------------------------------------
    STYLED COMPONENTS
-------------------------------------------------- */
const SectionWrapper = styled.section`
  padding: 90px 0;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const HeaderArea = styled.div`
  text-align: center;
  max-width: 640px;
  margin: 0 auto 52px auto;
`;

const EyebrowTag = styled.div`
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 14px;
  border-radius: 999px;
  background: #e6f7f5;
  color: #01514b;
  margin-bottom: 10px;
`;

const MainTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0 0 10px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SubTitle = styled.p`
  font-size: 15px;
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

const LoadingHint = styled.p`
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 20px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const SkeletonCard = styled.div`
  background: #ffffff;
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

const EmptyContainer = styled.div`
  text-align: center;
  padding: 60px 24px;
  background: #ffffff;
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
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const RetryButton = styled.button`
  background: #01514b;
  color: #ffffff;
  font-weight: 600;
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
