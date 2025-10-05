export function RifaSilveradoLogo({ className = "", width = 40, height = 40 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fondo circular */}
      <circle cx="100" cy="100" r="95" fill="#1a1a1a" stroke="#fbbf24" strokeWidth="3"/>

      {/* Camioneta estilizada */}
      <g transform="translate(50, 80)">
        {/* Carrocería principal */}
        <rect x="10" y="20" width="80" height="30" rx="3" fill="#fbbf24"/>

        {/* Cabina */}
        <path d="M 15 20 L 15 10 L 45 10 L 50 20 Z" fill="#fbbf24"/>

        {/* Ventanas */}
        <rect x="18" y="12" width="12" height="6" fill="#1a1a1a"/>
        <rect x="32" y="12" width="10" height="6" fill="#1a1a1a"/>

        {/* Parrilla frontal */}
        <rect x="10" y="25" width="3" height="20" fill="#dc2626"/>
        <line x1="11.5" y1="28" x2="11.5" y2="42" stroke="#1a1a1a" strokeWidth="1"/>

        {/* Ruedas */}
        <circle cx="30" cy="50" r="8" fill="#1a1a1a" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="30" cy="50" r="4" fill="#dc2626"/>

        <circle cx="70" cy="50" r="8" fill="#1a1a1a" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="70" cy="50" r="4" fill="#dc2626"/>

        {/* Detalles de luz */}
        <circle cx="12" cy="30" r="2" fill="#fef3c7"/>
        <circle cx="12" cy="38" r="2" fill="#fca5a5"/>
      </g>

      {/* Letra R estilizada */}
      <text
        x="100"
        y="155"
        fontSize="48"
        fontWeight="900"
        fill="#fbbf24"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        R
      </text>

      {/* Estrella decorativa */}
      <path
        d="M 100 25 L 105 35 L 115 35 L 107 42 L 110 52 L 100 45 L 90 52 L 93 42 L 85 35 L 95 35 Z"
        fill="#fbbf24"
      />
    </svg>
  );
}
