
import { useSelector } from "react-redux";

const useOrgData = () => {
  const authState = useSelector((state) => state?.authSlice) || {};
  const { org_id, created_by, gst_number, gst_status, token, refreshToken, userData } = authState;

  const effectiveOrgId = org_id || userData?.org_id || userData?.id || null;
  const effectiveCreatedBy = created_by || userData?.created_by || effectiveOrgId;
  const effectiveGstNumber = gst_number || userData?.gst_number || null;
  const effectiveGstStatus = gst_status || userData?.gst_status || null;
  const hasGst = Boolean(effectiveGstNumber && String(effectiveGstNumber).trim().length > 0);

  return {
    org_id: effectiveOrgId,
    created_by: effectiveCreatedBy,
    gst_number: effectiveGstNumber,
    gst_status: effectiveGstStatus,
    hasGst,
    token,
    refreshToken,
    userData: userData || null,
  };
};

export default useOrgData;