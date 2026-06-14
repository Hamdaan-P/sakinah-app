import { useEffect } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';

export function S12_TafakkurSit() {
  const go = useBarakahFlow((s) => s.go);
  const duration = useBarakahFlow((s) => s.tafDuration);
  const seed = useBarakahFlow((s) => s.tafSeed);
  const setEndedNaturally = useBarakahFlow((s) => s.setTafSessionEndedNaturally);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setEndedNaturally(true);
      go('s13');
    }, duration * 60_000);
    return () => window.clearTimeout(t);
  }, [duration, go, setEndedNaturally]);

  return (
    <div className="bk-screen">
      <div className="bk-taf-sit">
        <div className="bk-taf-sit-light" />
        <div className="bk-taf-sit-prompt">
          {seed?.prompt ?? 'Sit with whatever comes.'}
        </div>
        <button
          className="bk-taf-end-btn"
          onClick={() => {
            setEndedNaturally(false);
            go('s13');
          }}
        >
          end early
        </button>
      </div>
    </div>
  );
}
