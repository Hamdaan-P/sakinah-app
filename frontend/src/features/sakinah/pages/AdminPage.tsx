/**
 * SakinahAdminPage — /sakinah/admin
 * Internal safety review queue. Requires AdminGuard.
 * Shows pending sakinah_safety reports; admin can ban or dismiss.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSafetyReports, reviewReport } from '../services/sakinahService';

type SafetyReport = {
  report_id: string;
  reporter_uid: string;
  reported_uid: string;
  reason: string;
  status: string;
  created_at: string;
};

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

function Tag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, borderRadius: 8, padding: '3px 9px',
        background: highlight ? 'rgba(220,80,80,.08)' : 'rgba(255,255,255,.04)',
        border: `1px solid ${highlight ? 'rgba(220,80,80,.18)' : 'rgba(255,255,255,.07)'}`,
      }}
    >
      <span style={{ color: '#5f6675' }}>{label}:</span>
      <span
        style={{
          color: highlight ? '#f08080' : '#9aa0ac',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function SakinahAdminPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    getSafetyReports()
      .then((data) => setReports(data as SafetyReport[]))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (reportId: string, action: 'ban' | 'dismiss') => {
    setActingOn(reportId);
    try {
      await reviewReport(reportId, action);
      setReports((prev) => prev.filter((r) => r.report_id !== reportId));
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh', background: PAGE_BG,
        color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased', padding: '36px 56px 60px',
      }}
    >
      <div style={{ maxWidth: 680 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(212,168,83,.16)',
              background: 'transparent', color: '#D4A853',
              fontSize: 18, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              flexShrink: 0, paddingBottom: 1, lineHeight: 1,
            }}
          >
            ‹
          </button>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.02 }}>
              Safety Reports
            </div>
            <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
              Sakinah · pending reviews
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto', fontSize: 11, color: '#5f6675',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {loading ? '…' : `${reports.length} pending`}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ color: '#5f6675', fontSize: 13 }}>Loading reports…</div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '32px 24px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16, background: 'rgba(255,255,255,.012)',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 10, color: '#7FB07A' }}>✓</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, marginBottom: 6 }}>
              No pending reports
            </div>
            <div style={{ fontSize: 12, color: '#5f6675', fontWeight: 300 }}>
              All reports have been reviewed.
            </div>
          </motion.div>
        )}

        {/* Report list */}
        <AnimatePresence>
          {reports.map((r, i) => (
            <motion.div
              key={r.report_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12, scale: 0.98 }}
              transition={{ duration: 0.28, delay: i * 0.04 }}
              style={{
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 14, padding: '16px 18px',
                marginBottom: 10,
                background: 'rgba(255,255,255,.015)',
              }}
            >
              {/* Tags row */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                <Tag label="Reporter" value={r.reporter_uid} />
                <Tag label="Reported" value={r.reported_uid} />
                <Tag label="Reason" value={r.reason} highlight />
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: '#5f6675', marginBottom: 14 }}>
                {new Date(r.created_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleAction(r.report_id, 'ban')}
                  disabled={actingOn === r.report_id}
                  style={{
                    padding: '7px 20px', borderRadius: 20,
                    background: 'rgba(220,80,80,.1)',
                    border: '1px solid rgba(220,80,80,.25)',
                    color: actingOn === r.report_id ? '#5f6675' : '#f08080',
                    fontSize: 12, cursor: actingOn === r.report_id ? 'default' : 'pointer',
                    fontFamily: "'Manrope', sans-serif", transition: '.18s',
                  }}
                >
                  {actingOn === r.report_id ? '…' : 'Ban'}
                </button>
                <button
                  onClick={() => handleAction(r.report_id, 'dismiss')}
                  disabled={actingOn === r.report_id}
                  style={{
                    padding: '7px 20px', borderRadius: 20,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,.08)',
                    color: actingOn === r.report_id ? '#5f6675' : '#9aa0ac',
                    fontSize: 12, cursor: actingOn === r.report_id ? 'default' : 'pointer',
                    fontFamily: "'Manrope', sans-serif", transition: '.18s',
                  }}
                >
                  {actingOn === r.report_id ? '…' : 'Dismiss'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default SakinahAdminPage;
