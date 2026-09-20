import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Input, Button, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { PATH_LOGIN, PATH_LANDING } from "../routes/pathname";
import { supabase } from "../../lib/supabaseClients";
import logo from "../../assets/logo.png";
import { BrandTitle } from "../utils/commons_style";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (loading) return;
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      message.success("✅ Password reset successfully! You can now log in.");
      navigate(PATH_LOGIN);
    } catch (err) {
      console.error("Reset password error:", err);
      message.error(err?.message || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        {/* Header */}
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "12px" }}>
            <LogoBadge onClick={() => navigate(PATH_LANDING)} style={{ cursor: "pointer" }} title="Go to Landing Page">
              <img src={logo} alt="logo" className="image-box" />
            </LogoBadge>
            <button
              type="button"
              onClick={() => navigate(PATH_LANDING)}
              style={{
                background: "none",
                border: "none",
                color: "#00a389",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to Home
            </button>
          </div>
          <BrandTitle onClick={() => navigate(PATH_LANDING)} style={{ cursor: "pointer" }}>
            Billing <span className="highlight">Every Thing</span>
          </BrandTitle>
          <Title>Set New Password</Title>
          <SmallText>Please enter your new password below</SmallText>
        </CardHeader>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <StyledPassword placeholder="Enter new password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The passwords do not match!"));
                },
              }),
            ]}
          >
            <StyledPassword placeholder="Confirm new password" size="large" />
          </Form.Item>

          <SubmitBtn htmlType="submit" loading={loading} disabled={loading} block>
            Reset Password →
          </SubmitBtn>
        </Form>

        <Divider>
          <span>Remember your password?</span>
        </Divider>

        <LoginBtn type="button" onClick={() => navigate(PATH_LOGIN)}>
          Back to Sign In
        </LoginBtn>
      </Card>
    </Wrapper>
  );
};

export default ResetPassword;

/* ─── Animations ─── */
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const Wrapper = styled.div`
  width: 100%;
  max-width: 460px;
  animation: ${fadeSlide} 0.4s ease;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-xl, 20px);
  padding: 32px 36px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const LogoBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .image-box {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 8px 0 2px;
`;

const SmallText = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;

const StyledPassword = styled(Input.Password)`
  height: 44px !important;
  border-radius: 10px !important;
  border: 1.5px solid #e2e8f0 !important;
  font-size: 14px !important;

  &:hover {
    border-color: #00a389 !important;
  }

  &.ant-input-affix-wrapper-focused {
    border-color: #01514b !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
  }
`;

const SubmitBtn = styled(Button)`
  height: 48px !important;
  border-radius: 24px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #01514b 0%, #00a389 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.3) !important;
  margin-top: 10px;

  &:hover {
    background: linear-gradient(135deg, #013e39 0%, #008f78 100%) !important;
    box-shadow: 0 6px 20px rgba(1, 81, 75, 0.4) !important;
    transform: translateY(-1px) !important;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 14px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  span {
    font-size: 12px;
    color: #94a3b8;
  }
`;

const LoginBtn = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 21px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e6f7f5;
    border-color: #00a389;
    color: #01514b;
  }
`;
