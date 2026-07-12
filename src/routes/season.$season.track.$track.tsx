import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/season/$season/track/$track")({
  component: () => <Outlet />,
});
