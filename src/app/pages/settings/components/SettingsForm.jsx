import React, { useEffect } from "react";
import styled from "styled-components";
import { Form, Input, InputNumber, Button, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";

const { Option } = Select;

const CURRENCIES = ["Rs.", "₹", "$", "€", "£", "¥"];

const SettingsForm = ({ settings, loading, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  return (
    <Form form={form} layout="vertical" onFinish={onSave}>
      {/* ── Restaurant Profile ── */}
      <SectionCard>
        <SectionTitle>Restaurant Profile</SectionTitle>
        <TwoCol>
          <Form.Item
            name="restaurant_name"
            label="Restaurant Name"
            rules={[{ required: true, message: "Restaurant name is required" }]}
          >
            <Input placeholder="e.g. Delight Cafe" style={{ height: 32, borderRadius: 8 }} />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency Symbol"
            rules={[{ required: true, message: "Currency is required" }]}
          >
            <Select placeholder="Select currency" style={{ height: 32 }}>
              {CURRENCIES.map((c) => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>
        </TwoCol>
        <Form.Item
          name="address"
          label="Restaurant Address"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Full restaurant address..."
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </SectionCard>

      {/* ── Billing Rates ── */}
      <SectionCard>
        <SectionTitle>Billing & Tax Configuration</SectionTitle>
        <TwoCol>
          <Form.Item
            name="tax_rate"
            label="GST / Tax Rate (%)"
            rules={[{ required: true, message: "Tax rate is required" }]}
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              placeholder="18.00"
              addonAfter="%"
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            name="service_charge_rate"
            label="Service Charge (%)"
            rules={[{ required: true, message: "Service charge is required" }]}
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              placeholder="5.00"
              addonAfter="%"
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Form.Item>
        </TwoCol>
        <InfoNote>
          These rates are applied automatically to every new POS order at checkout.
        </InfoNote>
      </SectionCard>

      <Button
        type="primary"
        htmlType="submit"
        icon={<SaveOutlined />}
        loading={loading}
        style={{ height: 32, fontWeight: 600, borderRadius: 8, marginTop: 4 }}
      >
        Save Settings
      </Button>
    </Form>
  );
};

export default SettingsForm;

/* ─── Styled Components ─── */
const SectionCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 18px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoNote = styled.p`
  font-size: 11px;
  color: var(--color-text-muted);
  margin: -4px 0 0;
  line-height: 1.6;
`;
