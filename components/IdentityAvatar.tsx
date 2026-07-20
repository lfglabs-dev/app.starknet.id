type Props = {
  tokenId: string;
  size?: number;
  className?: string;
};

export function IdentityAvatar({ tokenId, size = 56, className }: Props) {
  let seed = 0n;
  try {
    seed = BigInt(tokenId);
  } catch {
    // Keep zero seed for malformed display-only values.
  }
  const hue = Number(seed % 360n);
  const secondary = (hue + 78) % 360;
  const cells = Array.from({ length: 15 }, (_, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const on = ((seed >> BigInt(index)) & 1n) === 1n;
    return on
      ? [
          <rect key={`${row}-${column}`} x={column * 10 + 6} y={row * 10 + 6} width="8" height="8" rx="2" />,
          ...(column < 2
            ? [<rect key={`${row}-mirror-${column}`} x={(4 - column) * 10 + 6} y={row * 10 + 6} width="8" height="8" rx="2" />]
            : []),
        ]
      : [];
  }).flat();
  return (
    <svg
      aria-label={`Local identicon for identity ${tokenId}`}
      className={className ? `identicon ${className}` : "identicon"}
      width={size}
      height={size}
      viewBox="0 0 62 62"
      role="img"
    >
      <defs>
        <linearGradient id={`avatar-${tokenId}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={`hsl(${hue} 82% 58%)`} />
          <stop offset="1" stopColor={`hsl(${secondary} 80% 48%)`} />
        </linearGradient>
      </defs>
      <rect width="62" height="62" rx="18" fill={`url(#avatar-${tokenId})`} />
      <g fill="rgba(255,255,255,.88)">{cells}</g>
    </svg>
  );
}
