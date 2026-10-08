import { ComingSoon, comingSoonMetadata } from "@/components/coming-soon";

export const metadata = comingSoonMetadata("blog");

export default function Page() {
  return <ComingSoon slug="blog" />;
}
