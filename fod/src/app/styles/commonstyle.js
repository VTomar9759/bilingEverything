import styled from "styled-components";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-primary);
  margin-bottom: 6px;
  letter-spacing: 0.01em;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  font-family: var(--font-sans);

  &::placeholder { color: var(--color-text-muted); }

  &:hover { border-color: var(--color-primary-100); }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(1,81,75,0.10);
  }
`;

export const TitleText = styled.p`
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
`;

export const Headerbox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $padding }) => $padding || "0"};
  background-color: ${({ $bgcolor }) => $bgcolor || "transparent"};
`;

export const Headingtext = styled.p`
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.3;
`;

/* ─── Card surface ─── */
export const SurfaceCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: ${({ $padding }) => $padding || "24px"};
`;

/* ─── Stat card ─── */
export const StatCard = styled(SurfaceCard)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* ─── Badge ─── */
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $variant }) =>
    $variant === "success" ? "rgba(16,185,129,0.1)" :
    $variant === "warning" ? "rgba(245,158,11,0.1)" :
    $variant === "error"   ? "rgba(239,68,68,0.1)"  :
    "rgba(1,81,75,0.1)"};
  color: ${({ $variant }) =>
    $variant === "success" ? "#10b981" :
    $variant === "warning" ? "#f59e0b" :
    $variant === "error"   ? "#ef4444" :
    "var(--color-primary)"};
`;
