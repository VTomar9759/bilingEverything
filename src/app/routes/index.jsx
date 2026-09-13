import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import useOrgData from "../hooks/useOrgData";
import Loading from "../../loader/Loading";
import Layout, { layoutType } from "../layout";
import PageNotFound from "../utils/pagenotFound";
import { privateChildren, publicChildren, withoutSidenave } from "./Children";
import {
  PATH_DASHBOARD,
  PATH_LOGIN,
  PATH_CATEGORIES,
  PATH_TABLES,
  PATH_ITEMS,
  PATH_ADD_ITEM,
  PATH_EDIT_ITEM,
  PATH_ORDERS,
  PATH_ORDER_COMPOSER,
  PATH_ORDER_EDIT,
  PATH_BILLING,
  PATH_SETTINGS,
} from "./pathname";
import ErrorElement from "../utils/ErrorElement";

const ROUTE_PERMISSION_MAP = {
  [PATH_DASHBOARD]: "dashboard",
  [PATH_CATEGORIES]: "categories",
  [PATH_TABLES]: "tables",
  [PATH_ITEMS]: "items_catalog",
  [PATH_ADD_ITEM]: "items_catalog",
  [PATH_EDIT_ITEM]: "items_catalog",
  [PATH_ORDERS]: "orders",
  [PATH_ORDER_COMPOSER]: "orders",
  [PATH_ORDER_EDIT]: "orders",
  [PATH_BILLING]: "billing",
};

const PublicRoute = ({ children, isAuthenticated,permissionDashboard }) => {
  if (isAuthenticated) {
    if(!permissionDashboard){
      return <Navigate to={PATH_SETTINGS} replace />;
    }
    return <Navigate to={PATH_DASHBOARD} replace />;
  }

  return children;
};

const PrivateRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to={PATH_LOGIN} replace />;
  }

  return children;
};

const AppRouter = () => {
  const { token, userData, permission } = useOrgData();
  const isAuthenticated = !!token && !!userData;

  const filteredPrivateChildren = privateChildren.filter((item) => {
    if (!permission) return true;
    const permKey = ROUTE_PERMISSION_MAP[item.path];
    if (!permKey) return true;
    const itemPerm = permission[permKey];
    if (itemPerm && itemPerm.view === false) {
      return false;
    }
    return true;
  });

  const router = createBrowserRouter([
    // Public Layout
    {
      element: (
        <PublicRoute isAuthenticated={isAuthenticated} >
          <Layout type={layoutType.public} />
        </PublicRoute>
      ),
      children: publicChildren,
      errorElement: <ErrorElement />,
    },

    // Private Layout
    {
      element: (
        <PrivateRoute isAuthenticated={isAuthenticated} permissionDashboard={permission?.dashboard?.view}>
          <Layout type={layoutType.private} />
        </PrivateRoute>
      ),
      children: filteredPrivateChildren,
      errorElement: <ErrorElement />,
    },

    // Without Sidebar Layout (Header-only)
    {
      element: (
        <PrivateRoute isAuthenticated={isAuthenticated}>
          <Layout type={layoutType.withoutSidebar} />

        </PrivateRoute>
      ),
      children: withoutSidenave,
      errorElement: <ErrorElement />,
    },

    // 404
    {
      path: "*",
      element: <PageNotFound />,
    },
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
