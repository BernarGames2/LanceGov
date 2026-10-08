import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("status");

export default function Page() {
  return <ComingSoon slug="status" />;
}
