import { TABLE_STATUS, PAYMENT_MODE } from "./constant";
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

export const getPaymentStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return React.createElement(AntdBadge, { status: "success", text: "Paid" });
    case "Pending":
    case "Unpaid":
      return React.createElement(AntdBadge, { status: "warning", text: "Pending" });
    default:
      return React.createElement(AntdBadge, { status: status === "Paid" ? "success" : "warning", text: status || "Pending" });
  }
};

export const getPaymentModeBadge = (mode) => {
  if (!mode) return null;
  const normalizedMode = String(mode).trim();
  let color = "#3b82f6";
  let bg = "rgba(59, 130, 246, 0.1)";
  let borderColor = "rgba(59, 130, 246, 0.25)";

  const lowerMode = normalizedMode.toLowerCase();

  if (lowerMode === PAYMENT_MODE.cash.toLowerCase()) {
    color = "#10b981";
    bg = "rgba(16, 185, 129, 0.1)";
    borderColor = "rgba(16, 185, 129, 0.25)";
  } else if (lowerMode === PAYMENT_MODE.card.toLowerCase()) {
    color = "#8b5cf6";
    bg = "rgba(139, 92, 246, 0.1)";
    borderColor = "rgba(139, 92, 246, 0.25)";
  } else if (lowerMode === PAYMENT_MODE.online.toLowerCase()) {
    color = "#06b6d4";
    bg = "rgba(6, 182, 212, 0.1)";
    borderColor = "rgba(6, 182, 212, 0.25)";
  } else if (lowerMode === PAYMENT_MODE.unpaid?.toLowerCase() || lowerMode === "unpaid") {
    color = "#f59e0b";
    bg = "rgba(245, 158, 11, 0.1)";
    borderColor = "rgba(245, 158, 11, 0.25)";
  }

  return React.createElement(
    "span",
    {
      style: {
        fontSize: "11px",
        fontWeight: 600,
        color,
        background: bg,
        border: `1px solid ${borderColor}`,
        padding: "1px 6px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
      },
    },
    normalizedMode
  );
};

export const getPaymentBadge = (status, mode) => {
  const statusBadge = getPaymentStatusBadge(status);
  const modeBadge = getPaymentModeBadge(mode);
  if (!modeBadge) return statusBadge;
  return React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "6px" } },
    statusBadge,
    modeBadge
  );
};


