import React from "react";
import styled, { keyframes } from "styled-components";
import { message, Skeleton } from "antd";
import {
  SettingOutlined,
  ShopOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useSettings from "../../hooks/useSettings";
import SettingsForm from "./components/SettingsForm";

const SettingsPanel = () => {
  const { settings, loading, saveSettings } = useSettings();

  const handleSave = async (values) => {
    try {
      await saveSettings(values);
      message.success("Settings saved successfully!");
    } catch {
      message.error("Failed to save settings.");
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <TabHeader
        breadcrumb={["Dashboard", "Settings"]}
        title="Restaurant Settings"
        subtitle="Manage your restaurant profile, tax rates, and billing configuration."
      />

      {/* Quick-stat chips */}
      <StatsRow>
        <StatChip>
          <ShopOutlined />
          <span>{settings.restaurant_name || "—"}</span>
        </StatChip>
        <StatChip>
          <PercentageOutlined />
          <span>GST {settings.tax_rate ?? "—"}%</span>
        </StatChip>
        <StatChip>
          <PercentageOutlined />
          <span>Service {settings.service_charge_rate ?? "—"}%</span>
        </StatChip>
        <StatChip>
          <SettingOutlined />
          <span>Currency: {settings.currency || "—"}</span>
        </StatChip>
      </StatsRow>

      {/* Form or skeleton */}
      {loading && !Object.keys(settings).length ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <SettingsForm
          settings={settings}
          loading={loading}
          onSave={handleSave}
        />
      )}
    </PageWrapper>
  );
};

export default SettingsPanel;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  animation: ${fadeIn} 0.3s ease;
`;

const StatChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5.5px 11px;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-xs);

  .anticon {
    color: var(--color-primary);
    font-size: 13px;
  }
`;
