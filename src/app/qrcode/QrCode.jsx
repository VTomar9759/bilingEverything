import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import useOrgData from "../hooks/useOrgData";

/**
 * Build a UPI deep-link URI for payment.
 * Format: upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 */
export const buildUPIString = ({ upi_id, business_name, amount, note = "Order Payment" }) => {
  if (!upi_id) return null;
  const params = new URLSearchParams();
  params.set("pa", upi_id);
  if (business_name) params.set("pn", business_name);
  if (amount && Number(amount) > 0) params.set("am", Number(amount).toFixed(2));
  params.set("cu", "INR");
  params.set("tn", note);
  return `upi://pay?${params.toString()}`;
};

/**
 * Generate a QR code as a base64 PNG Data URL string.
 * Uses the `qrcode` npm package.
 *
 * @param {string} text  - The string to encode (e.g. a UPI URI)
 * @param {object} opts  - qrcode options (width, margin, color, ...)
 * @returns {Promise<string|null>}  Data URL or null on error
 */
export const generateQRDataURL = async (text, opts = {}) => {
  if (!text) return null;
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: opts.width || 200,
      margin: opts.margin ?? 2,
      color: {
        dark: opts.darkColor || "#000000",
        light: opts.lightColor || "#ffffff",
      },
      errorCorrectionLevel: opts.errorCorrectionLevel || "M",
    });
    return dataUrl;
  } catch (err) {
    console.error("QR code generation failed:", err);
    return null;
  }
};

/**
 * usePaymentQR - React hook
 *
 * Reads upi_id from useOrgData (which pulls from Redux store / auth slice).
 * Builds a UPI deep-link string and generates a QR code Data URL for the given amount.
 *
 * @param {number|string} amount  - Order total to embed in the QR (set to 0 to omit amount)
 * @param {string} [note]         - Optional payment note shown in UPI app
 * @returns {{ dataUrl, upiString, upi_id, loading }}
 */
export const usePaymentQR = (amount, note = "Order Payment") => {
  const { upi_id, userData } = useOrgData();
  const business_name = userData?.business_name || userData?.legal_name || "";
  const [dataUrl, setDataUrl] = useState(null);
  const [upiString, setUpiString] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!upi_id) {
      setDataUrl(null);
      setUpiString(null);
      return;
    }

    const upi = buildUPIString({ upi_id, business_name, amount, note });
    setUpiString(upi);

    let cancelled = false;
    setLoading(true);
    generateQRDataURL(upi, { width: 200 }).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [upi_id, business_name, amount, note]);

  return { dataUrl, upiString, upi_id, loading };
};

/**
 * PaymentQRCode - React component
 *
 * Renders a UPI payment QR code image for the given order amount.
 * Reads upi_id automatically from org data via usePaymentQR hook.
 * Returns null when upi_id is not configured.
 *
 * Props:
 *   amount    {number|string}  Order total to encode in the QR
 *   size      {number}         Display size in px (default 140)
 *   showLabel {boolean}        Show "Scan to Pay via UPI" + upi_id label below (default true)
 *   style     {object}         Extra container style overrides
 *
 * For print HTML generation (printService.js), use generatePaymentQRHTMLBlock() instead.
 */
const PaymentQRCode = ({ amount, size = 140, showLabel = true, style = {} }) => {
  const { dataUrl, upi_id, loading } = usePaymentQR(amount);

  if (!upi_id) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        ...style,
      }}
    >
      {loading ? (
        <div
          style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#888",
          }}
        >
          Loading...
          
        </div>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt="UPI Payment QR"
          width={size}
          height={size}
          style={{ display: "block" }}
        />
      ) : null}

      {showLabel && (
        <span style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>
          Scan to Pay via UPI
          {upi_id && (
            <>
              <br />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{upi_id}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default PaymentQRCode;
