import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("imprensa");

export default function Page() {
  return <ComingSoon slug="imprensa" />;
}
