import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const InstallPWA = ({ alwaysShow = false, style, className }) => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setSupportsPWA(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (isInstalled && alwaysShow) {
    return (
      <Tooltip title="App is installed on this device">
        <StyledButton
          icon={<CheckCircleOutlined />}
          disabled
          style={{ ...style, background: 'rgba(34, 197, 94, 0.15)', borderColor: '#22c55e', color: '#22c55e' }}
          className={className}
        >
          App Installed
        </StyledButton>
      </Tooltip>
    );
  }

  if (!supportsPWA && !alwaysShow) {
    return null;
  }

  return (
    <Tooltip title={supportsPWA ? "Download & Install Web App" : "App is running in web mode"}>
      <StyledButton
        icon={<DownloadOutlined />}
        onClick={onClick}
        type="primary"
        disabled={!supportsPWA}
        style={style}
        className={className}
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
  border-radius: 8px;
  font-weight: 500;
  color: #fff !important;;
  
  &:hover:not(:disabled) {
    background: #e66000 !important;
    border-color: #e66000 !important;
  }

  @media (max-width: 768px) {
    span:last-child {
      display: inline-block;
    }
  }
`;

export default InstallPWA;

