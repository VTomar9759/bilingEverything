import React, { useState } from "react";
import styled from "styled-components";
import { Form, Input, Button, message, Row, Col } from "antd";
import {
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import useOrgData from "../../../hooks/useOrgData";
import { supabase } from "../../../../lib/supabaseClients";

const ChangePassword = () => {
  const [form] = Form.useForm();
  const { userData, permission } = useOrgData();
  const settingsPerm = permission?.settings;
  const canUpdate = settingsPerm?.update ?? false;
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    if (!canUpdate) {
      message.error("You do not have permission to change password.");
      return;
    }
    if (!userData?.email) {
      message.error("User email not found in session");
      return;
    }

    try {
      setLoading(true);

      // Verify old password by signing in with current credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: values.oldPassword,
      });

      if (signInError) {
        message.error("Current password entered is incorrect.");
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) throw updateError;

      message.success("Your password has been successfully updated!");
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <div>
          <Title>Change Password</Title>
          <Subtitle>Ensure your account stays secure by using a strong, unique password.</Subtitle>
        </div>
      </SectionHeader>

      <Row gutter={[16, 12]}>
        <Col xs={24} md={14} lg={15}>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <FormItem
              name="oldPassword"
              label="Current Password"
              rules={[{ required: true, message: "Please enter your current password" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--color-text-muted)" }} />}
                placeholder="Enter current password"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </FormItem>

            <FormItem
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 8, message: "Password must be at least 8 characters long" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--color-text-muted)" }} />}
                placeholder="Enter new password (min. 8 chars)"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </FormItem>

            <FormItem
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
                    return Promise.reject(new Error("The two passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "var(--color-text-muted)" }} />}
                placeholder="Re-enter new password"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </FormItem>

            {canUpdate && (
              <ActionRow>
                <SubmitButton type="primary" htmlType="submit" loading={loading}>
                  Update Security Password
                </SubmitButton>
              </ActionRow>
            )}
          </Form>
        </Col>

        <Col xs={24} md={10} lg={9}>
          <TipsCard>
            <TipsTitle>
              <SafetyCertificateOutlined style={{ color: "var(--color-primary, #01514b)" }} />
              Password Recommendations
            </TipsTitle>
            <TipsList>
              <TipItem>
                <CheckCircleOutlined style={{ color: "#10b981", marginTop: 2 }} />
                <span>At least 8 characters long (12+ recommended).</span>
              </TipItem>
              <TipItem>
                <CheckCircleOutlined style={{ color: "#10b981", marginTop: 2 }} />
                <span>Combine uppercase and lowercase letters.</span>
              </TipItem>
              <TipItem>
                <CheckCircleOutlined style={{ color: "#10b981", marginTop: 2 }} />
                <span>Include at least one number and special symbol (@, #, $).</span>
              </TipItem>
              <TipItem>
                <CheckCircleOutlined style={{ color: "#10b981", marginTop: 2 }} />
                <span>Avoid using common words or personal details like birthdays.</span>
              </TipItem>
            </TipsList>
          </TipsCard>
        </Col>
      </Row>
    </SectionContainer>
  );
};

export default ChangePassword;

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

const FormItem = styled(Form.Item)`
  margin-bottom: 8px;

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

  .ant-input-affix-wrapper {
    height: 35px;
    border-radius: 8px;
    font-size: 13px;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-start;
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

const TipsCard = styled.div`
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TipsTitle = styled.h4`
  margin: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary, #1e293b);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TipsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TipItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11.5px;
  line-height: 1.35;
  color: var(--color-text-secondary, #475569);
`;
