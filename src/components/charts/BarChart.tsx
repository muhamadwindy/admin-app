type BarDatum = { label: string; success: number; failed: number };

export function LoginActivityChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.success + d.failed));
  const width = 560;
  const height = 160;
  const groupWidth = width / data.length;
  const barWidth = 14;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full" role="img" aria-label="Grafik aktivitas login 7 hari terakhir">
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={width}
          y1={height - height * f}
          y2={height - height * f}
          stroke="currentColor"
          className="text-ink-100"
          strokeWidth={1}
        />
      ))}
      {data.map((d, i) => {
        const cx = i * groupWidth + groupWidth / 2;
        const successH = (d.success / max) * (height - 10);
        const failedH = (d.failed / max) * (height - 10);
        return (
          <g key={d.label}>
            <rect x={cx - barWidth - 2} y={height - successH} width={barWidth} height={successH} rx={2} className="fill-brand-500" />
            <rect x={cx + 2} y={height - failedH} width={barWidth} height={failedH} rx={2} className="fill-bad-600/70" />
            <text x={cx} y={height + 18} textAnchor="middle" className="fill-ink-400 text-[10px]">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
