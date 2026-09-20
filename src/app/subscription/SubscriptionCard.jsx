import React from "react";
import styled from "styled-components";

const SubscriptionCard = ({ plan, billingCycle, onSelectPlan }) => {
  const isYearly = billingCycle === "yearly";
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;

  return (
    <CardContainer $popular={plan.popular}>
      {plan.badge && <PopularBadge $popular={plan.popular}>{plan.badge}</PopularBadge>}

      <CardHeader>
        <PlanName>{plan.name}</PlanName>
        <PlanTagline>{plan.tagline}</PlanTagline>
      </CardHeader>

      <PriceSection>
        <CurrencySymbol>₹</CurrencySymbol>
        <PriceValue>{price.toLocaleString()}</PriceValue>
        <PriceBillingPeriod> / month</PriceBillingPeriod>
        {isYearly && <BilledYearlyNote>Billed annually (Save 20%)</BilledYearlyNote>}
      </PriceSection>

      <FeatureList>
        {plan.features.map((feat, idx) => (
          <FeatureItem key={idx}>
            <CheckCircleIcon>✓</CheckCircleIcon>
            <span>{feat}</span>
          </FeatureItem>
        ))}
      </FeatureList>

      <CardFooter>
        <ActionButton
          $popular={plan.popular}
          onClick={() => onSelectPlan && onSelectPlan(plan)}
        >
          {plan.buttonText}
        </ActionButton>
      </CardFooter>
    </CardContainer>
  );
};

export default SubscriptionCard;

/* --------------------------------------------------
    STYLED COMPONENTS
-------------------------------------------------- */
const CardContainer = styled.div`
  background: #ffffff;
  border: ${({ $popular }) => ($popular ? "2px solid #01514b" : "1px solid #e2e8f0")};
  border-radius: 20px;
  padding: 32px 28px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: ${({ $popular }) =>
    $popular
      ? "0 16px 36px rgba(1, 81, 75, 0.15)"
      : "0 4px 16px rgba(0, 0, 0, 0.04)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(1, 81, 75, 0.18);
    border-color: #01514b;
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ $popular }) => ($popular ? "#01514b" : "#00a389")};
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 16px;
  border-radius: 999px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(1, 81, 75, 0.2);
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
`;

const PlanName = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
`;

const PlanTagline = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const PriceSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const CurrencySymbol = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  vertical-align: top;
`;

const PriceValue = styled.span`
  font-size: 44px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
`;

const PriceBillingPeriod = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
`;

const BilledYearlyNote = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #00a389;
  margin-top: 4px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

const CheckCircleIcon = styled.span`
  width: 18px;
  height: 18px;
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

const CardFooter = styled.div`
  margin-top: auto;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  border: ${({ $popular }) => ($popular ? "none" : "1px solid #01514b")};
  background: ${({ $popular }) => ($popular ? "#01514b" : "#ffffff")};
  color: ${({ $popular }) => ($popular ? "#ffffff" : "#01514b")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $popular }) => ($popular ? "#003833" : "#f0faf9")};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(1, 81, 75, 0.2);
  }
`;
