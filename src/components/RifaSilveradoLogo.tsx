export function RifaSilveradoLogo({ className = "", width = 40, height = 40 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo de fondo con gradiente */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Fondo circular dorado */}
      <circle cx="50" cy="50" r="48" fill="url(#goldGradient)"/>

      {/* Borde exterior oscuro */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#000" strokeWidth="2"/>

      {/* Letra R grande y bold en el centro */}
      <text
        x="50"
        y="70"
        fontSize="64"
        fontWeight="900"
        fill="#000"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      >
        R
      </text>

      {/* Estrella pequeña arriba derecha */}
      <path
        d="M 70 22 L 72 28 L 78 28 L 73 32 L 75 38 L 70 34 L 65 38 L 67 32 L 62 28 L 68 28 Z"
        fill="url(#redGradient)"
        opacity="0.9"
      />
    </svg>
  );
}
