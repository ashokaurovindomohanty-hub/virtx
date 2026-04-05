import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "./components/Footer";
import { MisaWidget } from "./components/MisaWidget";
import { Navbar } from "./components/Navbar";
import { I18nProvider } from "./contexts/I18nContext";
import { SecurityProvider } from "./contexts/SecurityContext";
import { useIsCallerAdmin } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { NetworkingPage } from "./pages/NetworkingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SecurityAuditPage } from "./pages/SecurityAuditPage";
import { SponsorsPage } from "./pages/SponsorsPage";
import { TestDebugPage } from "./pages/TestDebugPage";
import { VirtualRoomPage } from "./pages/VirtualRoomPage";

// Root layout component
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MisaWidget />
      <Toaster />
    </div>
  );
}

// Admin guard — requires isCallerAdmin === true
function AdminGuard({ children }: { children: ReactNode }) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center">
        <div
          className="glass-panel rounded-2xl p-8 max-w-sm w-full space-y-4"
          data-ocid="admin.loading_state"
        >
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-bg min-h-screen pt-16 flex items-center justify-center px-4">
        <div
          className="glass-panel rounded-2xl p-8 max-w-sm w-full text-center"
          data-ocid="admin.access_denied.panel"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="font-display font-bold text-xl mb-2 text-destructive">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You don’t have permission to access the Admin Portal.
          </p>
          <Link to="/">
            <button
              type="button"
              className="btn-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white w-full flex items-center justify-center gap-2"
              data-ocid="admin.access_denied.home.button"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Route tree
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: EventsPage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id",
  component: EventDetailPage,
});

const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms/$id",
  component: VirtualRoomPage,
});

const networkingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/networking",
  component: NetworkingPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const sponsorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sponsors",
  component: SponsorsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  ),
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  component: () => (
    <AdminGuard>
      <SecurityAuditPage />
    </AdminGuard>
  ),
});

const testDebugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/test-debug",
  component: TestDebugPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsRoute,
  eventDetailRoute,
  roomRoute,
  networkingRoute,
  profileRoute,
  leaderboardRoute,
  analyticsRoute,
  sponsorsRoute,
  adminRoute,
  securityRoute,
  testDebugRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <SecurityProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </SecurityProvider>
  );
}
