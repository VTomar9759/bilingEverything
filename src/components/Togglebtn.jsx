import { useState } from "react";
import styled from "styled-components";
import { STATUS_BADGE_STYLES } from "../app/utils/constant";

const getStatus = (status) => {
  return STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.OPEN;
};

const RedToggle = ({ onChange, record }) => {
  const [internalChecked, setInternalChecked] = useState(record.active);
  const handleToggle = () => {
    const newChecked = !internalChecked;
    setInternalChecked(newChecked);
    onChange && onChange(newChecked);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <StatusBadge color={getStatus(record.status).color}>
        {getStatus(record.status).value}
      </StatusBadge>
      <ToggleSwitch 
        $active={internalChecked} 
        onClick={handleToggle}
        {...(internalChecked && { 'data-active': 'true' })}
      >
        <ToggleThumb 
          $active={internalChecked}
          {...(internalChecked && { 'data-active': 'true' })}
        />
      </ToggleSwitch>
    </div>
  );
};

export default RedToggle;
const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-style: Medium;
  font-size: 12px;
  line-height: 140%;
  letter-spacing: 0%;
  background: ${({ color }) => color + "19"};
  color: ${({ color }) => color};
`;

const ToggleSwitch = styled.div`
  width: 60px;
  height: 28px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : "#d9d9d9"};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 2px;
`;

const ToggleThumb = styled.div`
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;

  transform: ${({ $active }) => ($active ? "translateX(32px)" : "translateX(0)")};

  transition: transform 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;
