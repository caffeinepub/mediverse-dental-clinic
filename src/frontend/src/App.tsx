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
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import Plans from "./pages/Plans";

function RequireAdmin() {
  const isAdmin = localStorage.getItem("mediverse_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <Outlet />;
}

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");
  const isPlansRoute = pathname === "/plans";
  const isPaymentRoute =
    pathname === "/payment-success" || pathname === "/payment-failure";
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
      {!isAdminRoute && !isPlansRoute && !isPaymentRoute && <ChatBot />}
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

const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plans",
  component: Plans,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
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
  plansRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
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
