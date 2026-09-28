import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/dub/studio";

export const Route = createFileRoute("/")({
  component: Studio,
});
