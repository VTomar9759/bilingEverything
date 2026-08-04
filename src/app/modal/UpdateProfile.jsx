import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ShopOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../../lib/supabaseClients";
import { udpateProfile } from "../store/slices/authSlices";
import InstallPWA from "../../components/InstallPWA";
import ThemeToggle from "../../components/themeToggle";

const UpdateProfile = ({ open, onClose }) => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [businessForm] = Form.useForm();

  const { org_id, userData } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Avatar / Logo states
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState(null);

  useEffect(() => {
    if (open && userData) {
      profileForm.setFieldsValue({
        full_name: userData?.full_name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
      });

      businessForm.setFieldsValue({
        business_name: userData?.business_name || "",
        legal_name: userData?.legal_name || "",
        gst_number: userData?.gst_number || "",
        fssai_number: userData?.fssai_number || "",
        address: userData?.address || "",
        city: userData?.city || "",
        state: userData?.state || "",
        pincode: userData?.pincode || "",
        invoice_footer: userData?.invoice_footer || "",
      });

      setProfilePreview(userData?.logo_image || null);
      setBusinessLogoPreview(userData?.logo_image || null);
    }
  }, [open, userData, profileForm, businessForm]);

  // Helper for image upload to Supabase
  const uploadImageToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const filePath = `${org_id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("org-logos")
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("org-logos").getPublicUrl(filePath);
    return data?.publicUrl;
  };

  // Submit Profile Form
  const handleProfileSubmit = async (values) => {
    try {
      setLoading(true);
      let logoUrl = userData?.logo_image;

      if (profileFile) {
        logoUrl = await uploadImageToSupabase(profileFile);
      }

      const updatedData = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        logo_image: logoUrl,
      };

      const { error } = await supabase
        .from("organization")
        .update(updatedData)
        .eq("id", org_id);

      if (error) throw error;

      dispatch(udpateProfile(updatedData));
      message.success("Profile updated successfully!");
    } catch (err) {
      message.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change Form
  const handlePasswordSubmit = async (values) => {
    if (!userData?.email) {
      message.error("User email not found");
      return;
    }

    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: values.oldPassword,
      });

      if (signInError) {
        message.error("Incorrect old password");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) throw updateError;

      message.success("Password changed successfully!");
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Submit Business Form
  const handleBusinessSubmit = async (values) => {
    try {
      setLoading(true);
      let logoUrl = userData?.logo_image;

      if (businessLogoFile) {
        logoUrl = await uploadImageToSupabase(businessLogoFile);
      }

      const updatedData = {
        business_name: values.business_name,
        legal_name: values.legal_name,
        gst_number: values.gst_number,
        fssai_number: values.fssai_number,
        address: values.address,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        invoice_footer: values.invoice_footer,
        logo_image: logoUrl,
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

  const handleCancel = () => {
    setProfileFile(null);
    setBusinessLogoFile(null);
    onClose?.();
  };

  const tabItems = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
        >
          <AvatarContainer>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                setProfileFile(file);
                setProfilePreview(URL.createObjectURL(file));
                return false;
              }}
            >
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                <StyledAvatar
                  size={80}
                  src={profilePreview || userData?.logo_image}
                  icon={
                    !(profilePreview || userData?.logo_image) && (
                      <UserOutlined />
                    )
                  }
                />
                <EditIconContainer>
                  <EditOutlined style={{ fontSize: "12px", color: "#666" }} />
                </EditIconContainer>
              </div>
            </Upload>
          </AvatarContainer>

          <StyledFormItem
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input placeholder="Enter your full name" />
          </StyledFormItem>

          <Row gutter={12}>
            <Col span={12}>
              <StyledFormItem name="email" label="Email Address">
                <Input placeholder="Email Address" disabled />
              </StyledFormItem>
            </Col>
            <Col span={12}>
              <StyledFormItem name="phone" label="Phone Number">
                <Input placeholder="Phone Number" />
              </StyledFormItem>
            </Col>
          </Row>

          <SubmitFormItem style={{ marginTop: 16 }}>
            <SubmitButton
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Save Profile
            </SubmitButton>
          </SubmitFormItem>
        </Form>
      ),
    },
    {
      key: "password",
      label: (
        <span>
          <LockOutlined /> Change Password
        </span>
      ),
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <StyledFormItem
            name="oldPassword"
            label="Old Password"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input.Password
              placeholder="Enter old password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </StyledFormItem>

          <StyledFormItem
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </StyledFormItem>

          <StyledFormItem
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Re-enter new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </StyledFormItem>

          <SubmitFormItem style={{ marginTop: 16 }}>
            <SubmitButton
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Update Password
            </SubmitButton>
          </SubmitFormItem>
        </Form>
      ),
    },
    {
      key: "business",
      label: (
        <span>
          <ShopOutlined /> Business
        </span>
      ),
      children: (
        <Form
          form={businessForm}
          layout="vertical"
          onFinish={handleBusinessSubmit}
        >
          <AvatarContainer>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                setBusinessLogoFile(file);
                setBusinessLogoPreview(URL.createObjectURL(file));
                return false;
              }}
            >
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                <StyledAvatar
                  size={72}
                  src={businessLogoPreview || userData?.logo_image}
                  icon={
                    !(businessLogoPreview || userData?.logo_image) && (
                      <ShopOutlined />
                    )
                  }
                />
                <EditIconContainer>
                  <EditOutlined style={{ fontSize: "12px", color: "#666" }} />
                </EditIconContainer>
              </div>
            </Upload>
          </AvatarContainer>

          <Row gutter={12}>
            <Col span={12}>
              <StyledFormItem
                name="business_name"
                label="Business Name"
                rules={[
                  { required: true, message: "Business name is required" },
                ]}
              >
                <Input placeholder="Business Name" />
              </StyledFormItem>
            </Col>
            <Col span={12}>
              <StyledFormItem name="legal_name" label="Legal Name">
                <Input placeholder="Legal Name" />
              </StyledFormItem>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <StyledFormItem name="gst_number" label="GST Number">
                <Input placeholder="GST Number" />
              </StyledFormItem>
            </Col>
            <Col span={12}>
              <StyledFormItem name="fssai_number" label="FSSAI Number">
                <Input placeholder="FSSAI Number" />
              </StyledFormItem>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <StyledFormItem name="city" label="City">
                <Input placeholder="City" />
              </StyledFormItem>
            </Col>
            <Col span={8}>
              <StyledFormItem name="state" label="State">
                <Input placeholder="State" />
              </StyledFormItem>
            </Col>
            <Col span={8}>
              <StyledFormItem name="pincode" label="Pincode">
                <Input placeholder="Pincode" />
              </StyledFormItem>
            </Col>
          </Row>

          <StyledFormItem name="address" label="Address">
            <Input.TextArea placeholder="Full Address" rows={2} />
          </StyledFormItem>

          <StyledFormItem name="invoice_footer" label="Invoice Footer">
            <Input.TextArea
              placeholder="Terms & conditions, notes, etc."
              rows={2}
            />
          </StyledFormItem>

          <SubmitFormItem style={{ marginTop: 16 }}>
            <SubmitButton
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Save Business Details
            </SubmitButton>
          </SubmitFormItem>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={650}
      closeIcon={<span style={{ fontSize: "20px" }}>×</span>}
    >
      <ModalWrapper>
        <TopBar>
          <HeaderTitleWrap>
            <Title>Settings Module</Title>
            <Subtitle>
              Manage Profile, Security & Business Details
            </Subtitle>
          </HeaderTitleWrap>

          <HeaderActions>
            <ThemeToggle showLabel={true} />
            <InstallPWA alwaysShow={true} />
          </HeaderActions>
        </TopBar>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
        />
      </ModalWrapper>
    </Modal>
  );
};

export default UpdateProfile;

const ModalWrapper = styled.div`
  padding: 8px 12px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  flex-wrap: wrap;
`;

const HeaderTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0 0 2px 0;
  font-weight: 700;
  font-size: 18px;
  color: var(--color-text-primary, #111);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted, #666);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
`;

const StyledAvatar = styled(Avatar)`
  background-color: #f0f0f0;
  color: #8c8c8c;
  border: 2px solid #d9d9d9;
  position: relative;
`;

const EditIconContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 12px;
  .ant-input,
  .ant-input-affix-wrapper,
  textarea.ant-input {
    border-radius: 8px;
    font-size: 13px;
  }
  .ant-input:not(textarea) {
    height: 36px;
  }
  & .ant-form-item-label > label {
    font-weight: 500;
    font-size: 11.5px;
    text-transform: uppercase;
    color: #818b9a;
  }
`;

const SubmitFormItem = styled(Form.Item)`
  margin-bottom: 0;
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme?.colors?.primary || "#1890ff"};
  border-color: ${({ theme }) => theme?.colors?.primary || "#1890ff"};
  height: 38px;
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 8px;
  &:hover {
    background-color: ${({ theme }) =>
      theme?.colors?.primary || "#1890ff"} !important;
    border-color: ${({ theme }) =>
      theme?.colors?.primary || "#1890ff"} !important;
    transform: scale(1.005);
  }
`;
