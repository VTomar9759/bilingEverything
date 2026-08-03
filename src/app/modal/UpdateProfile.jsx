import { Modal, Form, Input, Button, Avatar, Upload, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClients";
import { udpateProfile } from "../store/slices/authSlices";


const UpdateProfile = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { userId, userData } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let profileImageUrl = userData?.profile_image;

      if (selectedFile) {
        // Delete old profile image from storage if it exists
        if (profileImageUrl && profileImageUrl.includes("user-logos/")) {
          const oldFilePath = profileImageUrl.split("user-logos/")[1];
          if (oldFilePath) {
            await supabase.storage.from("user-logos").remove([oldFilePath]);
          }
        }

        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-logos")
          .upload(filePath, selectedFile, {
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("user-logos")
          .getPublicUrl(filePath);

        profileImageUrl = data?.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          fullName: values.fullName,
          profile_image: profileImageUrl,
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      dispatch(udpateProfile({
        fullName: values.fullName,
        profile_image: profileImageUrl,
      }));

      message.success("Profile updated successfully!");
      onClose?.();
    } catch (error) {
      message.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      closeIcon={<span style={{ fontSize: "20px" }}>×</span>}
    >
      <ModalWapper>
        <HeaderContainer>
          <Title>Update Profile</Title>
          <Subtitle>Update your profile details</Subtitle>
        </HeaderContainer>

        <AvatarContainer>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              const isValidType =
                file.type === "image/jpeg" ||
                file.type === "image/png" ||
                file.type === "image/webp";

              if (!isValidType) {
                message.error("Only JPG, PNG, and WEBP files are allowed!");
                return Upload.LIST_IGNORE;
              }

              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error("Image must be smaller than 2MB!");
                return Upload.LIST_IGNORE;
              }

              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(file));
              return false;
            }}
          >
            <div style={{ position: "relative", cursor: "pointer", display: "inline-block" }}>
              <StyledAvatar
                size={80}
                src={previewUrl || userData?.profile_image}
                icon={!(previewUrl || userData?.profile_image) && <UserOutlined />}
              />
              <EditIconContainer>
                <EditOutlined style={{ fontSize: "12px", color: "#666" }} />
              </EditIconContainer>
            </div>
          </Upload>
        </AvatarContainer>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            fullName: userData?.fullName,
            email: userData?.email,
          }}
        >
          <NameFieldsContainer>
            <StyledFormItem name="fullName" label="Full Name">
              <Input placeholder="Full Name" />
            </StyledFormItem>
          </NameFieldsContainer>

          <EmailFormItem name="email" label="Email Address">
            <Input placeholder="Email address" disabled />
          </EmailFormItem>

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

export default UpdateProfile;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const ModalWapper = styled.div`
  padding: 30px;
`;
const Title = styled.h2`
  margin: 0 0 8px 0;
  font-weight: 700;
  font-style: Bold;
  font-size: 24px;
  line-height: 120%;
  letter-spacing: 0%;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0;
  font-weight: 400;
  font-style: Regular;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  text-align: center;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
  background-color: #f0f0f0;
  color: #8c8c8c;
  border: 2px solid #d9d9d9;
  position: relative;
`;

const EditIconContainer = styled.div`
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
`;

const NameFieldsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const StyledFormItem = styled(Form.Item)`
  flex: 1;
  margin-bottom: 0;
  .ant-input {
    height: 48px;
    border-radius: 8px;
  }
  & .ant-form-item-label > label {
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 150%;
    letter-spacing: 0%;
    vertical-align: middle;
    text-transform: uppercase;
    color: #818b9a;
  }
`;

const EmailFormItem = styled(Form.Item)`
  margin-bottom: 24px;
  .ant-input {
    height: 40px;
    border-radius: 8px;
  }
  & .ant-form-item-label > label {
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 150%;
    letter-spacing: 0%;
    vertical-align: middle;
    text-transform: uppercase;
    color: #818b9a;
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
`;
