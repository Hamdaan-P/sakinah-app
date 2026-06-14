/**
 * Total/Verified/Unverified ring stats for the Reports tab. Phase 5
 * split.
 */

const ITEMS = [
  { label: 'Total Hosts', value: 28, color: '#3B82F6' },
  { label: 'Verified', value: 20, color: '#10B981' },
  { label: 'Unverified', value: 8, color: '#FB923C' },
];

export function ReportsHostsOverview() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: '#F5E8C7', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Hosts Overview
      </h3>
      <div
        style={{
          background: '#10151F',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {ITEMS.map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: `4px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  background: `${item.color}10`,
                }}
              >
                <span style={{ color: item.color, fontSize: '24px', fontWeight: '600' }}>
                  {item.value}
                </span>
              </div>
              <div style={{ color: '#C9C0A8', fontSize: '14px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
