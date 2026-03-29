import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import ChatBot from "./components/ChatBot";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";

function RequireAdmin() {
  const isAdmin = localStorage.getItem("mediverse_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <Outlet />;
}

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
      {!isAdminRoute && <ChatBot />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
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
