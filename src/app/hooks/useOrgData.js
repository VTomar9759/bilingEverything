
import { useSelector } from "react-redux";

const useOrgData = () => {
  const authState = useSelector((state) => state?.authSlice) || {};
  const { org_id, created_by, gst_number, gst_status, token, refreshToken, userData } = authState;

  const effectiveOrgId = org_id || userData?.org_id || userData?.id || null;
  const effectiveCreatedBy = created_by || userData?.created_by || effectiveOrgId;
  const effectiveGstNumber = gst_number || userData?.gst_number || null;
  const effectiveGstStatus = gst_status || userData?.gst_status || null;
  const hasGst = Boolean(effectiveGstNumber && String(effectiveGstNumber).trim().length > 0);
  const rawPermission = userData?.permissions || userData?.permission || null;
  let parsedPermission = null;
  if (rawPermission) {
    if (typeof rawPermission === "string") {
      try {
        parsedPermission = JSON.parse(rawPermission);
      } catch (e) {
        parsedPermission = rawPermission;
      }
    } else if (typeof rawPermission === "object") {
      parsedPermission = rawPermission;
    }
  }

  const defaultPermission = {
    categories: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    dashboard: {
      view: true,
    },
    orders: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    tables: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    items_catalog: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    billing: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    settings: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  };

  const permission = parsedPermission || defaultPermission;

  return {
    org_id: effectiveOrgId,
    created_by: effectiveCreatedBy,
    gst_number: effectiveGstNumber,
    gst_status: effectiveGstStatus,
    hasGst,
    token,
    refreshToken,
    userData: userData || null,
    permission: permission,
  };
};

export default useOrgData;