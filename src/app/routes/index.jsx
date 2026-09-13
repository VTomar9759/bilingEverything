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
import { PATH_DASHBOARD, PATH_LOGIN } from "./pathname";
import ErrorElement from "../utils/ErrorElement";
import OnlyQueue from "../only-queue/OnlyQueue";

const PublicRoute = ({ children, isAuthenticated }) => {
  if (isAuthenticated) {
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
  const { token, userData } = useOrgData();
  const isAuthenticated = !!token && !!userData;

  const router = createBrowserRouter([
    // Public Layout
    {
      element: (
        <PublicRoute isAuthenticated={isAuthenticated}>
          <Layout type={layoutType.public} />
        </PublicRoute>
      ),
      children: publicChildren,
      errorElement: <ErrorElement />,
    },

    // Private Layout
    {
      element: (
        <PrivateRoute isAuthenticated={isAuthenticated}>
          <Layout type={layoutType.private} />
        </PrivateRoute>
      ),
      children: privateChildren,
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
