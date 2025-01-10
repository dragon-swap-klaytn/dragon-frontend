export default function Loading({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      width={size}
      height={size}
      style={{ shapeRendering: "auto", display: "block", background: "transparent" }}
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
    >
      <g>
        <circle
          strokeDasharray="188.49555921538757 64.83185307179586"
          r="40"
          strokeWidth="8"
          stroke="currentColor"
          fill="none"
          cy="50"
          cx="50"
        >
          <animateTransform
            keyTimes="0;1"
            values="0 50 50;360 50 50"
            dur="1s"
            repeatCount="indefinite"
            type="rotate"
            attributeName="transform"
          />
        </circle>
        <g />
      </g>
    </svg>
  );
}
