import { useId } from "react";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "color";
  onClick?: () => void;
  /** Icon-only mark for tight layouts (e.g. mobile header). */
  compact?: boolean;
}

const GREEN = "#005A3C";
const GOLD = "#E5A818";

/** Interlocking rings + crown + cart, matched to the brand mark. */
function LogoMark({
  green,
  gold,
  maskPrefix,
}: {
  green: string;
  gold: string;
  maskPrefix: string;
}) {
  // Equal rings; center distance ≈ 23.6 (from source trace)
  const g = { cx: 17.4, cy: 31.4 };
  const o = { cx: 41.0, cy: 31.8 };
  const r = 14.2;
  const stroke = 3.65;
  const greenMask = `${maskPrefix}-g`;
  const goldMask = `${maskPrefix}-o`;

  return (
    <g>
      <defs>
        {/* Cut green at top join so gold reads on top */}
        <mask id={greenMask} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="58" height="56" fill="white" />
          <path
            d={`M ${o.cx - 13.5} ${o.cy - 13.2} A ${r} ${r} 0 0 1 ${o.cx - 4} ${o.cy - 13.8}`}
            stroke="black"
            strokeWidth={stroke + 1.2}
            fill="none"
          />
        </mask>
        {/* Cut gold at bottom join so green reads on top */}
        <mask id={goldMask} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="58" height="56" fill="white" />
          <path
            d={`M ${g.cx + 9} ${g.cy + 10.8} A ${r} ${r} 0 0 1 ${g.cx + 13.8} ${g.cy + 3.5}`}
            stroke="black"
            strokeWidth={stroke + 1.2}
            fill="none"
          />
        </mask>
      </defs>

      <circle
        cx={g.cx}
        cy={g.cy}
        r={r}
        stroke={green}
        strokeWidth={stroke}
        fill="none"
        mask={`url(#${greenMask})`}
      />
      <circle
        cx={o.cx}
        cy={o.cy}
        r={r}
        stroke={gold}
        strokeWidth={stroke}
        fill="none"
        mask={`url(#${goldMask})`}
      />

      {/* Fleur-style crown on the top join */}
      <g fill={gold} transform="translate(29.2 16.4)">
        <path d="M0 -5.1 C-0.4 -3.0 -1.2 -1.85 0 -0.4 C1.2 -1.85 0.4 -3.0 0 -5.1 Z" />
        <path d="M0 -0.65 C-2.55 -1.9 -4.2 -0.25 -3.25 1.05 C-1.85 0.45 -0.6 -0.1 0 -0.65 Z" />
        <path d="M0 -0.65 C2.55 -1.9 4.2 -0.25 3.25 1.05 C1.85 0.45 0.6 -0.1 0 -0.65 Z" />
        <path d="M0 0.75 L0.8 2.4 L0 3.15 L-0.8 2.4 Z" />
      </g>

      {/*
        Cart traced from source:
        solid L-handle on top-left + trapezoid basket + two wheel dots.
        Scaled to leave clear padding inside the gold ring.
      */}
      <g fill={gold} transform={`translate(${o.cx} ${o.cy}) scale(0.78)`}>
        <path
          d="
            M -5.0 -3.95
            H -2.15
            V -1.15
            H 7.45
            Q 7.95 -1.15 7.8 -0.55
            L 5.35 4.65
            Q 5.15 5.1 4.6 5.1
            H -1.25
            Q -1.9 5.1 -2.05 4.5
            L -2.75 -1.0
            L -5.0 -2.85
            Q -5.3 -3.15 -5.3 -3.5
            V -3.7
            Q -5.3 -3.95 -5.0 -3.95
            Z
          "
        />
        <circle cx="-1.25" cy="7.25" r="1.35" />
        <circle cx="3.25" cy="7.3" r="1.35" />
      </g>
    </g>
  );
}

function LogoWordmark({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <path d="M62.2 17.2 C59.3 15.5 57.45 12.7 58.15 10.0 C59.65 11.3 61.35 13.5 63.65 15.35 C62.95 16.2 62.45 16.8 62.2 17.2 Z" />
      <text
        x="64"
        y="37"
        fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.4"
      >
        Tuyhona
      </text>
    </g>
  );
}

export default function Logo({
  size = "md",
  variant = "color",
  onClick,
  compact = false,
}: Props) {
  const maskPrefix = useId().replace(/:/g, "");
  const scales = { sm: 0.72, md: 1, lg: 1.25 };
  const s = scales[size];
  const width = Math.round((compact ? 58 : 220) * s);
  const height = Math.round(56 * s);

  const green = variant === "light" ? "#FFFFFF" : GREEN;
  const gold = GOLD;
  const text = variant === "light" ? "#FFFFFF" : GREEN;

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Tuyhona"
      className="shrink-0 select-none inline-flex items-center"
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "none",
        border: "none",
        padding: 0,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={compact ? "0 0 58 56" : "0 0 220 56"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block max-w-full h-auto"
        aria-hidden
      >
        <LogoMark green={green} gold={gold} maskPrefix={maskPrefix} />
        {!compact && <LogoWordmark fill={text} />}
      </svg>
    </button>
  );
}
