import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  DownloadOutlined,
  CheckCircleOutlined,
  ShareAltOutlined,
  PlusSquareOutlined,
  EllipsisOutlined,
  MobileOutlined,
  AppleOutlined,
  AndroidOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { Button, Tooltip, Modal, Tabs, Typography } from "antd";

const { Text, Paragraph } = Typography;

const InstallPWA = ({ alwaysShow = false, style, className }) => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Detect platform
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  const isAndroid =
    typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    // Check if prompt was captured globally before component mounted
    if (window.deferredPwaPrompt) {
      setSupportsPWA(true);
      setPromptInstall(window.deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    const handleCustomPromptAvailable = (e) => {
      if (e.detail) {
        setSupportsPWA(true);
        setPromptInstall(e.detail);
      } else if (window.deferredPwaPrompt) {
        setSupportsPWA(true);
        setPromptInstall(window.deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setSupportsPWA(false);
      setPromptInstall(null);
      window.deferredPwaPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-available", handleCustomPromptAvailable);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener(
        "pwa-prompt-available",
        handleCustomPromptAvailable
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onClick = async (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const activePrompt = promptInstall || window.deferredPwaPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choiceResult = await activePrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setSupportsPWA(false);
          setPromptInstall(null);
          window.deferredPwaPrompt = null;
        }
      } catch (err) {
        console.warn("Native PWA prompt error, falling back to guide modal:", err);
        setIsGuideOpen(true);
      }
    } else {
      // Native prompt not available (e.g. iOS Safari, Chrome before prompt event, or in-app browser)
      setIsGuideOpen(true);
    }
  };

  if (isInstalled && alwaysShow) {
    return (
      <Tooltip title="App is installed on this device">
        <StyledButton
          icon={<CheckCircleOutlined />}
          disabled
          style={{
            ...style,
            background: "rgba(34, 197, 94, 0.15)",
            borderColor: "#22c55e",
            color: "#22c55e",
          }}
          className={className}
        >
          App Installed
        </StyledButton>
      </Tooltip>
    );
  }

  if (!supportsPWA && !alwaysShow && !isIOS && !isAndroid) {
    return null;
  }

  const defaultTab = isIOS ? "ios" : isAndroid ? "android" : "desktop";

  return (
    <>
      <Tooltip
        title={
          supportsPWA
            ? "Download & Install Web App"
            : "Click to see installation guide"
        }
      >
        <StyledButton
          icon={<DownloadOutlined />}
          onClick={onClick}
          type="primary"
          style={style}
          className={className}
        >
          Install App
        </StyledButton>
      </Tooltip>

      <Modal
        title={
          <ModalTitle>
            <MobileOutlined style={{ color: "#ff6b00" }} />
            <span>Install App on Your Device</span>
          </ModalTitle>
        }
        open={isGuideOpen}
        onCancel={() => setIsGuideOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsGuideOpen(false)}
            style={{ background: "#ff6b00", borderColor: "#ff6b00" }}
          >
            Got it
          </Button>,
        ]}
        centered
        width={480}
      >
        <Paragraph style={{ color: "#64748b", marginBottom: 16 }}>
          Follow these quick steps to install this app on your home screen for fast access and offline support.
        </Paragraph>

        <Tabs
          defaultActiveKey={defaultTab}
          items={[
            {
              key: "ios",
              label: (
                <span>
                  <AppleOutlined /> iOS (Safari)
                </span>
              ),
              children: (
                <GuideContainer>
                  <StepItem>
                    <StepBadge>1</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Tap the Share Button</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        At the bottom of your Safari browser, tap the{" "}
                        <ShareAltOutlined style={{ color: "#007aff", fontWeight: "bold" }} /> Share icon.
                      </Text>
                    </StepContent>
                  </StepItem>

                  <StepItem>
                    <StepBadge>2</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Add to Home Screen</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Scroll down the menu and tap{" "}
                        <Text strong style={{ color: "#1e293b" }}>
                          "Add to Home Screen" <PlusSquareOutlined />
                        </Text>
                      </Text>
                    </StepContent>
                  </StepItem>

                  <StepItem>
                    <StepBadge>3</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Confirm Installation</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Tap <Text strong style={{ color: "#ff6b00" }}>"Add"</Text> in the top-right corner to place the app on your screen.
                      </Text>
                    </StepContent>
                  </StepItem>
                </GuideContainer>
              ),
            },
            {
              key: "android",
              label: (
                <span>
                  <AndroidOutlined /> Android (Chrome)
                </span>
              ),
              children: (
                <GuideContainer>
                  <StepItem>
                    <StepBadge>1</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Open Browser Menu</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Tap the three dots menu <EllipsisOutlined style={{ fontWeight: "bold" }} /> in the top-right corner of Chrome.
                      </Text>
                    </StepContent>
                  </StepItem>

                  <StepItem>
                    <StepBadge>2</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Select Install App</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Tap <Text strong style={{ color: "#1e293b" }}>"Install app"</Text> or <Text strong style={{ color: "#1e293b" }}>"Add to Home screen"</Text>.
                      </Text>
                    </StepContent>
                  </StepItem>

                  <StepItem>
                    <StepBadge>3</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Confirm Prompt</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Tap <Text strong style={{ color: "#ff6b00" }}>"Install"</Text> on the confirmation popup.
                      </Text>
                    </StepContent>
                  </StepItem>
                </GuideContainer>
              ),
            },
            {
              key: "desktop",
              label: (
                <span>
                  <DesktopOutlined /> Desktop
                </span>
              ),
              children: (
                <GuideContainer>
                  <StepItem>
                    <StepBadge>1</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Look at Address Bar</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Click the Install icon <DownloadOutlined style={{ color: "#ff6b00" }} /> on the right side of the browser URL bar.
                      </Text>
                    </StepContent>
                  </StepItem>

                  <StepItem>
                    <StepBadge>2</StepBadge>
                    <StepContent>
                      <Text strong style={{ color: "#1e293b" }}>Or Use Browser Menu</Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        Click menu (⋮) → <Text strong style={{ color: "#1e293b" }}>Save and share</Text> → <Text strong style={{ color: "#1e293b" }}>Install page as app</Text>.
                      </Text>
                    </StepContent>
                  </StepItem>
                </GuideContainer>
              ),
            },
          ]}
        />
      </Modal>
    </>
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
  color: #fff !important;

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

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
`;

const GuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const StepBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff6b00;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export default InstallPWA;
