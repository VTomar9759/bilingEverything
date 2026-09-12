// Public paths
export const PATH_LOGIN = "/";
export const PATH_SIGNUP = "/signup";
export const PATH_FORGOT_PASSWORD = "/forgot-password";

// Private paths
export const PATH_ITEMS = "/items";
export const PATH_ADD_ITEM = "/items/add";
export const PATH_EDIT_ITEM = "/items/edit/:id";

// Dashboard paths
export const PATH_DASHBOARD = "/dashboard";
export const PATH_ORDERS = "/dashboard/orders";
export const PATH_ORDER_COMPOSER = "/dashboard/order-composer";
export const PATH_TABLES = "/dashboard/tables";
export const PATH_BILLING = "/dashboard/billing";
export const PATH_KITCHEN = "/dashboard/kitchen";
export const PATH_STAFF = "/dashboard/staff";
export const PATH_INVENTORY = "/dashboard/inventory";
export const PATH_REPORTS = "/dashboard/reports";
export const PATH_SETTINGS = "/dashboard/settings";
export const PATH_DYNAMIC = "/dashboard/database-admin";

// Sidebar paths (navItems)
export const navItems = [
  {
    label: "Dashboard",
    icon: "Dashboard",
    activePath: [PATH_DASHBOARD],
    path: PATH_DASHBOARD,
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
    path: PATH_ORDERS,
  },
  {
    label: "Tables",
    icon: "Tables",
    activePath: [PATH_TABLES],
    path: PATH_TABLES,
  },
  // {
  //   label: "Billing",
  //   icon: "Billing",
  //   activePath: [PATH_BILLING],
  //   path: PATH_BILLING,
  // },
  // {
  //   label: "Kitchen",
  //   icon: "Kitchen",
  //   activePath: [PATH_KITCHEN],
  //   path: PATH_KITCHEN,
  // },

  // {
  //   label: "Inventory",
  //   icon: "Inventory",
  //   activePath: [PATH_INVENTORY],
  //   path: PATH_INVENTORY,
  // },
  // {
  //   label: "Staff",
  //   icon: "Staff",
  //   activePath: [PATH_STAFF],
  //   path: PATH_STAFF,
  // },
  // {
  //   label: "Reports",
  //   icon: "Reports",
  //   activePath: [PATH_REPORTS],
  //   path: PATH_REPORTS,
  // },
  // {
  //   label: "Database Admin",
  //   icon: "Database",
  //   activePath: [PATH_DYNAMIC],
  //   path: PATH_DYNAMIC,
  // },
  // {
  //   label: "Settings",
  //   icon: "Settings",
  //   activePath: [PATH_SETTINGS],
  //   path: PATH_SETTINGS,
  // },
];

