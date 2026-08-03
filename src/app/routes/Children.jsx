import {
  PATH_LOGIN,
  PATH_FORGOT_PASSWORD,
  PATH_SIGNUP,
  PATH_ITEMS,
  PATH_ADD_ITEM,
  PATH_EDIT_ITEM,
  PATH_DASHBOARD,
  PATH_ORDERS,
  PATH_ORDER_COMPOSER,
  PATH_TABLES,
  PATH_BILLING,
  PATH_KITCHEN,
  PATH_STAFF,
  PATH_INVENTORY,
  PATH_REPORTS,
  PATH_SETTINGS,
  PATH_DYNAMIC,
} from "./pathname";

import Login from "../auth/Login";
import PorgotPassword from "../auth/PorgotPassword";
import SignUp from "../auth/SignUp";
import ItemListing from "../pages/items/ItemListing";
import AddItem from "../pages/items/AddItem";
import EditItem from "../pages/items/EditItem";

// Dashboard Modules (unchanged)
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import BillingSection from "../pages/billing/BillingSection";
import KitchenOrders from "../pages/kitchen/KitchenOrders";
import ReportsAnalytics from "../pages/reports/ReportsAnalytics";
import DynamicManager from "../pages/dynamic/DynamicManager";

// ── Refactored Modular Modules ──
import OrdersListing from "../pages/orders/OrdersListing";
import PosOrderComposer from "../pages/orders/PosOrderComposer";
import TablesListing from "../pages/tables/TablesListing";
import StaffListing from "../pages/staff/StaffListing";
import InventoryListing from "../pages/inventory/InventoryListing";
import SettingsPanel from "../pages/settings/SettingsPanel";

export const publicChildren = [
  {
    path: PATH_LOGIN,
    element: <Login />,
  },
  {
    path: PATH_FORGOT_PASSWORD,
    element: <PorgotPassword />,
  },
  {
    path: PATH_SIGNUP,
    element: <SignUp />,
  }
];

export const privateChildren = [
  {
    path: PATH_ITEMS,
    element: <ItemListing />,
  },
  {
    path: PATH_ADD_ITEM,
    element: <AddItem />,
  },
  {
    path: PATH_EDIT_ITEM,
    element: <EditItem />,
  },
  {
    path: PATH_DASHBOARD,
    element: <DashboardOverview />,
  },
  // ── Refactored modular routes ──
  {
    path: PATH_ORDERS,
    element: <OrdersListing />,
  },
  {
    path: PATH_ORDER_COMPOSER,
    element: <PosOrderComposer />,
  },
  {
    path: PATH_TABLES,
    element: <TablesListing />,
  },
  {
    path: PATH_STAFF,
    element: <StaffListing />,
  },
  {
    path: PATH_INVENTORY,
    element: <InventoryListing />,
  },
  {
    path: PATH_SETTINGS,
    element: <SettingsPanel />,
  },
  // ── Unchanged routes ──
  {
    path: PATH_BILLING,
    element: <BillingSection />,
  },
  {
    path: PATH_KITCHEN,
    element: <KitchenOrders />,
  },
  {
    path: PATH_REPORTS,
    element: <ReportsAnalytics />,
  },
  {
    path: PATH_DYNAMIC,
    element: <DynamicManager />,
  },
];
