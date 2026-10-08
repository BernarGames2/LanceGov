import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("entrar");

export default function Page() {
  return <ComingSoon slug="entrar" />;
}
