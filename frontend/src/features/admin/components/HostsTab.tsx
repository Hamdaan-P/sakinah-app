/**
 * Hosts tab — search + filter pills + grid + detail dialog. Phase 5
 * split.
 */

import { motion } from 'framer-motion';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { HostCard } from './HostCard';
import { HostDetailDialog } from './HostDetailDialog';
import type { Host, HostFilter } from '../_types';

interface Props {
  searchQuery: string;
  hostFilter: HostFilter;
  filteredHosts: Host[];
  selectedHost: Host | null;
  onChangeSearch: (v: string) => void;
  onChangeFilter: (f: HostFilter) => void;
  onSelectHost: (host: Host | null) => void;
  onToggleVerify: (host: Host) => void;
}

export function HostsTab({
  searchQuery,
  hostFilter,
  filteredHosts,
  selectedHost,
  onChangeSearch,
  onChangeFilter,
  onSelectHost,
  onToggleVerify,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#F5E8C7', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Host Management
        </h2>
        <p style={{ color: '#7A7363', fontSize: '14px' }}>
          Manage event hosts and verification status
        </p>
      </div>

      {/* Search and Funnel */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MagnifyingGlass
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#7A7363' }}
          />
          <input
            type="text"
            placeholder="Search hosts..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#10151F',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRadius: '10px',
              padding: '12px 12px 12px 44px',
              color: '#F5E8C7',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'verified', 'unverified'] as const).map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangeFilter(filter)}
              style={{
                background: hostFilter === filter ? '#161D2C' : '#10151F',
                color: hostFilter === filter ? '#F5E8C7' : '#7A7363',
                padding: '12px 20px',
                borderRadius: '10px',
                border: `1px solid ${hostFilter === filter ? '#D4A853' : 'rgba(212,168,83,0.2)'}`,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Funnel size={14} />
              {filter}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        initial="hidden"
        animate="show"
      >
        {filteredHosts.map((host) => (
          <HostCard key={host.id} host={host} onSelect={onSelectHost} />
        ))}
      </motion.div>

      <HostDetailDialog
        host={selectedHost}
        onClose={() => onSelectHost(null)}
        onToggleVerify={onToggleVerify}
      />
    </motion.div>
  );
}
