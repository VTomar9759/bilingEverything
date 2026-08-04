import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Avatar, Upload, message, Button, Spin } from "antd";
import {
  ShopOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../../../../lib/supabaseClients";
import { udpateProfile } from "../../../store/slices/authSlices";

const LogoUpdate = () => {
  const dispatch = useDispatch();
  const { org_id, userData } = useSelector((state) => state.authSlice);

  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (userData?.logo_image) {
      setLogoPreview(userData.logo_image);
    }
  }, [userData]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files (PNG, JPG, WEBP, SVG)!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image size must be less than 2MB!");
      return false;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    return false;
  };

  const deleteLogoFromBucket = async (logoUrl) => {
    if (!logoUrl || typeof logoUrl !== "string") return;
    if (logoUrl.includes("org-logos/")) {
      const filePath = logoUrl.split("org-logos/")[1]?.split("?")[0];
      if (filePath) {
        const { error } = await supabase.storage
          .from("org-logos")
          .remove([filePath]);
        if (error) {
          console.error("Error removing logo from bucket:", error);
        }
      }
    }
  };

  const uploadLogoToSupabase = async () => {
    if (!logoFile) {
      message.info("Please select a new logo image to upload.");
      return;
    }

    try {
      setLoading(true);

      if (userData?.logo_image) {
        await deleteLogoFromBucket(userData.logo_image);
      }

      const fileExt = logoFile.name.split(".").pop();
      const filePath = `${org_id || "default"}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("org-logos")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("org-logos")
        .getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error("Failed to generate public URL for uploaded logo.");
      }

      if (org_id) {
        const { error: dbError } = await supabase
          .from("organization")
          .update({ logo_image: publicUrl })
          .eq("id", org_id);

        if (dbError) throw dbError;
      }

      dispatch(udpateProfile({ logo_image: publicUrl }));
      message.success("Organization logo updated successfully!");
      setLogoFile(null);
    } catch (err) {
      console.error("Logo upload error:", err);
      message.error(err.message || "Failed to update business logo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setLoading(true);

      if (userData?.logo_image) {
        await deleteLogoFromBucket(userData.logo_image);
      }

      if (org_id) {
        const { error: dbError } = await supabase
          .from("organization")
          .update({ logo_image: null })
          .eq("id", org_id);

        if (dbError) throw dbError;
      }

      dispatch(udpateProfile({ logo_image: null }));
      setLogoFile(null);
      setLogoPreview(null);
      message.success("Logo removed successfully!");
    } catch (err) {
      message.error(err.message || "Failed to remove logo");
    } finally {
      setLoading(false);
    }
  };

  const currentSrc = logoPreview || userData?.logo_image;

  return (
    <LogoCard>
      <Upload
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        accept="image/*"
      >
        <LogoWrapper title="Click to select business logo">
          <StyledAvatar
            size={60}
            src={currentSrc}
            icon={!currentSrc && <ShopOutlined style={{ fontSize: 24 }} />}
          >
            {loading && (
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 18, color: "#ffffff" }}
                    spin
                  />
                }
              />
            )}
          </StyledAvatar>
          <EditBadge>
            <EditOutlined
              style={{ fontSize: 10, color: "var(--color-primary, #01514b)" }}
            />
          </EditBadge>
        </LogoWrapper>
      </Upload>

      <LogoMeta>
        <LogoHeaderGroup>
          <div>
            <LogoMetaTitle>Organization Logo</LogoMetaTitle>
            <LogoMetaSub>
              Upload your official business logo. It will print automatically on
              customer invoices, receipts, and order slips.
            </LogoMetaSub>
          </div>
          <BadgeSpecs>JPG, PNG, WEBP • Max 2MB</BadgeSpecs>
        </LogoHeaderGroup>

        <LogoButtonGroup>
          <Upload
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="image/*"
          >
            <Button size="small" icon={<UploadOutlined />}>
              {currentSrc ? "Change Logo" : "Upload Logo"}
            </Button>
          </Upload>

          {logoFile && (
            <SaveButton
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={loading}
              onClick={uploadLogoToSupabase}
            >
              Save Logo
            </SaveButton>
          )}

          {currentSrc && !logoFile && (
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              disabled={loading}
              onClick={handleRemoveLogo}
            >
              Remove
            </Button>
          )}
        </LogoButtonGroup>
      </LogoMeta>
    </LogoCard>
  );
};

export default LogoUpdate;

/* ─── Styled Components ─── */
const LogoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  margin-bottom: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LogoWrapper = styled.div`
  position: relative;
  cursor: pointer;
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.04);
  }
`;

const StyledAvatar = styled(Avatar)`
  background-color: var(--color-primary-50, rgba(1, 81, 75, 0.1));
  color: var(--color-primary, #01514b);
  border: 2px solid var(--color-border, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const EditBadge = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid var(--color-border, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
`;

const LogoMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  width: 100%;
`;

const LogoHeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  flex-wrap: wrap;
`;

const LogoMetaTitle = styled.h4`
  margin: 0 0 2px 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
`;

const LogoMetaSub = styled.p`
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-muted, #64748b);
  max-width: 480px;
  line-height: 1.35;
`;

const BadgeSpecs = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #cbd5e1);
  color: var(--color-text-muted, #64748b);
`;

const LogoButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SaveButton = styled(Button)`
  background-color: var(--color-primary, #01514b) !important;
  border-color: var(--color-primary, #01514b) !important;
`;
