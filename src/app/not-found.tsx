import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return <EmptyState title="Page not found" body="We couldn't find that page. It may have moved." href="/" action="Back to home" />;
}
