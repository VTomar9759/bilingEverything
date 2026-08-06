import { Navigate } from "react-router-dom";
import {
  PATH_LOGIN,
  PATH_FORGOT_PASSWORD,
  PATH_SIGNUP,
  PATH_ITEMS,
  PATH_ADD_ITEM,
  PATH_EDIT_ITEM,
  PATH_CATEGORIES,
  PATH_DASHBOARD,
  PATH_ORDERS,
  PATH_ORDER_COMPOSER,
  PATH_TABLES,
  PATH_BILLING,
  PATH_SETTINGS,
  PATH_SETTINGS_PROFILE,
  PATH_CHANGE_PASSWORD,
  PATH_SETTINGS_BUSINESS,
} from "./pathname";

import Login from "../auth/Login";
import PorgotPassword from "../auth/PorgotPassword";
import SignUp from "../auth/SignUp";
import ItemListing from "../pages/items/ItemListing";
import AddItem from "../pages/items/AddItem";
import EditItem from "../pages/items/EditItem";
import CategoriesListing from "../pages/categories/Cateogies";

import DashboardOverview from "../pages/dashboard/DashboardOverview";
import BillingSection from "../pages/billing/BillingSection";

import OrdersListing from "../pages/orders/OrdersListing";
import PosOrderComposer from "../pages/orders/PosOrderComposer";
import TablesListing from "../pages/tables/TablesListing";

import SettingsLayout from "../pages/settings/Settings";
import ProfileUpdate from "../pages/settings/componests/ProfileUpdate";
import ChangePassword from "../pages/settings/componests/changePassword";
import BusinessDetails from "../pages/settings/componests/BusinessDetails";

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
  },
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
    path: PATH_CATEGORIES,
    element: <CategoriesListing />,
  },
  {
    path: PATH_DASHBOARD,
    element: <DashboardOverview />,
  },
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
    path: PATH_BILLING,
    element: <BillingSection />,
  },
  {
    path: PATH_SETTINGS,
    element: <SettingsLayout />,
    children: [
      {
        path: "",
        element: <Navigate to={PATH_SETTINGS_PROFILE} replace />,
      },
      {
        path: PATH_SETTINGS_PROFILE,
        element: <ProfileUpdate />,
      },
      {
        path: PATH_CHANGE_PASSWORD,
        element: <ChangePassword />,
      },
      {
        path: PATH_SETTINGS_BUSINESS,
        element: <BusinessDetails />,
      },
    ],
  },
];
