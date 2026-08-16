import { cn } from "@/lib/utils";

// Anel circular de score 0-100. Não existia nada circular no repositório
// (só a barra linear de PerformanceDash). A faixa de cor segue a mesma regra
// de src/components/planejamentos/BmadScoreCard.tsx, mas usando os tokens
// semânticos (success/warning/danger) em vez do amber-50/amber-700 cru que
// estava ali fora do design system.
function scoreVariant(score: number) {
  if (score >= 70) return { ring: "stroke-success-text", text: "text-success-text" };
  if (score >= 40) return { ring: "stroke-warning-text", text: "text-warning-text" };
  return { ring: "stroke-danger-text", text: "text-danger-text" };
}

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, label, size = 96, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const { ring, text } = scoreVariant(clamped);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-hairline"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", ring)}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("rotate-90 font-bold fill-current", text)}
          style={{ transformOrigin: "center", fontSize: size * 0.26 }}
        >
          {clamped}
        </text>
      </svg>
      <span className="text-xs text-muted text-center">{label}</span>
    </div>
  );
}
