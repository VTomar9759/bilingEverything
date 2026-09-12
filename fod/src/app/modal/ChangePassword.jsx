import { Modal, Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClients";

const ChangePassword = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { userData } = useSelector((state) => state?.authSlice);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (!userData?.email) {
      message.error("User email not found");
      return;
    }

    try {
      setLoading(true);

      // Verify old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: values.oldPassword,
      });

      if (signInError) {
        message.error("Incorrect old password");
        setLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      message.success("Password changed successfully!");
      form.resetFields();
      onClose?.();
    } catch (error) {
      message.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      closeIcon={<span style={{ fontSize: "20px", cursor: "pointer" }}>×</span>}
    >
      <ModalWapper>
        <HeaderContainer>
          <Title>Change Password</Title>
          <Subtitle>Enter a new password, not less than 8 characters.</Subtitle>
        </HeaderContainer>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <StyledFormItem
            name="oldPassword"
            label="OLD PASSWORD"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input.Password
              placeholder="Enter old password"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "#818b9a" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#818b9a" }} />
                )
              }
            />
          </StyledFormItem>

          <StyledFormItem
            name="newPassword"
            label="PASSWORD"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "#818b9a" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#818b9a" }} />
                )
              }
            />
          </StyledFormItem>

          <StyledFormItem
            name="confirmPassword"
            label="RE-ENTER NEW PASSWORD"
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
                visible ? (
                  <EyeOutlined style={{ color: "#818b9a" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#818b9a" }} />
                )
              }
            />
          </StyledFormItem>

          <SubmitFormItem>
            <SubmitButton type="primary" htmlType="submit" block loading={loading}>
              Update
            </SubmitButton>
          </SubmitFormItem>
        </Form>
      </ModalWapper>
    </Modal>
  );
};

export default ChangePassword;

const ModalWapper = styled.div`
  padding: 30px;
`;
const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-family: Collection/Primary;
  font-weight: 700;
  font-style: Bold;
  font-size: 24px;
  line-height: 120%;
  letter-spacing: 0%;
  text-align: center;
  margin-bottom: 10px;
  color: #000000;
`;

const Subtitle = styled.p`
  font-family: Collection/Primary;
  font-weight: 400;
  font-style: Regular;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  text-align: center;

  color: #666;
`;

const StyledFormItem = styled(Form.Item)`
  .ant-input {
    height: 48px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    padding: 12px 16px;
    font-size: 16px;

    &:focus,
    &:hover {
      box-shadow: none;
    }
  }

  & .ant-form-item-label > label {
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    color: #818b9a;
  }

  & .ant-form-item-explain-error {
    font-size: 14px;
  }
`;

const SubmitFormItem = styled(Form.Item)`
  margin-bottom: 0;
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  border-color: ${({ theme }) => theme.colors.primary};
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary} !important;
    border-color: ${({ theme }) => theme.colors.primary} !important;
    transform: scale(1.02);
  }
  &:active,
  &:focus {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
