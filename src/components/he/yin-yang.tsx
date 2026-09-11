type Props = {
  score: number | null;
  size?: number;
  className?: string;
};

export function YinYang({ score, size = 120, className }: Props) {
  const yang = score == null ? 0.5 : Math.min(1, Math.max(0, (score - 1) / 9));
  const rot = (yang - 0.5) * 72;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <circle cx="50" cy="50" r="48.5" fill="#f2ebe0" stroke="#1c1914" strokeWidth="1.5" />
      <path
        d="M50 1.5a48.5 48.5 0 0 1 0 97 24.25 24.25 0 0 1 0-48.5 24.25 24.25 0 0 0 0-48.5Z"
        fill="#1c1914"
      />
      <circle cx="50" cy="25.75" r="7" fill="#f2ebe0" />
      <circle cx="50" cy="74.25" r="7" fill="#1c1914" />
    </svg>
  );
}
