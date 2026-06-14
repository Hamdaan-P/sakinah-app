/**
 * Static "Initial Recommendations" callout shared between the company
 * and personal PDF report variants. Phase 5 split.
 */

interface Props {
  bullets: string[];
}

export function ReportRecommendations({ bullets }: Props) {
  return (
    <div style={{
      background: '#EFF6FF',
      border: '1px solid #93C5FD',
      borderRadius: '8px',
      padding: '24px',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: '16px',
      }}>
        Initial Recommendations
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {bullets.map((text, i) => (
          <li
            key={i}
            style={{
              fontSize: '15px',
              color: '#1E40AF',
              marginBottom: i === bullets.length - 1 ? 0 : '12px',
              paddingLeft: '24px',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', left: 0, top: '2px' }}>•</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
