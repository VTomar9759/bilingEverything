import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <Tooltip title="Download App">
      <StyledButton
        icon={<DownloadOutlined />}
        onClick={onClick}
        type="primary"
        shape="round"
      >
        Install App
      </StyledButton>
    </Tooltip>
  );
};

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ff6b00;
  border-color: #ff6b00;
  
  &:hover {
    background: #e66000 !important;
    border-color: #e66000 !important;
  }

  @media (max-width: 768px) {
    span:last-child {
      display: none;
    }
  }
`;

export default InstallPWA;
