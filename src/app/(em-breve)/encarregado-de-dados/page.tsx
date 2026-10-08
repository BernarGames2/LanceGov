import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("encarregado-de-dados");

export default function Page() {
  return <ComingSoon slug="encarregado-de-dados" />;
}
