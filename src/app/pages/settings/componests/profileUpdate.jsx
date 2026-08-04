import React from "react";
import styled from "styled-components";
import LogoUpdate from "./logoUpdate";

const ProfileUpdate = () => {
  return (
    <SectionContainer>
      <SectionHeader>
        <div>
          <Title>Organization Logo</Title>
          <Subtitle>
            Upload and manage your official business logo for customer invoices, receipts, and order slips.
          </Subtitle>
        </div>
      </SectionHeader>

      <LogoUpdate />
    </SectionContainer>
  );
};

export default ProfileUpdate;

/* ─── Styled Components ─── */

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--color-border, #e5e7eb);
`;

const Title = styled.h2`
  margin: 0 0 2px 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-muted, #6b7280);
`;
