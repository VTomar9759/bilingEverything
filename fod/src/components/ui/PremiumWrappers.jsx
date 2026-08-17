import styled, { keyframes } from "styled-components";
import { Card as AntdCard, Button as AntdButton, Tag as AntdTag } from "antd";

/* ─── Animations ─── */
export const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(1, 81, 75, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(1, 81, 75, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(1, 81, 75, 0); }
`;

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const hoverGlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ─── Reusable Layout & Page Containers ─── */
export const GlassPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeInUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

/* ─── Premium Glassmorphic Cards ─── */
export const GlassCard = styled(AntdCard)`
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  overflow: hidden;

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
    background: transparent !important;
    padding: 16px 24px !important;
    
    .ant-card-head-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08), 0 0 0 1.5px var(--color-primary-100) !important;
    border-color: transparent !important;
  }
`;

/* ─── Interactive Micro-Animated Buttons ─── */
export const PremiumButton = styled(AntdButton)`
  height: 38px !important;
  padding: 0 18px !important;
  font-weight: 600 !important;
  font-size: 13.5px !important;
  border-radius: var(--radius-md) !important;
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: white !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center;
  gap: 6px !important;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.2) !important;
  transition: all 0.25s ease !important;
  cursor: pointer;

  &:hover {
    background: var(--color-primary-light) !important;
    border-color: var(--color-primary-light) !important;
    box-shadow: 0 6px 20px rgba(1, 81, 75, 0.3) !important;
    transform: translateY(-1.5px);
  }

  &:active {
    transform: translateY(0);
  }

  ${({ $secondary }) =>
    $secondary &&
    `
    background: white !important;
    border: 1px solid var(--color-border) !important;
    color: var(--color-text-secondary) !important;
    box-shadow: var(--shadow-xs) !important;

    &:hover {
      background: var(--color-primary-50) !important;
      border-color: var(--color-primary-100) !important;
      color: var(--color-primary) !important;
      box-shadow: var(--shadow-sm) !important;
    }
  `}

  ${({ $danger }) =>
    $danger &&
    `
    background: #ef4444 !important;
    border-color: #ef4444 !important;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2) !important;

    &:hover {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3) !important;
      color: white !important;
    }
  `}
`;

/* ─── Animated Flow Badges ─── */
export const GlassTag = styled(AntdTag)`
  margin: 0 !important;
  border-radius: 999px !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 2px 10px !important;
  line-height: 18px !important;
  border: 1px solid transparent !important;
  backdrop-filter: blur(4px);

  ${({ color }) => {
    switch (color) {
      case "green":
      case "success":
        return `
          background: rgba(16, 185, 129, 0.08) !important;
          color: #10b981 !important;
          border-color: rgba(16, 185, 129, 0.15) !important;
        `;
      case "blue":
      case "processing":
        return `
          background: rgba(59, 130, 246, 0.08) !important;
          color: #3b82f6 !important;
          border-color: rgba(59, 130, 246, 0.15) !important;
        `;
      case "orange":
      case "warning":
        return `
          background: rgba(245, 158, 11, 0.08) !important;
          color: #f59e0b !important;
          border-color: rgba(245, 158, 11, 0.15) !important;
        `;
      case "purple":
        return `
          background: rgba(139, 92, 246, 0.08) !important;
          color: #8b5cf6 !important;
          border-color: rgba(139, 92, 246, 0.15) !important;
        `;
      case "red":
      case "error":
        return `
          background: rgba(239, 68, 68, 0.08) !important;
          color: #ef4444 !important;
          border-color: rgba(239, 68, 68, 0.15) !important;
        `;
      default:
        return `
          background: rgba(156, 163, 175, 0.08) !important;
          color: #6b7280 !important;
          border-color: rgba(156, 163, 175, 0.15) !important;
        `;
    }
  }}
`;

/* ─── Premium Dashboard Metrics Grid ─── */
export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
`;
