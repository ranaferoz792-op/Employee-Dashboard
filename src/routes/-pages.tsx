import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Route as IndexRouteImport } from "./index";
import AppShell from "./-AppShell";
import Dashboard from "../components/Dashboard";
import LeaveApplication from "../components/LeaveApplication";
import ApplicationStatus from "../components/ApplicationStatus";
import { pageRoutes } from "./-pagePaths";

function childPath(route: string) {
  return route.replace(/^\//, "");
}

const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as never);

export const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "appShell",
  component: AppShell,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: childPath(pageRoutes.dashboard),
  component: Dashboard,
});

export const leaveApplicationRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: childPath(pageRoutes.leaveApplication),
  component: LeaveApplication,
});

export const applicationStatusRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: childPath(pageRoutes.applicationStatus),
  component: ApplicationStatus,
});
export const routeTree = rootRoute.addChildren([
  IndexRoute,
  appShellRoute.addChildren([
    dashboardRoute,
    leaveApplicationRoute,
    applicationStatusRoute,
  ]),
]);