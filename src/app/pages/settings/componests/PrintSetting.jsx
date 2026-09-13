import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Slider,
  Button,
  message,
  Row,
  Col,
  Spin,
} from "antd";
import {
  PrinterOutlined,
  PictureOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  DollarOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  EyeOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import useOrgData from "../../../hooks/useOrgData";
import {
  fetchPrintSettings,
  updatePrintSettings,
  setPrintSettingsLocal,
  selectPrintSettings,
  selectPrintSettingsLoading,
  selectPrintSettingsSaving,
} from "../../../store/slices/printSettingSlice";
import { DEFAULT_PRINT_SETTINGS } from "../../../../services/printSettingsService";

const { Option } = Select;
const { TextArea } = Input;

const PRINT_SIZE_OPTIONS = [
  { label: "A4 (Standard Sheet)", value: "A4" },
  { label: "Modern (80mm Thermal)", value: "Modern" },
  { label: "3 Inch A (80mm)", value: "3 Inch A" },
  { label: "3 Inch B (80mm)", value: "3 Inch B" },
  { label: "2 Inch A (58mm)", value: "2 Inch A" },
  { label: "2 Inch B (58mm)", value: "2 Inch B" },
];

const PrintSetting = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { org_id, userData, permission } = useOrgData();
  const settingsPerm = permission?.settings;
  const canUpdate = settingsPerm?.update ?? true;

  const printSettings = useSelector(selectPrintSettings);
  const loading = useSelector(selectPrintSettingsLoading);
  const saving = useSelector(selectPrintSettingsSaving);

  const [formValues, setFormValues] = useState(DEFAULT_PRINT_SETTINGS);

  useEffect(() => {
    if (org_id) {
      dispatch(fetchPrintSettings(org_id));
    }
  }, [org_id, dispatch]);

  // Sync Redux settings to form when loaded
  useEffect(() => {
    if (printSettings) {
      const merged = { ...DEFAULT_PRINT_SETTINGS, ...printSettings };
      form.setFieldsValue(merged);
      setFormValues(merged);
    }
  }, [printSettings, form]);

  const handleValuesChange = (_, allValues) => {
    setFormValues((prev) => ({ ...prev, ...allValues }));
    // Keep Redux in sync for live preview elsewhere
    dispatch(setPrintSettingsLocal(allValues));
  };

  const handleFinish = async (values) => {
    if (!canUpdate) {
      message.error("You do not have permission to update print settings.");
      return;
    }
    try {
      await dispatch(
        updatePrintSettings({
          orgId: org_id,
          settingsData: values,
          createdBy: userData?.id || org_id,
        })
      ).unwrap();
      message.success("Print settings saved successfully!");
    } catch (err) {
      console.error("Save print settings error:", err);
      message.error(err || "Failed to save print settings");
    }
  };

  const handleResetDefaults = () => {
    form.setFieldsValue(DEFAULT_PRINT_SETTINGS);
    setFormValues(DEFAULT_PRINT_SETTINGS);
    dispatch(setPrintSettingsLocal(DEFAULT_PRINT_SETTINGS));
    message.info("Form reset to default values. Click Save to apply.");
  };

  const isThermal = formValues.print_size !== "A4";
  const currency = userData?.currency || "₹";

  return (
    <SectionContainer>
      <SectionHeader>
        <HeaderInfo>
          <TitleRow>
            <Title>Print & Receipt Settings</Title>
            <StatusBadge $active={formValues.is_active}>
              <CheckCircleFilled />
              {formValues.is_active ? "Print System Active" : "Print Disabled"}
            </StatusBadge>
          </TitleRow>
          <Subtitle>
            Configure paper formats, receipt header & footer visibility, line-item columns, billing totals, and printer defaults.
          </Subtitle>
        </HeaderInfo>
        <HeaderActions>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetDefaults}
            disabled={loading || saving}
            size="middle"
          >
            Defaults
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={saving}
            disabled={loading || !canUpdate}
            style={{
              background: "var(--color-primary, #01514b)",
              borderColor: "var(--color-primary, #01514b)",
            }}
          >
            Save Settings
          </Button>
        </HeaderActions>
      </SectionHeader>

      {loading ? (
        <LoadingWrap>
          <Spin size="large" tip="Loading print settings..." />
        </LoadingWrap>
      ) : (
        <ContentLayout>
          {/* Main Form Settings Column */}
          <FormColumn>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              onValuesChange={handleValuesChange}
              initialValues={DEFAULT_PRINT_SETTINGS}
            >
              {/* Group 1: General & Hardware Setup */}
              <SettingsGroupCard>
                <GroupTitle>
                  <ControlOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  General & Hardware Configuration
                </GroupTitle>
                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="print_size"
                      label="Print Paper Size / Template"
                      rules={[{ required: true, message: "Please select print size" }]}
                    >
                      <Select placeholder="Select paper size">
                        {PRINT_SIZE_OPTIONS.map((opt) => (
                          <Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="printer_name"
                      label="Target Printer Name (QZ Tray / Direct)"
                      tooltip="Optional: Specify local thermal printer name e.g. EPSON TM-T82, POS-80"
                    >
                      <Input
                        prefix={<PrinterOutlined style={{ color: "var(--color-text-muted)" }} />}
                        placeholder="e.g. EPSON TM-T82 or POS-80"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="number_of_copies"
                      label="Number of Copies (1 - 5)"
                      rules={[
                        { required: true, message: "Please enter copy count" },
                        { type: "number", min: 1, max: 5, message: "Must be between 1 and 5" },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={5}
                        style={{ width: "100%" }}
                        placeholder="1"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Multiple Copies Printing</SwitchLabel>
                        <SwitchDesc>Print extra copy for kitchen / records</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="copy_print" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Auto Print on Billing</SwitchLabel>
                        <SwitchDesc>Trigger print automatically on order complete</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="auto_print" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Enable Print Service</SwitchLabel>
                        <SwitchDesc>Master toggle to enable or disable printing</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="is_active" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 2: Header & Branding Visibility */}
              <SettingsGroupCard>
                <GroupTitle>
                  <PictureOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Header & Business Identity
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Show Business Logo</SwitchLabel>
                        <SwitchDesc>Include logo graphic at top of receipt</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="logo_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="logo_size"
                      label={`Logo Size (20px - 300px): ${formValues.logo_size || 80}px`}
                    >
                      <Slider min={20} max={300} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Business Name</SwitchLabel>
                        <SwitchDesc>Show brand name</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="business_name_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Store Address</SwitchLabel>
                        <SwitchDesc>Physical location</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="address_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Phone Number</SwitchLabel>
                        <SwitchDesc>Store contact #</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="phone_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Email Address</SwitchLabel>
                        <SwitchDesc>Support email</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="email_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>GST / Tax ID Number</SwitchLabel>
                        <SwitchDesc>Show GSTIN in header</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="gst_number_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 3: Invoice & Order Metadata */}
              <SettingsGroupCard>
                <GroupTitle>
                  <FileTextOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Invoice & Order Metadata
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Invoice Number</SwitchLabel>
                        <SwitchDesc>e.g. INV-10023</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="invoice_number_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Invoice Date</SwitchLabel>
                        <SwitchDesc>Date & time</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="invoice_date_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Order Number</SwitchLabel>
                        <SwitchDesc>e.g. #ORD-501</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="order_number_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Table / Area Name</SwitchLabel>
                        <SwitchDesc>e.g. Table T-04</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="table_name_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 4: Customer Details */}
              <SettingsGroupCard>
                <GroupTitle>
                  <UserOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Customer Information
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Customer Name</SwitchLabel>
                        <SwitchDesc>Client name</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="customer_name_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Customer Phone</SwitchLabel>
                        <SwitchDesc>Mobile number</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="customer_phone_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Customer Address</SwitchLabel>
                        <SwitchDesc>Delivery address</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="customer_address_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 5: Line Item Columns Visibility */}
              <SettingsGroupCard>
                <GroupTitle>
                  <ShoppingOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Item Table Columns
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={12} md={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Item Code / SKU</SwitchLabel>
                        <SwitchDesc>Product code</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="item_code_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Item Description</SwitchLabel>
                        <SwitchDesc>Notes / Modifiers</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="item_description_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Quantity Column</SwitchLabel>
                        <SwitchDesc>Item qty count</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="item_quantity_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Unit Rate / Price</SwitchLabel>
                        <SwitchDesc>Single item unit rate</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="item_rate_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={12}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Item Discount</SwitchLabel>
                        <SwitchDesc>Per-item discount deduction</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="item_discount_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 6: Billing & Totals Summary */}
              <SettingsGroupCard>
                <GroupTitle>
                  <DollarOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Billing Totals & Payment Info
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Subtotal</SwitchLabel>
                        <SwitchDesc>Net items sum</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="subtotal_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Overall Discount</SwitchLabel>
                        <SwitchDesc>Bill-level discount</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="discount_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Tax / GST Total</SwitchLabel>
                        <SwitchDesc>Total tax amount</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="tax_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>GST Breakup</SwitchLabel>
                        <SwitchDesc>CGST & SGST lines</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="gst_breakup_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Service Charge</SwitchLabel>
                        <SwitchDesc>Service fee line</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="service_charge_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Grand Total</SwitchLabel>
                        <SwitchDesc>Final payable sum</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="grand_total_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Payment Method</SwitchLabel>
                        <SwitchDesc>Cash / Card / UPI</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="payment_method_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Payment Status</SwitchLabel>
                        <SwitchDesc>Paid / Unpaid tag</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="payment_status_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Group 7: Footer, QR & Barcode */}
              <SettingsGroupCard>
                <GroupTitle>
                  <QrcodeOutlined style={{ color: "var(--color-primary, #01514b)" }} />
                  Footer, QR Code & Barcode
                </GroupTitle>

                <Row gutter={[16, 12]}>
                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Show Footer Note</SwitchLabel>
                        <SwitchDesc>Bottom custom message</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="footer_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Payment QR Code</SwitchLabel>
                        <SwitchDesc>UPI / Payment scan</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="qr_code_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24} sm={8}>
                    <SwitchCardItem>
                      <SwitchInfo>
                        <SwitchLabel>Order Barcode</SwitchLabel>
                        <SwitchDesc>Scannable 1D barcode</SwitchDesc>
                      </SwitchInfo>
                      <Form.Item name="barcode_visible" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </SwitchCardItem>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="footer_text"
                      label="Custom Footer Note / Message"
                    >
                      <TextArea
                        rows={2}
                        placeholder="e.g. Thank you for dining with us! Please visit again."
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </SettingsGroupCard>

              {/* Bottom Sticky Action Bar */}
              <BottomActionBar>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                  disabled={loading || !canUpdate}
                  size="large"
                  style={{
                    background: "var(--color-primary, #01514b)",
                    borderColor: "var(--color-primary, #01514b)",
                    minWidth: 160,
                  }}
                >
                  Save Print Settings
                </Button>
              </BottomActionBar>
            </Form>
          </FormColumn>

          {/* Live Interactive Receipt Preview Column */}
          <PreviewColumn>
            <PreviewStickyWrap>
              <PreviewCardHeader>
                <PreviewTitle>
                  <EyeOutlined /> Live Receipt Preview
                </PreviewTitle>
                <FormatTag>{formValues.print_size || "Modern"}</FormatTag>
              </PreviewCardHeader>

              <ReceiptPaper $isThermal={isThermal}>
                {/* Header Logo & Info */}
                {formValues.logo_visible && (
                  <ReceiptLogoWrap>
                    {userData?.logo_image ? (
                      <img
                        src={userData.logo_image}
                        alt="Logo"
                        style={{
                          maxHeight: `${Math.min(formValues.logo_size || 80, 100)}px`,
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <LogoMockWrap style={{ height: `${Math.min(formValues.logo_size || 80, 80)}px` }}>
                        <PictureOutlined /> LOGO
                      </LogoMockWrap>
                    )}
                  </ReceiptLogoWrap>
                )}

                {formValues.business_name_visible && (
                  <ReceiptBusinessName>
                    {userData?.business_name || "TEST HUB"}
                  </ReceiptBusinessName>
                )}

                {formValues.address_visible && (
                  <ReceiptText>
                    {userData?.address || "Sector 117 / Sector 118 (TDI City / Park Stree"}
                  </ReceiptText>
                )}

                {formValues.phone_visible && (
                  <ReceiptText>Phone: {userData?.phone || "+919759585552"}</ReceiptText>
                )}

                {formValues.email_visible && (
                  <ReceiptText>Email: {userData?.email || "info@testhub.com"}</ReceiptText>
                )}

                {formValues.gst_number_visible && (
                  <ReceiptText $bold>
                    GSTIN: {userData?.gst_number || "324SH335SA"}
                  </ReceiptText>
                )}

                <ReceiptDivider />

                {/* Metadata */}
                <ReceiptMetaGrid>
                  {formValues.invoice_number_visible && (
                    <div>
                      <strong>Invoice:</strong> {userData?.invoice_prefix || "INV"}-2026-0042
                    </div>
                  )}
                  {formValues.order_number_visible && (
                    <div>
                      <strong>Order:</strong> #ORD-108
                    </div>
                  )}
                  {formValues.invoice_date_visible && (
                    <div>
                      <strong>Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {formValues.table_name_visible && (
                    <div>
                      <strong>Table:</strong> T-04 (Dine-in)
                    </div>
                  )}
                </ReceiptMetaGrid>

                {/* Customer info */}
                {(formValues.customer_name_visible ||
                  formValues.customer_phone_visible ||
                  formValues.customer_address_visible) && (
                  <>
                    <ReceiptDivider />
                    <ReceiptMetaGrid>
                      {formValues.customer_name_visible && (
                        <div>
                          <strong>Customer:</strong> John Doe
                        </div>
                      )}
                      {formValues.customer_phone_visible && (
                        <div>
                          <strong>Contact:</strong> +91 98111 22233
                        </div>
                      )}
                      {formValues.customer_address_visible && (
                        <div>
                          <strong>Address:</strong> Suite 402, Green Avenue
                        </div>
                      )}
                    </ReceiptMetaGrid>
                  </>
                )}

                <ReceiptDivider />

                {/* Item Table */}
                <ReceiptTable>
                  <thead>
                    <tr>
                      {formValues.item_code_visible && <th style={{ textAlign: "left", width: "18%" }}>SKU</th>}
                      <th style={{ textAlign: "left" }}>Item</th>
                      {formValues.item_quantity_visible && <th style={{ textAlign: "center", width: "12%" }}>Qty</th>}
                      {formValues.item_rate_visible && <th style={{ textAlign: "right", width: "20%" }}>Rate</th>}
                      {formValues.item_discount_visible && <th style={{ textAlign: "right", width: "16%" }}>Disc</th>}
                      <th style={{ textAlign: "right", width: "22%" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {formValues.item_code_visible && <td>BUR-01</td>}
                      <td>
                        Paneer Tikka Burger
                        {formValues.item_description_visible && (
                          <div style={{ fontSize: "9px", color: "#666" }}>Extra Cheese, Crispy</div>
                        )}
                      </td>
                      {formValues.item_quantity_visible && <td style={{ textAlign: "center" }}>2</td>}
                      {formValues.item_rate_visible && <td style={{ textAlign: "right" }}>{currency}180</td>}
                      {formValues.item_discount_visible && <td style={{ textAlign: "right" }}>-</td>}
                      <td style={{ textAlign: "right" }}>{currency}360</td>
                    </tr>
                    <tr>
                      {formValues.item_code_visible && <td>BEV-03</td>}
                      <td>
                        Iced Cappuccino
                        {formValues.item_description_visible && (
                          <div style={{ fontSize: "9px", color: "#666" }}>Less Sugar</div>
                        )}
                      </td>
                      {formValues.item_quantity_visible && <td style={{ textAlign: "center" }}>1</td>}
                      {formValues.item_rate_visible && <td style={{ textAlign: "right" }}>{currency}140</td>}
                      {formValues.item_discount_visible && <td style={{ textAlign: "right" }}>{currency}20</td>}
                      <td style={{ textAlign: "right" }}>{currency}120</td>
                    </tr>
                  </tbody>
                </ReceiptTable>

                <ReceiptDivider />

                {/* Totals */}
                <ReceiptTotalsTable>
                  <tbody>
                    {formValues.subtotal_visible && (
                      <tr>
                        <td>Subtotal</td>
                        <td style={{ textAlign: "right" }}>{currency}480.00</td>
                      </tr>
                    )}
                    {formValues.discount_visible && (
                      <tr>
                        <td>Discount</td>
                        <td style={{ textAlign: "right" }}>-{currency}20.00</td>
                      </tr>
                    )}
                    {formValues.service_charge_visible && (
                      <tr>
                        <td>Service Charge (5%)</td>
                        <td style={{ textAlign: "right" }}>{currency}23.00</td>
                      </tr>
                    )}
                    {formValues.gst_breakup_visible ? (
                      <>
                        <tr>
                          <td>CGST (2.5%)</td>
                          <td style={{ textAlign: "right" }}>{currency}11.50</td>
                        </tr>
                        <tr>
                          <td>SGST (2.5%)</td>
                          <td style={{ textAlign: "right" }}>{currency}11.50</td>
                        </tr>
                      </>
                    ) : (
                      formValues.tax_visible && (
                        <tr>
                          <td>Tax / GST (5%)</td>
                          <td style={{ textAlign: "right" }}>{currency}23.00</td>
                        </tr>
                      )
                    )}
                    {formValues.grand_total_visible && (
                      <GrandTotalRow>
                        <td>GRAND TOTAL</td>
                        <td style={{ textAlign: "right" }}>{currency}503.00</td>
                      </GrandTotalRow>
                    )}
                    {formValues.payment_method_visible && (
                      <tr>
                        <td>Payment Mode</td>
                        <td style={{ textAlign: "right" }}>UPI / GPay</td>
                      </tr>
                    )}
                    {formValues.payment_status_visible && (
                      <tr>
                        <td>Status</td>
                        <td style={{ textAlign: "right", color: "#16a34a", fontWeight: 700 }}>PAID</td>
                      </tr>
                    )}
                  </tbody>
                </ReceiptTotalsTable>

                {/* QR Code Mock */}
                {formValues.qr_code_visible && (
                  <ReceiptQRWrap>
                    <QrcodeOutlined style={{ fontSize: "50px", color: "#1e293b" }} />
                    <span style={{ fontSize: "10px", color: "#475569" }}>Scan to Pay via UPI</span>
                  </ReceiptQRWrap>
                )}

                {/* Barcode Mock */}
                {formValues.barcode_visible && (
                  <ReceiptBarcodeWrap>
                    <BarcodeOutlined style={{ fontSize: "38px", color: "#1e293b" }} />
                    <span style={{ fontSize: "9.5px", letterSpacing: "2px" }}>*INV-2026-0042*</span>
                  </ReceiptBarcodeWrap>
                )}

                {/* Footer Note */}
                {formValues.footer_visible && (
                  <ReceiptFooterText>
                    {formValues.footer_text || "Thank you for dining with us! Please visit again."}
                  </ReceiptFooterText>
                )}
              </ReceiptPaper>
            </PreviewStickyWrap>
          </PreviewColumn>
        </ContentLayout>
      )}
    </SectionContainer>
  );
};

export default PrintSetting;

/* ─── Styled Components ─── */

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--color-border, #e5e7eb);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => (props.$active ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)")};
  color: ${(props) => (props.$active ? "#059669" : "#dc2626")};
  border: 1px solid ${(props) => (props.$active ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)")};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted, #6b7280);
  max-width: 680px;
  line-height: 1.4;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoadingWrap = styled.div`
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SettingsGroupCard = styled.div`
  background: var(--color-bg, #fcfdfd);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary-100, rgba(1, 81, 75, 0.3));
  }
`;

const GroupTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #1e293b);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border, #f1f5f9);
`;

const SwitchCardItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 52px;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--color-primary, #01514b);
    box-shadow: 0 2px 6px rgba(1, 81, 75, 0.05);
  }
`;

const SwitchInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const SwitchLabel = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
`;

const SwitchDesc = styled.span`
  font-size: 10px;
  color: var(--color-text-muted, #64748b);
`;

const BottomActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 0 6px 0;
  border-top: 1px dashed var(--color-border, #e5e7eb);
`;

/* Preview Styles */

const PreviewColumn = styled.div`
  position: relative;
`;

const PreviewStickyWrap = styled.div`
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PreviewCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  padding: 8px 12px;
`;

const PreviewTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary, #1e293b);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormatTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  background: var(--color-primary-50, rgba(1, 81, 75, 0.1));
  color: var(--color-primary, #01514b);
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
`;

const ReceiptPaper = styled.div`
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 16px 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: ${(props) => (props.$isThermal ? "'Courier New', Courier, monospace" : "'Inter', sans-serif")};
  font-size: 11px;
  line-height: 1.35;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ReceiptLogoWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const LogoMockWrap = styled.div`
  width: 100px;
  background: #f1f5f9;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
`;

const ReceiptBusinessName = styled.div`
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  color: #0f172a;
  margin-bottom: 2px;
`;

const ReceiptText = styled.div`
  font-size: 10px;
  text-align: center;
  color: #334155;
  font-weight: ${(props) => (props.$bold ? "700" : "400")};
  margin: 1px 0;
  word-break: break-word;
`;

const ReceiptDivider = styled.div`
  border-top: 1px dashed #64748b;
  margin: 8px 0;
  width: 100%;
`;

const ReceiptMetaGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #334155;
`;

const ReceiptTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin: 4px 0;

  th {
    padding-bottom: 4px;
    font-weight: 700;
    border-bottom: 1px dashed #64748b;
    color: #0f172a;
  }

  td {
    padding: 3px 0;
    color: #1e293b;
    vertical-align: top;
  }
`;

const ReceiptTotalsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;

  td {
    padding: 2px 0;
    color: #1e293b;
  }
`;

const GrandTotalRow = styled.tr`
  font-size: 12px;
  font-weight: 800;
  border-top: 1px dashed #64748b;
  border-bottom: 1px dashed #64748b;

  td {
    padding: 4px 0 !important;
    color: #0f172a;
  }
`;

const ReceiptQRWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 10px 0 4px 0;
  padding: 6px;
  background: #f8fafc;
  border-radius: 6px;
`;

const ReceiptBarcodeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 8px 0 4px 0;
`;

const ReceiptFooterText = styled.div`
  text-align: center;
  font-size: 9.5px;
  font-style: italic;
  color: #475569;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed #94a3b8;
  word-break: break-word;
`;
