import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "./SubscriptionCard";
import { SUBSCRIPTION_PLANS } from "./subscriptionData";
import { PATH_SIGNUP } from "../routes/pathname";

const SubscriptionSection = ({ id = "pricing" }) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("yearly"); // "monthly" | "yearly"

  const handleSelectPlan = (plan) => {
    navigate(PATH_SIGNUP, { state: { selectedPlan: plan.id, billingCycle } });
  };

  return (
    <SectionWrapper id={id}>
      <Container>
        <HeaderArea>
          <EyebrowTag>SUBSCRIPTION PLANS</EyebrowTag>
          <MainTitle>Simple, Transparent Pricing</MainTitle>
          <SubTitle>Choose the perfect plan to power your restaurant operations.</SubTitle>

          {/* Billing Cycle Toggle */}
          <ToggleContainer>
            <ToggleOption
              $active={billingCycle === "monthly"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly Billing
            </ToggleOption>

            <SwitchButton
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
              }
            >
              <SwitchKnob $active={billingCycle === "yearly"} />
            </SwitchButton>

            <ToggleOption
              $active={billingCycle === "yearly"}
              onClick={() => setBillingCycle("yearly")}
            >
              Annual Billing
              <DiscountPill>Save 20%</DiscountPill>
            </ToggleOption>
          </ToggleContainer>
        </HeaderArea>

        {/* Cards Grid */}
        <CardsGrid>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </CardsGrid>
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const HeaderArea = styled.div`
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

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

const ToggleOption = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "#0f172a" : "#94a3b8")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
`;

const SwitchButton = styled.button`
  width: 54px;
  height: 28px;
  border-radius: 999px;
  background: #01514b;
  padding: 3px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const SwitchKnob = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
  transform: ${({ $active }) => ($active ? "translateX(26px)" : "translateX(0)")};
`;

const DiscountPill = styled.span`
  font-size: 10px;
  font-weight: 800;
  background: #d1fae5;
  color: #065f46;
  padding: 2px 8px;
  border-radius: 999px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  max-width: 1140px;
  margin: 0 auto;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
`;
