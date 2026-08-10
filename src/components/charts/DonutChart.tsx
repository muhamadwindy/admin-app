type Datum = { label: string; value: number; colorClass: string };

export function DonutChart({ data }: { data: Datum[] }) {
  const total = Math.max(1, data.reduce((sum, d) => sum + d.value, 0));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" width={112} height={112} role="img" aria-label="Grafik pengajuan berdasarkan status">
        <circle cx={60} cy={60} r={radius} fill="none" strokeWidth={16} className="stroke-ink-100" />
        {data.map((d) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const circle = (
            <circle
              key={d.label}
              cx={60}
              cy={60}
              r={radius}
              fill="none"
              strokeWidth={16}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className={d.colorClass}
              transform="rotate(-90 60 60)"
            />
          );
          offset += dash;
          return circle;
        })}
        <text x={60} y={56} textAnchor="middle" className="fill-ink-900 text-[20px] font-semibold font-mono">
          {total}
        </text>
        <text x={60} y={72} textAnchor="middle" className="fill-ink-400 text-[9px] uppercase tracking-wide">
          Total
        </text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-[12.5px]">
            <span className={`h-2 w-2 rounded-full ${d.colorClass.replace("stroke-", "bg-")}`} />
            <span className="text-ink-500">{d.label}</span>
            <span className="font-mono font-medium text-ink-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
