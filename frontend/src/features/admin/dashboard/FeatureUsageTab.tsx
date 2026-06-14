/**
 * Feature Usage tab — live activity feed, Raya query feed, and most-used features chart.
 *
 * Extracted from AdminPage.tsx.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircleDots, X } from '@phosphor-icons/react';
import { useAdminStore } from '../stores/admin.store';
import { Card, ChatHistoryPanel } from './primitives';
import { getTimeAgo } from './helpers';
import {
  BG, SURFACE, SURFACE_2, GOLD, GOLD_LIGHT, WHITE, TEXT_1, TEXT_2, TEXT_3, BORDER, CHART_COLORS,
} from './constants';

export function FeatureUsageTab() {
  const { featureUsage, featureFeed, recentQueries } = useAdminStore();
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUserName, setChatUserName] = useState('');

  return (
    <div className="space-y-8">
      {/* Chat History Modal */}
      <AnimatePresence>
        {chatUserId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- modal backdrop; explicit Close button handles a11y */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatUserId(null)} />
            <motion.div
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6"
              style={{ background: SURFACE, borderColor: BORDER, scrollbarWidth: 'thin', scrollbarColor: `${TEXT_3} transparent` }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: WHITE }}>
                  <ChatCircleDots size={20} weight="bold" className="inline mr-2" style={{ color: GOLD }} />
                  {chatUserName}'s Conversations
                </h3>
                <button
                  onClick={() => setChatUserId(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} weight="bold" style={{ color: TEXT_3 }} />
                </button>
              </div>
              <ChatHistoryPanel userId={chatUserId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Activity Feed */}
      <Card>
        <h3 className="text-lg font-bold mb-5" style={{ color: WHITE }}>Live Activity Feed</h3>
        {featureFeed.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: TEXT_3 }}>No activity yet. Data appears as users navigate the app.</p>
        ) : (
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${TEXT_3} transparent` }}>
            {featureFeed.map((item) => {
              const timeAgo = item.timestamp ? getTimeAgo(item.timestamp) : '';
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{ background: SURFACE_2 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: `${GOLD}22`, color: GOLD }}
                  >
                    {item.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: TEXT_1 }}>
                      <span className="font-bold" style={{ color: GOLD_LIGHT }}>{item.userName}</span>
                      {' visited '}
                      <span className="font-semibold" style={{ color: WHITE }}>{item.feature}</span>
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: TEXT_3 }}>{timeAgo}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Raya Queries */}
      <Card>
        <h3 className="text-lg font-bold mb-5" style={{ color: WHITE }}>
          <ChatCircleDots size={20} weight="bold" className="inline mr-2" style={{ color: GOLD }} />
          What Users Are Asking Raya
        </h3>
        {recentQueries.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: TEXT_3 }}>No chatbot queries yet.</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${TEXT_3} transparent` }}>
            {recentQueries.map((q) => {
              const timeAgo = q.timestamp ? getTimeAgo(q.timestamp) : '';
              return (
                <div
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  className="px-4 py-3 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-colors"
                  style={{ background: SURFACE_2 }}
                  onClick={() => { setChatUserId(q.userId); setChatUserName(q.userName); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChatUserId(q.userId); setChatUserName(q.userName); } }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${GOLD}22`, color: GOLD }}
                      >
                        {q.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold" style={{ color: GOLD_LIGHT }}>{q.userName}</span>
                    </div>
                    <span className="text-xs" style={{ color: TEXT_3 }}>{timeAgo}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_1 }}>"{q.query}"</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Most Used Features */}
      {featureUsage && featureUsage.features.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold mb-5" style={{ color: WHITE }}>Most Used Features</h3>
          <div className="space-y-2">
            {featureUsage.features.map((f, i) => {
              const maxVisits = featureUsage.features[0]?.visits || 1;
              const width = Math.max(8, (f.visits / maxVisits) * 100);
              return (
                <div key={f.name} className="flex items-center gap-4">
                  <span className="w-6 text-right text-xs font-bold" style={{ color: TEXT_3 }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color: WHITE }}>{f.name}</span>
                      <span className="text-xs font-medium" style={{ color: TEXT_2 }}>
                        {f.visits} views / {f.unique_users} users
                      </span>
                    </div>
                    <div className="h-6 rounded-lg overflow-hidden" style={{ background: `${BG}` }}>
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length], width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
