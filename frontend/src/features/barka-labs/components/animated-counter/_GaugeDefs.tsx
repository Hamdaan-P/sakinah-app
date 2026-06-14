/**
 * SVG <defs> (gradients + filters) used by SpeedoGauge. Split out so the
 * gauge component itself stays focused on layout + animation wiring.
 */

interface Props {
  uid: string;
}

export function GaugeDefs({ uid }: Props) {
  return (
    <defs>
      <radialGradient id={`${uid}-bgGlow`} cx="50%" cy="90%" r="60%">
        <stop offset="0%" stopColor="rgba(215,181,106,0.06)" />
        <stop offset="100%" stopColor="rgba(215,181,106,0)" />
      </radialGradient>

      <linearGradient id={`${uid}-fillGrad`} x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#2A9D6F" />
        <stop offset="30%" stopColor="#4AAF7F" />
        <stop offset="50%" stopColor="#D7B56A" />
        <stop offset="75%" stopColor="#E8A94A" />
        <stop offset="100%" stopColor="#FF6B35" />
      </linearGradient>

      <filter id={`${uid}-needleGlow`}>
        <feGaussianBlur stdDeviation="3" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id={`${uid}-arcGlow`}>
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <radialGradient id={`${uid}-dotGlow`}>
        <stop offset="0%" stopColor="#D7B56A" />
        <stop offset="60%" stopColor="#D7B56A" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#D7B56A" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
