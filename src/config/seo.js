// ============================================================
// Central SEO Configuration — Bill Everything
// ============================================================
// All SEO values live here. Edit this file to update metadata
// across the entire application without touching page components.
// ============================================================

/** Production domain — read from env, falls back to a safe default */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://billeverything.com";

/** Shared OG/Twitter image (1200×630 recommended) */
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Twitter / X handle (without @) */
export const TWITTER_HANDLE = "billeverything";

/** App name used as suffix in page titles */
export const SITE_NAME = "Bill Everything";

// ─── Default / Fallback SEO ───────────────────────────────────────────────────
export const DEFAULT_SEO = {
  title: "Bill Everything — Restaurant Management & Billing Software",
  description:
    "Bill Everything is a complete restaurant management solution. Manage orders, billing, tables, inventory, menu items, and real-time analytics — all in one place.",
  keywords:
    "restaurant billing software, restaurant management software, POS software, food order management, restaurant POS, billing software India",
  robots: "index,follow",
  ogType: "website",
  ogImage: OG_IMAGE,
  twitterCard: "summary_large_image",
  author: "Bill Everything",
  themeColor: "#ffffff",
};

// ─── Page-specific SEO map (keyed by route path) ─────────────────────────────
// `robots: "noindex,nofollow"` on private/admin pages prevents crawlers from
// indexing authenticated screens that contain business-sensitive data.
export const PAGE_SEO = {
  // ── Public pages ────────────────────────────────────────────────────────────
  "/": {
    title: "Bill Everything — #1 Restaurant Billing & Management Software",
    description:
      "Streamline your restaurant operations with Bill Everything. Manage dine-in orders, KOTs, billing, table management, inventory, and powerful analytics — all from one dashboard.",
    keywords:
      "restaurant billing software, POS software, restaurant management system, food ordering software, table management, KOT software, restaurant analytics",
    robots: "index,follow",
    ogType: "website",
  },

  "/login": {
    title: "Login — Bill Everything",
    description:
      "Sign in to your Bill Everything account to manage your restaurant operations, orders, billing, and more.",
    keywords: "login, restaurant management login, bill everything sign in",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/signup": {
    title: "Create Account — Bill Everything",
    description:
      "Get started with Bill Everything. Create your free account and set up your restaurant management system in minutes.",
    keywords:
      "sign up, create account, free restaurant software, restaurant billing signup",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/forgot-password": {
    title: "Forgot Password — Bill Everything",
    description:
      "Reset your Bill Everything account password. Enter your email address and we will send you a reset link.",
    keywords: "forgot password, reset password, account recovery",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/reset-password": {
    title: "Reset Password — Bill Everything",
    description:
      "Set a new password for your Bill Everything account to regain access.",
    keywords: "reset password, new password, account recovery",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  // ── Private / Admin pages ───────────────────────────────────────────────────
  "/dashboard": {
    title: "Dashboard — Bill Everything",
    description:
      "Your restaurant performance at a glance. View today's sales, active orders, revenue trends, and operational KPIs on the Bill Everything dashboard.",
    keywords: "restaurant dashboard, sales overview, restaurant analytics",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/orders": {
    title: "Orders — Bill Everything",
    description:
      "View and manage all restaurant orders in one place. Track dine-in, takeaway, and delivery orders with real-time status updates.",
    keywords:
      "restaurant orders, order management, dine-in orders, food order tracking",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/composer": {
    title: "New Order — Bill Everything",
    description:
      "Create and compose new restaurant orders quickly. Add items, apply discounts, and send KOTs to the kitchen instantly.",
    keywords: "new order, create order, POS order, restaurant order entry",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/order-edit": {
    title: "Edit Order — Bill Everything",
    description:
      "Modify existing restaurant orders. Update quantities, add or remove items, and resend KOTs without disrupting kitchen flow.",
    keywords: "edit order, modify order, update order, restaurant order edit",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/billing": {
    title: "Billing — Bill Everything",
    description:
      "Process payments, generate bills, apply discounts, and manage settlement across cash, card, and UPI for your restaurant.",
    keywords:
      "restaurant billing, payment processing, generate bill, restaurant invoice, UPI payment, POS billing",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/tables": {
    title: "Table Management — Bill Everything",
    description:
      "Manage your restaurant's floor plan and table assignments. View table status, merge tables, and assign orders to specific tables.",
    keywords:
      "restaurant table management, floor plan, table assignment, dine-in management",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/items": {
    title: "Menu Items — Bill Everything",
    description:
      "Browse and manage your complete restaurant menu catalog. Update prices, availability, and item details in real time.",
    keywords:
      "restaurant menu, menu items, food catalog, item management, menu management",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/items/add": {
    title: "Add Menu Item — Bill Everything",
    description:
      "Add a new food or beverage item to your restaurant menu. Set name, price, category, and availability instantly.",
    keywords: "add menu item, add food item, new item, restaurant menu update",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/categories": {
    title: "Categories — Bill Everything",
    description:
      "Organise your restaurant menu into categories. Create, edit, and reorder categories to make ordering faster and more intuitive.",
    keywords:
      "restaurant categories, menu categories, food categories, category management",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/reports": {
    title: "Reports & Analytics — Bill Everything",
    description:
      "Gain insights into your restaurant's performance. View sales reports, revenue trends, top-selling items, and staff activity analytics.",
    keywords:
      "restaurant reports, sales analytics, revenue report, restaurant insights, performance dashboard",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/order-queue": {
    title: "Order Queue — Bill Everything",
    description:
      "Monitor the live order queue for your kitchen. Track pending, in-progress, and completed orders for efficient kitchen coordination.",
    keywords:
      "order queue, kitchen display, KOT management, kitchen order tracking",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/only-queue": {
    title: "Kitchen Display — Bill Everything",
    description:
      "Dedicated kitchen display screen showing the live order queue. Optimised for kitchen monitors to manage KOTs without distraction.",
    keywords:
      "kitchen display system, KDS, kitchen monitor, order queue display",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  // Settings pages
  "/settings": {
    title: "Settings — Bill Everything",
    description:
      "Configure your Bill Everything restaurant account. Manage profile, business details, print settings, and team permissions.",
    keywords: "restaurant settings, account settings, configuration",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/settings/profile": {
    title: "Profile Settings — Bill Everything",
    description:
      "Update your personal profile information including name, email, and contact details for your Bill Everything account.",
    keywords: "profile settings, update profile, account profile",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/settings/change-password": {
    title: "Change Password — Bill Everything",
    description:
      "Update your Bill Everything account password to keep your restaurant data secure.",
    keywords: "change password, update password, security settings",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/settings/business-details": {
    title: "Business Details — Bill Everything",
    description:
      "Manage your restaurant's business information including name, address, GST number, and contact details.",
    keywords:
      "business details, restaurant information, GST settings, business profile",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/settings/print-settings": {
    title: "Print Settings — Bill Everything",
    description:
      "Configure receipt and KOT printing preferences. Set printer connections, paper size, and bill format for your restaurant.",
    keywords:
      "print settings, receipt printer, KOT printer, bill format, thermal printer",
    robots: "noindex,nofollow",
    ogType: "website",
  },

  "/settings/admins": {
    title: "Admin Management — Bill Everything",
    description:
      "Manage your restaurant team. Add administrators, assign roles, and configure access permissions for each staff member.",
    keywords:
      "admin management, team management, staff roles, user permissions",
    robots: "noindex,nofollow",
    ogType: "website",
  },
};

/**
 * Resolves the SEO config for a given pathname.
 * Falls back to DEFAULT_SEO for unknown routes.
 *
 * @param {string} pathname - The current window.location.pathname
 * @returns {object} Merged SEO config object
 */
export function resolveSEO(pathname) {
  const pageSeo = PAGE_SEO[pathname] || {};
  return { ...DEFAULT_SEO, ...pageSeo };
}
