'use client';

/**
 * Logo SVG Minimalista para "Gana con la Cantrina"
 * Diseño: Calavera estilizada mexicana (La Catrina) con elementos minimalistas
 */

interface LaCantrinaLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function LaCantrinaLogo({
  className = '',
  width = 200,
  height = 60
}: LaCantrinaLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gana con la Cantrina Logo"
    >
      {/* Calavera Minimalista */}
      <g id="calavera">
        {/* Cráneo principal */}
        <ellipse
          cx="30"
          cy="30"
          rx="16"
          ry="18"
          fill="currentColor"
          opacity="0.95"
        />

        {/* Ojos */}
        <ellipse cx="24" cy="27" rx="3.5" ry="4.5" fill="white" />
        <ellipse cx="36" cy="27" rx="3.5" ry="4.5" fill="white" />

        {/* Nariz triangular */}
        <path
          d="M 30 32 L 27 37 L 33 37 Z"
          fill="white"
        />

        {/* Sonrisa característica */}
        <path
          d="M 22 40 Q 30 44 38 40"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dientes pequeños */}
        <line x1="26" y1="40" x2="26" y2="42" stroke="white" strokeWidth="1.5" />
        <line x1="30" y1="41" x2="30" y2="43" stroke="white" strokeWidth="1.5" />
        <line x1="34" y1="40" x2="34" y2="42" stroke="white" strokeWidth="1.5" />

        {/* Sombrero elegante (parte superior) */}
        <path
          d="M 14 18 Q 14 12 30 12 Q 46 12 46 18"
          fill="currentColor"
          opacity="0.9"
        />

        {/* Ala del sombrero */}
        <ellipse
          cx="30"
          cy="18"
          rx="20"
          ry="4"
          fill="currentColor"
          opacity="0.85"
        />

        {/* Flor decorativa en el sombrero */}
        <circle cx="40" cy="16" r="3" fill="#ef4444" opacity="0.9" />
        <circle cx="43" cy="15" r="2" fill="#f59e0b" opacity="0.8" />
      </g>

      {/* Texto "Gana con la Cantrina" */}
      <g id="texto">
        <text
          x="60"
          y="30"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16"
          fontWeight="700"
          fill="currentColor"
          letterSpacing="-0.5"
        >
          Gana con la
        </text>
        <text
          x="60"
          y="48"
          fontFamily="Georgia, serif"
          fontSize="18"
          fontWeight="700"
          fill="currentColor"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          Cantrina
        </text>
      </g>
    </svg>
  );
}
