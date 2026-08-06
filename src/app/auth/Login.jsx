import styled, { keyframes } from "styled-components";
import { Input, Button, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { PATH_SIGNUP } from "../routes/pathname";
import { supabase } from "../../lib/supabaseClients";
import { useDispatch } from "react-redux";
import { logingAuth } from "../store/slices/authSlices";
import logo from "../../assets/logo.png";
import { BrandTitle } from "../utils/commons_style";

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
        .from("organization")
        .select("*")
        .eq("id", data.user.id)
        .single();

      dispatch(
        logingAuth({
          userData: { ...data.user, ...user },
          token: data.session.access_token,
          refreshToken: data.session.refresh_token,
          org_id: data.user.id,
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
          <LogoBadge>
            <img src={logo} alt="logo" className="image-box" />
          </LogoBadge>
          <BrandTitle>
            Billing <span className="highlight">Every Thing</span>
          </BrandTitle>
          <SmallText>Welcome back</SmallText>
        </CardHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            email: "stomar@yopmail.com",
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
  border-radius: var(--radius-xl);
  padding: 24px 28px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;

  .ant-form-item {
    margin-bottom: 10px;
  }

  .ant-form-item-label > label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
  }

  @media (max-width: 480px) {
    padding: 20px 18px;
    border-radius: var(--radius-xl);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LogoBadge = styled.div`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  .image-box {
    width: 120px;
    height: 120px;
    object-fit: cover;
  }
`;

const SmallText = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin: 0;
`;



const StyledInput = styled(Input)`
  height: 38px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 13px !important;
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
  height: 38px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 13px !important;
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
  margin-bottom: 14px;
  margin-top: -4px;
`;

const ForgotLink = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-sans);
  transition: opacity var(--transition-fast);

  &:hover { opacity: 0.75; text-decoration: underline; }
`;

const SubmitBtn = styled(Button)`
  height: 38px !important;
  border-radius: var(--radius-md) !important;
  font-size: 13.5px !important;
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
  margin: 14px 0 0;

  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  span {
    font-size: 11.5px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
`;

const SignupBtn = styled.button`
  width: 100%;
  height: 36px;
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
