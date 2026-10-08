import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("carreiras");

export default function Page() {
  return <ComingSoon slug="carreiras" />;
}
