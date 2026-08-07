import React from 'react';
import styled from 'styled-components';
import Breadcrumb from './Breadcrumb';

const TabHeader = ({ title, subtitle, breadcrumb }) => {
  return (
    <TitleSection>
      {breadcrumb?.length > 0 && <Breadcrumb items={breadcrumb} />}
      <TitleRow>
        <StyledTitle>{title}</StyledTitle>
      </TitleRow>
      {subtitle && <StyledText>{subtitle}</StyledText>}
    </TitleSection>
  );
};

export default TabHeader;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

const StyledTitle = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.2px;
  color: var(--color-text-primary);
  line-height: 1.35;
`;

const StyledText = styled.p`
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 400;
  margin: 2px 0 0 0;
  line-height: 1.5;
`;
