/**
 * Single form-field renderer for the debt-restructuring form sections.
 *
 * Handles three input variants — textarea, currency-prefixed input, and
 * percentage-suffixed input — plus the standard text/email/tel/date
 * cases. Phase 5 split — extracted from DebtRestructuringPage.tsx with
 * no behaviour change.
 */

interface FieldShape {
  type: string;
  label: string;
}

interface Props {
  field: FieldShape;
  value: string;
  onChange: (value: string) => void;
}

export function FormField({ field, value, onChange }: Props) {
  const baseInputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#10151F',
    border: '1px solid rgba(212,168,83,0.2)',
    borderRadius: '8px',
    color: '#F5E8C7',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        style={{
          ...baseInputStyle,
          minHeight: '100px',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#14B8A6'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)'}
      />
    );
  }

  const prefix = field.type === 'currency' ? '₹ ' : '';
  const suffix = field.type === 'percentage' ? ' %' : '';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute',
          left: '16px',
          color: '#7A7363',
          fontSize: '15px',
          pointerEvents: 'none',
        }}>
          {prefix}
        </span>
      )}
      <input
        type={field.type === 'currency' || field.type === 'percentage' ? 'text' : field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        style={{
          ...baseInputStyle,
          paddingLeft: prefix ? '36px' : '16px',
          paddingRight: suffix ? '36px' : '16px',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#14B8A6'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)'}
      />
      {suffix && (
        <span style={{
          position: 'absolute',
          right: '16px',
          color: '#7A7363',
          fontSize: '15px',
          pointerEvents: 'none',
        }}>
          {suffix}
        </span>
      )}
    </div>
  );
}
