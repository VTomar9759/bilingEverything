export const colors = [
  "#0F766E", // Default - Professional Teal
  "#0891B2", // Calm Cyan
  "#0284C7", // Sky Blue
  "#6366C1", // Soft Indigo
  "#36558F", // Deep Blue

  "#2477A5", // Ocean Blue
  "#7BAA3C", // Soft Lime
  "#3A9D5D", // Soft Green
  "#2F9B83", // Emerald
  "#2F8078", // Teal
  "#3a1111ff",

  "#64748B", // Slate
  "#7659B8", // Soft Violet
  "#9B6CC2", // Soft Purple
  "#B052A8", // Soft Fuchsia
  "#C65383", // Soft Pink
  "#C9576B", // Soft Rose
  "#94613F", // Soft Brown
  "#475569", // Dark Slate

  "#718096", // Cool Gray
  "#334155", // Charcoal
  "#1E293B", // Deep Charcoal
  "#111827", // Midnight
  "#000000", // Black
];

export const colors2 = [
  "#0B4F4A", // Deep Sea Green
  "#155E75", // Deep Cyan
  "#1D4ED8", // Royal Blue
  "#4338CA", // Deep Indigo
  "#5B21B6", // Deep Violet

  "#0369A1", // Ocean
  "#0D9488", // Aqua Teal
  "#15803D", // Forest Green
  "#4D7C0F", // Olive Green
  "#65A30D", // Fresh Lime

  "#A16207", // Amber Brown
  "#CA8A04", // Mustard Gold
  "#C2410C", // Burnt Orange
  "#9A3412", // Terracotta
  "#7C2D12", // Copper Brown

  "#BE123C", // Crimson
  "#9F1239", // Burgundy
  "#A21CAF", // Magenta
  "#86198F", // Plum
  "#6B21A8", // Royal Purple

  "#0369A1", // Steel Blue
  "#475569", // Blue Gray
  "#52525B", // Zinc
  "#57534E", // Warm Gray
  "#44403C", // Stone

  "#166534", // Dark Forest
  "#115E59", // Dark Teal
  "#1E40AF", // Cobalt
  "#312E81", // Navy Indigo
  "#4C1D95", // Dark Violet
];
/**
 * Convert a hex color string to HSL values.
 */
function hexToHSL(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert HSL values back to hex.
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generate a full primary color palette from a single hex color.
 * Returns { primary, primaryLight, primaryDark, primary50, primary100 }
 */
export function generatePrimaryPalette(hex) {
  const { h, s, l } = hexToHSL(hex);

  return {
    primary: hex,
    primaryLight: hslToHex(h, Math.min(s + 10, 100), Math.min(l + 12, 85)),
    primaryDark: hslToHex(h, s, Math.max(l - 15, 10)),
    primary50: `hsla(${h}, ${s}%, ${l}%, 0.08)`,
    primary100: `hsla(${h}, ${s}%, ${l}%, 0.18)`,
  };
}

export const lightTheme = {
  colors: {
    primary: "#01514b",
    primaryLight: "#017a71",
    primaryDark: "#013d38",
    primary50: "#f0faf9",
    primary100: "#d0f0ed",
    black: "#0f1117",
    white: "#ffffff",
    gray: "#4b5563",
    grayLight: "#9ca3af",
    bg: "#f5f7fa",
    surface: "#ffffff",
    border: "#e8ecf0",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    text: "#0f1117",
    textMuted: "#4b5563",
    themeChange: "#4b5563",
  },
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 2px 8px rgba(0,0,0,0.06)",
    md: "0 4px 16px rgba(0,0,0,0.08)",
    lg: "0 8px 32px rgba(0,0,0,0.10)",
    xl: "0 16px 48px rgba(0,0,0,0.12)",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    "2xl": "28px",
    full: "9999px",
  },
  fonts: {
    sans: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
    display: "'Plus Jakarta Sans', 'Inter', sans-serif",
  },
};

// Backward-compatible alias
export const theme = lightTheme;
