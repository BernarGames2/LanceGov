import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("parceiros");

export default function Page() {
  return <ComingSoon slug="parceiros" />;
}
