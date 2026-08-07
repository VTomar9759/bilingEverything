import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const HomeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const Breadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <Wrapper aria-label="Breadcrumb">
      <BreadItem onClick={() => navigate(-items.length)} $isLast={false} title="Home">
        <HomeIcon />
      </BreadItem>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <Chevron><ChevronRight /></Chevron>
            <BreadItem
              $isLast={isLast}
              onClick={isLast ? undefined : () => navigate(-(items.length - 1 - index))}
            >
              {item}
            </BreadItem>
          </React.Fragment>
        );
      })}
    </Wrapper>
  );
};

export default Breadcrumb;

const Wrapper = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
`;

const Chevron = styled.span`
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
`;

const BreadItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: ${({ $isLast }) => ($isLast ? "600" : "500")};
  color: ${({ $isLast }) => ($isLast ? "var(--color-primary)" : "var(--color-text-muted)")};
  cursor: ${({ $isLast }) => ($isLast ? "default" : "pointer")};
  border-radius: 6px;
  transition: all var(--transition-fast);
  padding: 2px 4px;
  
  &:hover {
    background: ${({ $isLast }) => ($isLast ? "transparent" : "var(--color-primary-50)")};
    color: ${({ $isLast }) => ($isLast ? "var(--color-primary)" : "var(--color-primary)")};
  }
`;
