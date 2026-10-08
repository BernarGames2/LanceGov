import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("para-empresas");

export default function Page() {
  return <ComingSoon slug="para-empresas" />;
}
