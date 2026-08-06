// Public paths
export const PATH_LOGIN = "/";
export const PATH_SIGNUP = "/signup";
export const PATH_FORGOT_PASSWORD = "/forgot-password";

// Private paths
export const PATH_ITEMS = "/items";
export const PATH_ADD_ITEM = "/items/add";
export const PATH_EDIT_ITEM = "/items/edit/:id";
export const PATH_CATEGORIES = "/categories";

// Dashboard paths
export const PATH_DASHBOARD = "/dashboard";
export const PATH_ORDERS = "/orders";
export const PATH_ORDER_COMPOSER = "/composer";
export const PATH_TABLES = "/tables";
export const PATH_BILLING = "/billing";

// setting
export const PATH_SETTINGS = "/settings";
export const PATH_SETTINGS_PROFILE = "/settings/profile";
export const PATH_SETTINGS_PASSWORD = "/settings/change-password";
export const PATH_SETTINGS_BUSINESS = "/settings/business-details";
export const PATH_CHANGE_PASSWORD = "/settings/change-password";

// Sidebar paths (navItems)
export const navItems = [
  {
    label: "Dashboard",
    icon: "Dashboard",
    activePath: [PATH_DASHBOARD],
    path: PATH_DASHBOARD,
  },
    {
    label: "Categories",
    icon: "Categories",
    activePath: [PATH_CATEGORIES],
    path: PATH_CATEGORIES,
  },
  {
    label: "Tables",
    icon: "Tables",
    activePath: [PATH_TABLES],
    path: PATH_TABLES,
  },
  {
    label: "Items Catalog",
    icon: "Items",
    activePath: [PATH_ITEMS, PATH_ADD_ITEM, PATH_EDIT_ITEM],
    path: PATH_ITEMS,
  },

  {
    label: "Orders",
    icon: "Orders",
    activePath: [PATH_ORDERS, PATH_ORDER_COMPOSER],
    path: PATH_ORDER_COMPOSER,
  },

  {
    label: "Billing",
    icon: "Billing",
    activePath: [PATH_BILLING],
    path: PATH_BILLING,
  },
  {
    label: "Settings",
    icon: "Settings",
    activePath: [
      PATH_SETTINGS,
      PATH_SETTINGS_PROFILE,
      PATH_SETTINGS_PASSWORD,
      PATH_SETTINGS_BUSINESS,
    ],
    path: PATH_SETTINGS_PROFILE,
  },
];
