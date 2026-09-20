import styled, { keyframes } from "styled-components";

/* ─── Spinner animation ─── */
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─────────────────────────────────────────────
   PAGE SPINNER  –  centred spinner card
   Usage:  <PageSpinner />  or  <PageSpinner minHeight="300px" />
───────────────────────────────────────────── */
const SpinnerWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ $minHeight }) => $minHeight || "240px"};
  width: 100%;
`;

const SpinnerRing = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(1, 81, 75, 0.15);
  border-top-color: #01514b;
  animation: ${spin} 0.75s linear infinite;
`;

export const PageSpinner = ({ minHeight }) => (
  <SpinnerWrap $minHeight={minHeight||'80vh'}>
    <SpinnerRing />
  </SpinnerWrap>
);

/* ─────────────────────────────────────────────
   EMPTY PLACEHOLDER  –  attractive "no data" state
   Props:
     icon      – emoji string, defaults to "📭"
     title     – heading text
     desc      – subtitle text
     action    – optional React node (a button etc.)
───────────────────────────────────────────── */
const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  min-height:80vh;
  animation: ${fadeIn} 0.35s ease;
`;

const EmptyIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6f7f5 0%, #f0fdf9 100%);
  border: 1.5px solid rgba(1, 81, 75, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 4px;
  box-shadow: 0 4px 16px rgba(1, 81, 75, 0.08);
`;

const EmptyTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary, #64748b);
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
`;

export const EmptyPlaceholder = ({
  icon = "📭",
  title = "Nothing here yet",
  desc = "No data available at the moment.",
  action,
}) => (
  <EmptyWrap>
    <EmptyIconCircle>{icon}</EmptyIconCircle>
    <EmptyTitle>{title}</EmptyTitle>
    <EmptyDesc>{desc}</EmptyDesc>
    {action && action}
  </EmptyWrap>
);
