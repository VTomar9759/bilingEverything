import { TABLE_STATUS } from "./constant";
import React from "react";
import { Badge as AntdBadge } from "antd";
const image_base_url = import.meta.env.VITE_PUBLIC_IMAGE_BASE_DEV_URL;
// const defaultImage = "/assets/image-not-found.png";
export const getImageurl = (url) => {
  return `${image_base_url}${url}`;
};

export const getTABLE_STATUSColor = (status) => {
  switch (status) {
    case TABLE_STATUS.available:
      return "#10b981"; // success
    case TABLE_STATUS.occupied:
      return "#3b82f6"; // primary/blue
    case TABLE_STATUS.reserved:
      return "#8b5cf6"; // purple
    case TABLE_STATUS.billed:
      return "#f59e0b"; // warning/orange
    case TABLE_STATUS.cleaning:
      return "#06b6d4"; // cyan/teal
    default:
      return "#9ca3af";
  }
};



export const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return React.createElement(AntdBadge, { status: "warning", text: "Pending" });
    case "Preparing":
      return React.createElement(AntdBadge, { status: "processing", text: "Preparing" });
    case "Ready":
      return React.createElement(AntdBadge, { status: "success", text: "Ready" });
    case "Served":
      return React.createElement(AntdBadge, { status: "default", text: "Served" });
    case "Cancelled":
      return React.createElement(AntdBadge, { status: "error", text: "Cancelled" });
    default:
      return React.createElement(AntdBadge, { status: "default", text: status });
  }
};
