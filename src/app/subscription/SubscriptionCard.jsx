import React from "react";
import styled from "styled-components";

const SubscriptionCard = ({ plan, billingCycle = "monthly", onSelectPlan }) => {
  const isYearly = billingCycle === "yearly";

  // Check if plan comes from the database table schema
  const isDbPlan = plan.duration_months !== undefined || plan.durationMonths !== undefined;
  const isFreeTrial = Boolean(plan.is_free_trial);

  let price = 0;
  let billingPeriodText = " / month";
  let subNote = null;

  if (isDbPlan) {
    price = Number(plan.price || 0);
    const durationText =
      plan.durationText ||
      (plan.duration_months === 12
        ? "1 Year"
        : `${plan.duration_months} ${plan.duration_months === 1 ? "Month" : "Months"}`);

    billingPeriodText = isFreeTrial ? ` / ${durationText}` : ` / ${durationText}`;

    if (isFreeTrial) {
      subNote = "100% Free • No credit card required";
    } else if (plan.monthlyEquivalent && plan.duration_months > 1) {
      subNote = `Effective ₹${plan.monthlyEquivalent.toLocaleString("en-IN")}/month`;
    }
  } else {
    price = isYearly ? plan.priceYearly || 0 : plan.priceMonthly || 0;
    billingPeriodText = " / month";
    if (isYearly) {
      subNote = "Billed annually (Save 20%)";
    }
  }

  const planName = plan.name || plan.plan_name || "Subscription Plan";
  const buttonLabel =
    plan.buttonText || (isFreeTrial ? "Start Free Trial" : "Get Started Now");

  return (
    <CardContainer $popular={plan.popular}>
      {plan.badge && <PopularBadge $popular={plan.popular}>{plan.badge}</PopularBadge>}

      <CardHeader>
        <PlanName>{planName}</PlanName>
        {plan.tagline && <PlanTagline>{plan.tagline}</PlanTagline>}
      </CardHeader>

      <PriceSection>
        <CurrencySymbol>₹</CurrencySymbol>
        <PriceValue>{price.toLocaleString("en-IN")}</PriceValue>
        <PriceBillingPeriod>{billingPeriodText}</PriceBillingPeriod>
        {subNote && <BilledYearlyNote>{subNote}</BilledYearlyNote>}
      </PriceSection>

      {Array.isArray(plan.features) && (
        <FeatureList>
          {plan.features.map((feat, idx) => (
            <FeatureItem key={idx}>
              <CheckCircleIcon>✓</CheckCircleIcon>
              <span>{feat}</span>
            </FeatureItem>
          ))}
        </FeatureList>
      )}

      <CardFooter>
        <ActionButton
          $popular={plan.popular}
          onClick={() => onSelectPlan && onSelectPlan(plan)}
        >
          {buttonLabel}
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
  padding: 32px 24px;
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
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(1, 81, 75, 0.2);
`;

const CardHeader = styled.div`
  margin-bottom: 18px;
`;

const PlanName = styled.h3`
  font-size: 21px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
`;

const PlanTagline = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  min-height: 36px;
`;

const PriceSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
`;

const CurrencySymbol = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  vertical-align: top;
`;

const PriceValue = styled.span`
  font-size: 40px;
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
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  line-height: 1.4;
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
  margin-top: 1px;
`;

const CardFooter = styled.div`
  margin-top: auto;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 13px;
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
