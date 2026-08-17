import styled from "styled-components";
import { Button, Form } from "antd";
import { useNavigate } from "react-router";

const PorgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    console.log("Form Data:", values);
  };
  const handleBack = () => navigate(-1);

  return (
    <Wrapper>
      <Card>
        <BackButton onClick={handleBack}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.98 5.31999L10.77 8.52999L8.79999 10.49C7.96999 11.32 7.96999 12.67 8.79999 13.5L13.98 18.68C14.66 19.36 15.82 18.87 15.82 17.92V12.31V6.07999C15.82 5.11999 14.66 4.63999 13.98 5.31999Z"
              fill="#7A7B7A"
            />
          </svg>
        </BackButton>
        <Title>Forgot Password</Title>
        <SmallText>
          Please enter your email address to reset your password.
        </SmallText>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <InputWrapper>
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
                <CustomInput placeholder="example@gmail.com" />
              </CustomInputField>
            </Form.Item>
          </InputWrapper>

          <StyledButton htmlType="submit">Submit</StyledButton>
        </Form>
      </Card>
    </Wrapper>
  );
};

export default PorgotPassword;
const Wrapper = styled.div`
  width: 513px;
  border-radius: 16px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
`;
const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: transparent;
  border: 0.5px solid #7a7b7a66;
  cursor: pointer;
  &:hover {
    border-color: #7c7c7c;
  }
`;
const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SmallText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
`;

const Title = styled.h2`
  font-weight: 700;
  font-style: Bold;
  font-size: 24px;
  line-height: 120%;
  letter-spacing: 0%;
  margin-bottom: -10px;

  color: ${({ theme }) => theme.colors.black};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const CustomInput = styled.input.attrs((props) => ({
  value: props.value || "",
}))`
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
`;

const StyledButton = styled(Button)`
  width: 100%;
  height: 56px;
  border-radius: 30px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;

  &:hover {
    opacity: 0.9;
    background: ${({ theme }) => theme.colors.primary} !important;
    color: ${({ theme }) => theme.colors.white} !important;
  }
`;
