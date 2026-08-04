import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  Input,
  Button,
  Form,
  message as antMessage,
  Row,
  Col,
  Steps,
} from "antd";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClients";
import { PATH_LOGIN } from "../routes/pathname";

function SignUp() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stepFields = [
    ["full_name", "email", "phone", "password", "confirmPassword"],
    ["business_name", "legal_name", "gst_number", "fssai_number"],
    ["address", "city", "state", "pincode"],
  ];

  const handleNext = async () => {
    try {
      await form.validateFields(stepFields[currentStep]);
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      // Validation error messages are automatically displayed by antd Form.Item
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleAuth = async (values) => {
    const {
      full_name,
      email,
      phone,
      password,
      confirmPassword,
      business_name,
      legal_name,
      gst_number,
      fssai_number,
      address,
      city,
      state,
      pincode,
    } = values;

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

      if (data?.user) {
        const { data: orgData, error: insertError } = await supabase
          .from("organization")
          .upsert([
            {
              id: data.user.id, // Same UUID as auth.users.id
              full_name,
              email,
              phone,
              business_name,
              legal_name,
              gst_number,
              fssai_number,
              address,
              city,
              state,
              pincode,
            },
          ])
          .select(); // Return inserted row

        if (insertError) throw insertError;

        console.log("Organization registered:", orgData);
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
        <StyledSteps
          current={currentStep}
          size="small"
          items={[
            { title: "Account", description: "Step 1" },
            { title: "Organization", description: "Step 2" },
            { title: "Location", description: "Step 3" },
          ]}
        />

        <FormContainer>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAuth}
            initialValues={{
              full_name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
              business_name: "",
              legal_name: "",
              gst_number: "",
              fssai_number: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
            }}
          >
            {/* Step 1: Account Information */}
            <StepContent $active={currentStep === 0}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="full_name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Enter your full name" },
                    ]}
                  >
                    <StyledInput placeholder="John Doe" maxLength={50} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Enter email address" },
                      { type: "email", message: "Invalid email address" },
                    ]}
                  >
                    <StyledInput
                      placeholder="example@gmail.com"
                      maxLength={60}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: "Enter phone number" },
                      {
                        pattern: /^[0-9+\-\s]{7,15}$/,
                        message: "Invalid phone format",
                      },
                    ]}
                  >
                    <StyledInput placeholder="+91 9876543210" maxLength={15} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Enter password" },
                      { min: 6, message: "At least 6 characters" },
                    ]}
                  >
                    <StyledPassword placeholder="Enter password" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Confirm your password" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match"),
                          );
                        },
                      }),
                    ]}
                  >
                    <StyledPassword placeholder="Confirm password" />
                  </Form.Item>
                </Col>
              </Row>
            </StepContent>

            {/* Step 2: Organization / Business Information */}
            <StepContent $active={currentStep === 1}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="business_name"
                    label="Business Name"
                    rules={[{ required: true, message: "Enter business name" }]}
                  >
                    <StyledInput placeholder="Acme Foods" maxLength={60} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="legal_name"
                    label="Legal Name"
                    rules={[{ required: true, message: "Enter legal name" }]}
                  >
                    <StyledInput
                      placeholder="Acme Foods Pvt Ltd"
                      maxLength={60}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gst_number"
                    label="GST Number"
                    rules={[{ required: true, message: "Enter GST number" }]}
                  >
                    <StyledInput placeholder="22AAAAA0000A1Z5" maxLength={20} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fssai_number"
                    label="FSSAI License Number"
                    rules={[{ required: true, message: "Enter FSSAI number" }]}
                  >
                    <StyledInput placeholder="10000000000000" maxLength={20} />
                  </Form.Item>
                </Col>
              </Row>
            </StepContent>

            {/* Step 3: Address & Location Details */}
            <StepContent $active={currentStep === 2}>
              <Row gutter={12}>
                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[
                      { required: true, message: "Enter street address" },
                    ]}
                  >
                    <StyledInput
                      placeholder="123 Business Street, Suite 100"
                      maxLength={150}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: "Enter city" }]}
                  >
                    <StyledInput placeholder="Mumbai" maxLength={40} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: "Enter state" }]}
                  >
                    <StyledInput placeholder="Maharashtra" maxLength={40} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    name="pincode"
                    label="Pincode"
                    rules={[{ required: true, message: "Enter pincode" }]}
                  >
                    <StyledInput placeholder="400001" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>
            </StepContent>

            {/* Navigation Buttons */}
            <ButtonGroup>
              {currentStep > 0 ? (
                <PrevBtn type="default" onClick={handlePrev}>
                  ← Back
                </PrevBtn>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <NextBtn type="primary" onClick={handleNext}>
                  Next Step →
                </NextBtn>
              ) : (
                <SubmitBtn htmlType="submit" loading={loading}>
                  Complete Sign Up ✓
                </SubmitBtn>
              )}
            </ButtonGroup>
          </Form>
        </FormContainer>

        <Divider>
          <span>Already have an account?</span>
        </Divider>

        <LoginText onClick={() => navigate(PATH_LOGIN)}>
          Sign in to your account
        </LoginText>
      </Card>
    </Wrapper>
  );
}

export default SignUp;

/* ─── Animations ─── */
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const Wrapper = styled.div`
  width: 100%;
  max-width: 580px;
  animation: ${fadeSlide} 0.4s ease;
  margin: 0 auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-xl);
  padding: 22px 26px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    var(--shadow-xl),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 64px);

  .ant-form-item {
    margin-bottom: 8px;
  }

  .ant-form-item-label > label {
    font-size: 11.5px;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
  }

  @media (max-width: 480px) {
    padding: 18px 14px;
    border-radius: var(--radius-xl);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-bottom: 10px;
  text-align: center;
  flex-shrink: 0;
`;

const LogoBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: white;
  letter-spacing: 1px;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.35);
  margin-bottom: 2px;
`;

const SmallText = styled.p`
  font-size: 11.5px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin: 0;
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0;
`;

const StyledSteps = styled(Steps)`
  margin-bottom: 12px;
  flex-shrink: 0;

  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: var(--color-primary-50) !important;
    border-color: var(--color-primary) !important;
    .ant-steps-icon {
      color: var(--color-primary) !important;
    }
  }
  .ant-steps-item-process .ant-steps-item-icon {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    .ant-steps-icon {
      color: #fff !important;
    }
  }
  .ant-steps-item-finish
    > .ant-steps-item-container
    > .ant-steps-item-tail::after {
    background-color: var(--color-primary) !important;
  }
  .ant-steps-item-title {
    font-size: 11.5px !important;
    font-weight: 600 !important;
  }
  .ant-steps-item-description {
    font-size: 10.5px !important;
  }
`;

const FormContainer = styled.div`
  padding-right: 4px;
  flex: 1;
`;

const StepContent = styled.div`
  width: 100%;
  display: ${({ $active }) => ($active ? "block" : "none")};
  animation: ${fadeSlide} 0.3s ease;
`;

const StyledInput = styled(Input)`
  height: 34px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 12.5px !important;
  transition: all var(--transition-base) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: white !important;
  }

  &:focus,
  &.ant-input-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: white !important;
  }
`;

const StyledPassword = styled(Input.Password)`
  height: 34px !important;
  border-radius: var(--radius-md) !important;
  border: 1.5px solid var(--color-border) !important;
  background: var(--color-bg) !important;
  font-size: 12.5px !important;
  transition: all var(--transition-base) !important;

  &:hover {
    border-color: var(--color-primary-100) !important;
    background: white !important;
  }

  &.ant-input-affix-wrapper-focused {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(1, 81, 75, 0.1) !important;
    background: white !important;
  }

  input {
    background: transparent !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const PrevBtn = styled(Button)`
  height: 34px !important;
  border-radius: var(--radius-md) !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  border: 1.5px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  background: var(--color-bg) !important;
  transition: all var(--transition-base) !important;

  &:hover {
    border-color: var(--color-primary) !important;
    color: var(--color-primary) !important;
    background: white !important;
  }
`;

const NextBtn = styled(Button)`
  height: 42px !important;
  border-radius: var(--radius-md) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  background: var(--color-primary) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.25) !important;
  transition: all var(--transition-base) !important;

  &:hover {
    background: var(--color-primary-light) !important;
    box-shadow: 0 6px 18px rgba(1, 81, 75, 0.35) !important;
    transform: translateY(-1px) !important;
  }
`;

const SubmitBtn = styled(Button)`
  height: 42px !important;
  border-radius: var(--radius-md) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  background: var(--color-primary) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(1, 81, 75, 0.3) !important;
  transition: all var(--transition-base) !important;

  &:hover {
    background: var(--color-primary-light) !important;
    box-shadow: 0 6px 20px rgba(1, 81, 75, 0.4) !important;
    transform: translateY(-1px) !important;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 0;
  flex-shrink: 0;

  &::before,
  &::after {
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

const LoginText = styled.button`
  width: 100%;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all var(--transition-base);
  margin-top: 10px;
  flex-shrink: 0;

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-100);
    color: var(--color-primary);
  }
`;
