import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/media")({
  beforeLoad: () => {
    // Cloudinary media storage is restricted to admin backend database operations only
    throw redirect({ to: "/" });
  },
  component: () => null,
});
