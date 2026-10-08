import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("contato");

export default function Page() {
  return <ComingSoon slug="contato" />;
}
