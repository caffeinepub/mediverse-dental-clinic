import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";

function RequireAdmin() {
  const isAdmin = localStorage.getItem("mediverse_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminGuardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: RequireAdmin,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  path: "/dashboard",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  adminGuardRoute.addChildren([adminDashboardRoute]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
