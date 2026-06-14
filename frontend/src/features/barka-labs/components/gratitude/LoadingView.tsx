/**
 * Loading view shown while the AI scores / decomposes a submitted blessing.
 */

import { useTranslation } from 'react-i18next';
import { C } from '../../barka-labs.constants';

interface LoadingViewProps {
  submitting: boolean;
}

export function LoadingView({ submitting }: LoadingViewProps) {
  const { t } = useTranslation('demo');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0 32px' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `3px solid ${C.cardB}`,
          borderTopColor: C.gold,
          animation: 'gratSpin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: 15, color: C.t2, marginTop: 20, fontWeight: 500 }}>
        {submitting ? t('gratitude.analyzing') : t('gratitude.decomposing')}
      </p>
      <p style={{ fontSize: 12, color: C.t3, marginTop: 6 }}>
        {t('gratitude.aiScoring')}
      </p>
      <style>{`@keyframes gratSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
