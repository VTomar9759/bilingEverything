import styled, { keyframes } from "styled-components";
import { Input, Button, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { PATH_SIGNUP } from "../routes/pathname";
import { supabase } from "../../lib/supabaseClients";
import { useDispatch } from "react-redux";
import { logingAuth } from "../store/slices/authSlices";

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    const { email, password } = values;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      dispatch(
        logingAuth({
          userData: { ...data.user, ...user },
          token: data.session.access_token,
          refreshToken: data.session.refresh_token,
          userId: data.user.id,
        })
      );
      message.success("Login successful");
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <Wrapper>
      <Card>
        {/* Header */}
        <CardHeader>
          <LogoBadge>VT</LogoBadge>
          <SmallText>Welcome back</SmallText>
          <Title>Sign in to your account</Title>
        </CardHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            email: "kanu@yopmail.com",
            password: "Password@123",
          }}
        >
          <Form.Item
            name="email"
            label="Email address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email address" },
            ]}
          >
            <StyledInput placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "At least 6 characters" },
            ]}
          >
            <StyledPassword placeholder="Enter your password" size="large" />
          </Form.Item>

          <ForgotRow>
            <ForgotLink onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </ForgotLink>
          </ForgotRow>

          <SubmitBtn htmlType="submit" block>
            Sign In →
          </SubmitBtn>
        </Form>

        <Divider>
          <span>Don't have an account?</span>
        </Divider>

        <SignupBtn onClick={() => navigate(PATH_SIGNUP)}>
          Create an account
        </SignupBtn>
      </Card>
    </Wrapper>
  );
};

export default Login;

/* ─── Animations ─── */
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled ─── */
const Wrapper = styled.div`
  width: 100%;
  max-width: 440px;
  animation: ${fadeSlide} 0.4s ease;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-2xl);
  padding: 36px 40px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;

  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-form-item-label > label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
  }

  @media (max-width: 480px) {
    padding: 28px 24px;
    border-radius: var(--radius-xl);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  text-align: center;
`;

const LogoBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  color: white;
  letter-spacing: 1px;
  box-shadow: 0 4px 14px rgba(1,81,75,0.35);
  margin-bottom: 4px;
`;

const SmallText = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin: 0;
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0;
`;

const StyledInput = styled(Input)`
  height: 44px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 14px !important;
  transition: all var(--transition-base) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: white !important;
  }

  &:focus, &.ant-input-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1,81,75,0.10) !important;
    background: white !important;
  }
`;

const StyledPassword = styled(Input.Password)`
  height: 44px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 14px !important;
  transition: all var(--transition-base) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: white !important;
  }

  &.ant-input-affix-wrapper-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1,81,75,0.10) !important;
    background: white !important;
  }

  input { background: transparent !important; }
`;

const ForgotRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  margin-top: -8px;
`;

const ForgotLink = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-sans);
  transition: opacity var(--transition-fast);

  &:hover { opacity: 0.75; text-decoration: underline; }
`;

const SubmitBtn = styled(Button)`
  height: 48px !important;
  border-radius: var(--radius-md) !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  background: var(--color-primary) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(1,81,75,0.30) !important;
  letter-spacing: 0.01em !important;
  transition: all var(--transition-base) !important;

  &:hover {
    background: var(--color-primary-light) !important;
    box-shadow: 0 6px 20px rgba(1,81,75,0.40) !important;
    transform: translateY(-1px) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 0;

  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  span {
    font-size: 12px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
`;

const SignupBtn = styled.button`
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all var(--transition-base);
  margin-top: 10px;

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-100);
    color: var(--color-primary);
  }
`;
