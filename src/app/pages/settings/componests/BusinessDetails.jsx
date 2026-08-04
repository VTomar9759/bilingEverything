import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ShopOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  SafetyOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  NumberOutlined,
  AuditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../../../../lib/supabaseClients";
import { udpateProfile } from "../../../store/slices/authSlices";

const { Option } = Select;

const BusinessDetails = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { org_id, userData } = useSelector((state) => state.authSlice);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        business_name: userData?.business_name || "",
        legal_name: userData?.legal_name || "",
        full_name: userData?.full_name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        website: userData?.website || "",
        gst_number: userData?.gst_number || "",
        fssai_number: userData?.fssai_number || "",
        pan_number: userData?.pan_number || "",
        cin_number: userData?.cin_number || "",
        address: userData?.address || "",
        city: userData?.city || "",
        state: userData?.state || "",
        pincode: userData?.pincode || "",
        currency: userData?.currency ?? "₹",
        tax_rate: userData?.tax_rate ?? 0,
        service_charge_rate: userData?.service_charge_rate ?? 0,
        invoice_prefix: userData?.invoice_prefix ?? "INV",
        invoice_footer: userData?.invoice_footer || "",
      });
    }
  }, [userData, form]);

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      const updatedData = {
        business_name: values.business_name,
        legal_name: values.legal_name,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        website: values.website,
        logo_image: userData?.logo_image,
        gst_number: values.gst_number,
        fssai_number: values.fssai_number,
        pan_number: values.pan_number,
        cin_number: values.cin_number,
        address: values.address,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        currency: values.currency,
        tax_rate:
          values.tax_rate !== undefined && values.tax_rate !== null
            ? Number(values.tax_rate)
            : 0,
        service_charge_rate:
          values.service_charge_rate !== undefined &&
          values.service_charge_rate !== null
            ? Number(values.service_charge_rate)
            : 0,
        invoice_prefix: values.invoice_prefix,
        invoice_footer: values.invoice_footer,
        is_active: userData?.is_active ?? true,
      };

      const { error } = await supabase
        .from("organization")
        .update(updatedData)
        .eq("id", org_id);

      if (error) throw error;

      dispatch(udpateProfile(updatedData));
      message.success("Business details updated successfully!");
    } catch (err) {
      message.error(err.message || "Failed to update business details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <div>
          <Title>Business & Organization Details</Title>
          <Subtitle>
            Manage your enterprise information, contact details, tax compliance numbers, billing defaults, and receipt preferences.
          </Subtitle>
        </div>
      </SectionHeader>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Section 1: General Business Identity & Contact */}
        <SubSectionTitle>
          <IdcardOutlined style={{ color: "var(--color-primary, #01514b)" }} />
          General Identity & Contact
        </SubSectionTitle>
        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <FormItem
              name="business_name"
              label="Business / Store Name"
              rules={[
                { required: true, message: "Please enter your business name" },
              ]}
            >
              <Input
                prefix={
                  <ShopOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. Gourmet Bistro"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="legal_name" label="Legal Entity Name">
              <Input
                prefix={
                  <FileTextOutlined
                    style={{ color: "var(--color-text-muted)" }}
                  />
                }
                placeholder="e.g. Gourmet Hospitality Pvt Ltd"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="full_name" label="Owner / Primary Contact Name">
              <Input
                prefix={
                  <UserOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. John Doe"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="email" label="Business Email Address">
              <Input
                prefix={
                  <MailOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. contact@gourmetbistro.com"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="phone" label="Contact Phone Number">
              <Input
                prefix={
                  <PhoneOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. +91 9876543210"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="website" label="Website / Online Store URL">
              <Input
                prefix={
                  <GlobalOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. https://www.gourmetbistro.com"
              />
            </FormItem>
          </Col>
        </Row>

        <StyledDivider />

        {/* Section 2: Tax & Registrations */}
        <SubSectionTitle>
          <SafetyOutlined style={{ color: "var(--color-primary, #01514b)" }} />
          Tax & Registrations
        </SubSectionTitle>
        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <FormItem
              name="gst_number"
              label="GST / Tax Identification No. (GSTIN)"
            >
              <Input
                prefix={
                  <AuditOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. 22AAAAA0000A1Z5"
                style={{ textTransform: "uppercase" }}
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="fssai_number" label="FSSAI / Food License Number">
              <Input
                prefix={
                  <SafetyOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. 10020022000123"
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="pan_number" label="PAN Number">
              <Input
                prefix={
                  <NumberOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. ABCDE1234F"
                style={{ textTransform: "uppercase" }}
              />
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem name="cin_number" label="CIN / Corporate Identification No.">
              <Input
                prefix={
                  <IdcardOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. U12345MH2023PTC123456"
                style={{ textTransform: "uppercase" }}
              />
            </FormItem>
          </Col>
        </Row>

        <StyledDivider />

        {/* Section 3: Location & Address */}
        <SubSectionTitle>
          <EnvironmentOutlined
            style={{ color: "var(--color-primary, #01514b)" }}
          />
          Location & Address
        </SubSectionTitle>
        <Row gutter={[12, 8]}>
          <Col xs={24}>
            <FormItem name="address" label="Street Address">
              <Input.TextArea
                placeholder="Full physical store address..."
                rows={2}
              />
            </FormItem>
          </Col>
          <Col xs={24} md={8}>
            <FormItem name="city" label="City">
              <Input placeholder="City Name" />
            </FormItem>
          </Col>
          <Col xs={24} md={8}>
            <FormItem name="state" label="State / Province">
              <Input placeholder="State" />
            </FormItem>
          </Col>
          <Col xs={24} md={8}>
            <FormItem name="pincode" label="Pincode / Zip Code">
              <Input placeholder="Pincode" />
            </FormItem>
          </Col>
        </Row>

        <StyledDivider />

        {/* Section 4: Billing, Rates & Invoice Customization */}
        <SubSectionTitle>
          <SettingOutlined
            style={{ color: "var(--color-primary, #01514b)" }}
          />
          Billing, Tax & Invoice Settings
        </SubSectionTitle>
        <Row gutter={[12, 8]}>
          <Col xs={24} md={6}>
            <FormItem name="currency" label="Currency Symbol">
              <Select
                showSearch
                placeholder="Select Currency"
                optionFilterProp="children"
              >
                <Option value="₹">₹ (INR - Indian Rupee)</Option>
                <Option value="$">$ (USD - US Dollar)</Option>
                <Option value="€">€ (EUR - Euro)</Option>
                <Option value="£">£ (GBP - British Pound)</Option>
                <Option value="AED">AED (UAE Dirham)</Option>
                <Option value="SAR">SAR (Saudi Riyal)</Option>
                <Option value="CA$">CA$ (CAD - Canadian Dollar)</Option>
                <Option value="A$">A$ (AUD - Australian Dollar)</Option>
                <Option value="S$">S$ (SGD - Singapore Dollar)</Option>
                <Option value="¥">¥ (JPY - Japanese Yen)</Option>
              </Select>
            </FormItem>
          </Col>

          <Col xs={24} md={6}>
            <FormItem name="invoice_prefix" label="Invoice Prefix">
              <Input
                prefix={
                  <FileTextOutlined style={{ color: "var(--color-text-muted)" }} />
                }
                placeholder="e.g. INV"
              />
            </FormItem>
          </Col>

          <Col xs={24} md={6}>
            <FormItem name="tax_rate" label="Default Tax Rate (%)">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                step={0.01}
                precision={2}
                placeholder="0.00"
                addonAfter="%"
              />
            </FormItem>
          </Col>

          <Col xs={24} md={6}>
            <FormItem name="service_charge_rate" label="Service Charge (%)">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                step={0.01}
                precision={2}
                placeholder="0.00"
                addonAfter="%"
              />
            </FormItem>
          </Col>

          <Col xs={24}>
            <FormItem
              name="invoice_footer"
              label="Receipt Footer Note / Terms & Conditions"
            >
              <Input.TextArea
                placeholder="e.g. Thank you for dining with us! Returns valid within 7 days with bill."
                rows={2}
              />
            </FormItem>
          </Col>
        </Row>

        <ActionRow>
          <SubmitButton type="primary" htmlType="submit" loading={loading}>
            Save Business Profile
          </SubmitButton>
        </ActionRow>
      </Form>
    </SectionContainer>
  );
};

export default BusinessDetails;

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

const SubSectionTitle = styled.h3`
  margin: 10px 0 6px 0;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary, #1e293b);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StyledDivider = styled(Divider)`
  margin: 12px 0 !important;
  border-block-start-color: var(--color-border, #e5e7eb) !important;
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 6px;

  .ant-form-item-label {
    padding-bottom: 2px;
  }

  .ant-form-item-label > label {
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--color-text-secondary, #475569);
  }

  .ant-input,
  .ant-input-affix-wrapper,
  textarea.ant-input,
  .ant-select-selector,
  .ant-input-number {
    border-radius: 8px;
    font-size: 13px;
  }
  .ant-input:not(textarea),
  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector,
  .ant-input-number {
    height: 35px;
  }

  .ant-select-single .ant-select-selector {
    display: flex;
    align-items: center;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border, #e5e7eb);
`;

const SubmitButton = styled(Button)`
  height: 35px;
  padding: 0 22px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  background-color: var(--color-primary, #01514b);
  border-color: var(--color-primary, #01514b);
  box-shadow: 0 3px 10px rgba(1, 81, 75, 0.18);

  &:hover {
    background-color: var(--color-primary, #01514b) !important;
    border-color: var(--color-primary, #01514b) !important;
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;
