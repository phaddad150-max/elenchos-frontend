interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniSparkline({
  values,
  width = 72,
  height = 22,
  color = "var(--cyan)",
  className = "",
}: Props) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 2;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;
  const step = innerW / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + innerH - ((v - min) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1]!;
  const prev = values[values.length - 2]!;
  const up = last >= prev;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.85}
      />
      <circle
        cx={pad + (values.length - 1) * step}
        cy={pad + innerH - ((last - min) / span) * innerH}
        r="2"
        fill={up ? "var(--emerald-signal)" : "var(--rose-signal)"}
      />
    </svg>
  );
}