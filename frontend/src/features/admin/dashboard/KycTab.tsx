/**
 * KYC tab — completion funnel, Iman level distribution, and KYC breakdowns.
 *
 * Extracted from AdminPage.tsx.
 */

import { motion } from 'framer-motion';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAdminStore } from '../stores/admin.store';
import { Card, HBarChart } from './primitives';
import { pct } from './helpers';
import { BG, GOLD, WHITE, TEXT_1, TEXT_3, BORDER } from './constants';

export function KycTab() {
  const { kycFunnel } = useAdminStore();
  if (!kycFunnel) return null;

  const funnelData = kycFunnel.funnel;
  const maxCount = funnelData.length > 0 ? funnelData[0].count : 1;

  return (
    <div className="space-y-8">
      {/* Funnel */}
      <Card>
        <h3 className="text-lg font-bold mb-6" style={{ color: WHITE }}>KYC Completion Funnel</h3>
        <div className="space-y-4">
          {funnelData.map((stage, i) => {
            const width = Math.max(15, (stage.count / maxCount) * 100);
            const colors = [GOLD, '#F59E0B', '#10B981'];
            return (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold" style={{ color: TEXT_1 }}>{stage.stage}</span>
                  <span className="text-base font-black" style={{ color: WHITE }}>
                    {stage.count}
                    {i > 0 && <span className="text-sm font-medium ml-2" style={{ color: TEXT_3 }}>({pct(stage.count, maxCount)})</span>}
                  </span>
                </div>
                <div className="h-10 rounded-xl overflow-hidden" style={{ background: `${BG}` }}>
                  <motion.div
                    className="h-full rounded-xl"
                    style={{ background: colors[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Iman level */}
      {kycFunnel.iman_histogram.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: WHITE }}>Iman Level Distribution</h3>
            {kycFunnel.avg_iman_level !== null && (
              <span className="text-base font-black px-4 py-2 rounded-xl" style={{ background: `${GOLD}15`, color: GOLD }}>
                Average: {kycFunnel.avg_iman_level}/100
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kycFunnel.iman_histogram} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: TEXT_3, fontSize: 12, fontWeight: 600 }} axisLine={false} />
              <YAxis tick={{ fill: TEXT_3, fontSize: 12, fontWeight: 600 }} axisLine={false} />
              <Tooltip contentStyle={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, color: WHITE, fontSize: 14 }} />
              <Bar dataKey="count" fill={GOLD} radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HBarChart data={kycFunnel.intent_breakdown} title="Primary Intents" />
        <HBarChart data={kycFunnel.stress_breakdown} title="Biggest Stressors" />
        <HBarChart data={kycFunnel.money_motivation_breakdown} title="Money Motivation" />
        <HBarChart data={kycFunnel.crisis_instinct_breakdown} title="Crisis Instincts" />
        <HBarChart data={kycFunnel.advice_style_breakdown} title="Advice Style" />
      </div>
    </div>
  );
}
