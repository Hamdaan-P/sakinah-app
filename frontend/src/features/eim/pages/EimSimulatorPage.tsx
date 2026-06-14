/**
 * Simulator — list of portfolios + create-portfolio modal.
 * Persists to localStorage via the EIM Zustand store.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, CaretRight, Plus, TrashSimple } from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { SimulationModePill } from '../components/SimulationModePill';
import { useEimDinarz } from '../hooks/useEimDinarz';
import { useEimStore } from '../stores/eim.store';
import { useAuthStore } from '@/core/stores/auth.store';

export function EimSimulatorPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id) ?? 'anonymous';
  const portfolios = useEimStore((s) => s.portfolios);
  const createPortfolio = useEimStore((s) => s.createPortfolio);
  const deletePortfolio = useEimStore((s) => s.deletePortfolio);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { claim: claimDinarz } = useEimDinarz();

  const handleCreate = () => {
    if (!newName.trim()) return;
    // Track first-portfolio-ever based on the client-side portfolio count BEFORE
    // the create. Server-side idempotency guarantees only one award even if the
    // client miscalculates (e.g. cleared localStorage but already claimed).
    const wasFirst = portfolios.length === 0;
    const p = createPortfolio(newName.trim(), userId);
    if (wasFirst) {
      void claimDinarz('first_portfolio');
    }
    setNewName('');
    setCreating(false);
    navigate(`/eim/portfolio/${p.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · The Sandbox
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Portfolio</h1>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-[#0A0E16]"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            <Plus size={14} weight="bold" /> New
          </button>
        </header>

        <SimulationModePill />
        <DisclaimerBanner />

        <div className="px-3 mt-4 space-y-2.5">
          {portfolios.length === 0 && !creating && (
            <div className="rounded-2xl border border-dashed border-[rgba(212,168,83,0.25)] p-6 text-center">
              <div className="text-[16px] font-bold text-[#F5E8C7] mb-1">
                No portfolios yet
              </div>
              <div className="text-[12px] text-[#7A7363] mb-4">
                Build a virtual portfolio with real (delayed) prices. No real money — just learning.
              </div>
              <button
                onClick={() => setCreating(true)}
                className="h-11 px-5 rounded-xl text-[13px] font-bold text-[#0A0E16]"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                Create your first portfolio
              </button>
            </div>
          )}

          {creating && (
            <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4">
              <label htmlFor="eim-sim-portfolio-name" className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
                Portfolio name
              </label>
              <input
                id="eim-sim-portfolio-name"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: this is the create-portfolio prompt the user just triggered
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g., My halal long-term portfolio"
                className="w-full mt-2 h-11 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] focus:outline-none focus:border-[rgba(212,168,83,0.50)]"
              />
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16]"
                  style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {portfolios.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 flex items-center gap-3"
            >
              <button
                onClick={() => navigate(`/eim/portfolio/${p.id}`)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-[14px] font-bold text-[#F5E8C7]">{p.name}</div>
                <div className="text-[11px] text-[#7A7363] mt-0.5">
                  {p.positions.length} position{p.positions.length === 1 ? '' : 's'} ·{' '}
                  Created {new Date(p.created_at).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${p.name}"? This cannot be undone.`)) deletePortfolio(p.id);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C5749] hover:text-[#E84393] hover:bg-[rgba(232,67,147,0.10)]"
              >
                <TrashSimple size={14} weight="bold" />
              </button>
              <button
                onClick={() => navigate(`/eim/portfolio/${p.id}`)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D4A853]"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EimSimulatorPage;
