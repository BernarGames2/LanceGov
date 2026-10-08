import { cn } from "@/lib/utils";

/** Cor do medidor: verde (vai), âmbar (atenção) e vermelho (risco). */
export function notaColor(score: number) {
  if (score >= 70) return "var(--color-vitoria)";
  if (score >= 40) return "var(--color-prazo)";
  return "var(--color-risco)";
}

/** Medidor circular da Nota Lance, de 0 a 100. */
export function NotaLance({
  score,
  size = 72,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = Math.max(5, Math.round(size / 11));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div
      role="img"
      aria-label={`Nota Lance ${value} de 100`}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-linha)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={notaColor(value)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        aria-hidden
        className="numero absolute text-tinta"
        style={{ fontSize: Math.round(size * 0.32), lineHeight: 1 }}
      >
        {value}
      </span>
    </div>
  );
}
