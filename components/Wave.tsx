export function Wave({
  className = "",
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <path
        fill={fill}
        d="M0,64 C120,96 240,112 360,96 C480,80 600,32 720,32 C840,32 960,80 1080,96 C1200,112 1320,96 1440,72 L1440,120 L0,120 Z"
      />
    </svg>
  );
}
