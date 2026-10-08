import { cn } from "@/lib/utils";

/** Wordmark: "LanceGov" em Fraunces, com "Lance" grifado. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif text-[22px] font-semibold tracking-tight text-tinta", className)}>
      <span className="grifo grifo-fixo">Lance</span>Gov
    </span>
  );
}
