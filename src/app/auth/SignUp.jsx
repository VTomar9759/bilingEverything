import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button, Form, message as antMessage } from "antd";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClients";
import { PATH_LOGIN } from "../routes/pathname";

function SignUp() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAuth = async (values) => {
    const { fullName, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      antMessage.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Save extra user data
      if (data?.user) {
        const { error: insertError } = await supabase.from("users").upsert([
          {
            id: data.user.id,
            fullName,
            email,
            phone:"",
            profile_image:null,
          },
        ]);

        if (insertError) throw insertError;
      }

      antMessage.success("✅ Signup successful! Check your email.");
      navigate(PATH_LOGIN);
    } catch (err) {
      antMessage.error("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <SmallText>Join Us Today</SmallText>
        <Title>Create Your Account</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAuth}
          initialValues={{
            email: "sfs.vikastoamr@yopmail.com",
            password: "Test@12345",
            confirmPassword: "Test@12345",
            fullName: "John Doe",
          }}
        >
          <InputWrapper>
            {/* Full Name */}
            <Form.Item
              name="fullName"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <CustomInputField>
                <InputLabel>Full Name</InputLabel>
                <CustomInput placeholder="John Doe" maxLength={50} />
              </CustomInputField>
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <CustomInputField>
                <InputLabel>Email Address</InputLabel>
                <CustomInput placeholder="example@gmail.com" maxLength={40} />
              </CustomInputField>
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <StyledPassword placeholder="Enter password" />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password" },
              ]}
            >
              <StyledPassword placeholder="Confirm password" />
            </Form.Item>
          </InputWrapper>

          <StyledButton htmlType="submit" loading={loading}>
            Sign Up →
          </StyledButton>
        </Form>
      </Card>
      <LoginText>
        Already have an account?{" "}
        <span onClick={() => navigate(PATH_LOGIN)}>Login</span>
      </LoginText>
    </Wrapper>
  );
}

export default SignUp;

// 🎨 Styled Components (matching Login.jsx)

const Wrapper = styled.div`
  width: 513px;
  border-radius: 16px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
`;

const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SmallText = styled.p`
  font-family: Collection/Primary;
  font-weight: 500;
  font-style: Medium;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.gray};
`;

const Title = styled.h2`
  font-family: Collection/Primary;
  font-weight: 700;
  font-style: Bold;
  font-size: 24px;
  line-height: 120%;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.black};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CustomInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.black};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.black};
  }
`;

const CustomInputField = styled.div`
  width: 100%;
  height: 56px;
  border-radius: 10px;
  padding: 10px;
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid #c8c8c8;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-within {
    border-color: #c8c8c8;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const InputLabel = styled.label`
  font-family: Outfit;
  font-weight: 400;
  font-size: 12px;
  line-height: 100%;
  color: #666666;
  display: block;
  margin-bottom: 4px;
`;

const StyledPassword = styled(Input.Password)`
  height: 56px;
  border-radius: 10px;
  border: 1px solid #c8c8c8;
  background: transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  height: 56px;
  border-radius: 30px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
    background: ${({ theme }) => theme.colors.primary} !important;
    color: ${({ theme }) => theme.colors.white} !important;
  }
`;

const LoginText = styled.p`
  font-family: Outfit, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  text-align: center;
  margin-top: 24px;
  color: ${({ theme }) => theme.colors.gray || "#666666"};

  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
  }
`;
