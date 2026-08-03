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
  gap:4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap:5px;
`;

const StyledTitle = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  line-height: 1.2;
`;

const StyledText = styled.p`
  color: var(--color-text-muted);
  font-size: 10.5px;
  font-weight: 400;
  margin: 0;
  line-height: 1.5;
`;
