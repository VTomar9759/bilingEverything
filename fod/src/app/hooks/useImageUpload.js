import { useState } from "react";
import { message } from "antd";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClients";
const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const { userId } = useSelector((state) => state?.authSlice);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);

      // Validate type
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp";

      if (!isValidType) {
        message.error("Only JPG, PNG, and WEBP files are allowed!");
        return false;
      }

      // Validate size
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }

      // Extension
      const fileExt = file.name.split(".").pop();

      // Path
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      // Upload
      const { error: uploadError } = await supabase.storage
        .from("items-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Public URL
      const { data } = supabase.storage
        .from("items-images")
        .getPublicUrl(filePath);

      const imageUrl = data?.publicUrl;

      if (imageUrl) {
        onSuccess?.(imageUrl);
        return imageUrl;
      }
    } catch (error) {
      onError?.(error);
      message.error(error.message || "Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";

    if (!isValidType) {
      message.error("Only JPG, PNG, and WEBP files are allowed!");
    }

    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }

    return isValidType && isLt2M;
  };

  return {
    handleUpload,
    beforeUpload,
    uploading,
  };
};

export default useImageUpload;