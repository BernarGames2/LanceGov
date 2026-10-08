import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("sobre");

export default function Page() {
  return <ComingSoon slug="sobre" />;
}
