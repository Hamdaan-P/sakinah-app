/**
 * Mizan Mirror — upload page (EIM Phase F1.a).
 *
 * Single-broker UX at launch (Zerodha Kite). Drop-zone or file picker →
 * POST /api/eim/mirror/upload → POST /api/eim/mirror/run → navigate to
 * the report viewer with the upload_id (polled there).
 *
 * F1.a uses a *poll* shape rather than waiting on the run response
 * because the FIFO is fast but the F1.b/c bias + LLM passes are not.
 * Keeping the contract identical now means no refactor when detectors
 * land.
 */

import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CaretLeft, UploadSimple, FileCsv, Warning } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { eimService } from '../services/eim.service';
import type { MirrorBroker } from '../types/eim.types';

const SUPPORTED_BROKERS: { id: MirrorBroker; label: string; help: string }[] = [
  {
    id: 'zerodha_kite',
    label: 'Zerodha Kite',
    help: 'Console → Reports → Tradebook → Download CSV',
  },
];

export function EimMirrorUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [broker, setBroker] = useState<MirrorBroker>('zerodha_kite');
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('Pick a CSV first.');
      const upload = await eimService.uploadTradeCsv(selectedFile, broker);
      await eimService.runMirror(upload.upload_id);
      return upload;
    },
    onSuccess: (upload) => {
      navigate(`/eim/mirror/report?upload=${encodeURIComponent(upload.upload_id)}`);
    },
  });

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      uploadMutation.reset();
      alert('Mirror needs a .csv tradebook. Other formats not supported yet.');
      return;
    }
    setSelectedFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onPickFile(f ?? null);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6EAF0] pb-24">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/eim/mirror')}
          className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center"
          aria-label="Back"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Upload tradebook</h1>
      </div>

      <DisclaimerBanner />

      <div className="px-4 mt-6 space-y-5">
        <div>
          <p className="block text-[11px] uppercase tracking-wider text-[#7A8595] mb-2">
            Broker
          </p>
          <div className="space-y-2">
            {SUPPORTED_BROKERS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBroker(b.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  broker === b.id
                    ? 'border-[#D4A853] bg-[rgba(212,168,83,0.06)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <div className="text-[14px] font-semibold">{b.label}</div>
                <div className="text-[11.5px] text-[#7A7363] mt-0.5">{b.help}</div>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#7A8595] mt-2">
            More brokers will be added as Mirror rolls out beyond the India launch.
          </p>
        </div>

        <div>
          <p className="block text-[11px] uppercase tracking-wider text-[#7A8595] mb-2">
            Tradebook CSV
          </p>
          <button
            type="button"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-[#D4A853] bg-[rgba(212,168,83,0.06)]'
                : selectedFile
                  ? 'border-[#D4A853]/60 bg-[rgba(212,168,83,0.03)]'
                  : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2.5">
                <FileCsv size={22} weight="duotone" className="text-[#D4A853]" />
                <div className="text-left">
                  <div className="text-[13px] font-semibold">{selectedFile.name}</div>
                  <div className="text-[11px] text-[#7A8595]">
                    {(selectedFile.size / 1024).toFixed(1)} KB · tap to change
                  </div>
                </div>
              </div>
            ) : (
              <>
                <UploadSimple size={26} weight="duotone" className="text-[#D4A853] mx-auto" />
                <p className="text-[13px] font-medium mt-3">Drop your CSV here</p>
                <p className="text-[11.5px] text-[#7A8595] mt-1">
                  or tap to browse · 5MB max
                </p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {uploadMutation.isError && (
          <div className="rounded-xl border border-[rgba(239,83,80,0.3)] bg-[rgba(239,83,80,0.06)] p-3 flex items-start gap-2">
            <Warning size={16} weight="bold" className="text-[#EF5350] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#E6EAF0]">
              {(uploadMutation.error as Error)?.message ?? 'Upload failed.'}
            </p>
          </div>
        )}

        <button
          onClick={() => uploadMutation.mutate()}
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full rounded-2xl bg-[#D4A853] text-[#0B0F14] font-semibold py-4 hover:bg-[#E0C07A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending ? 'Uploading & running pipeline…' : 'Run Mirror analysis'}
        </button>

        <p className="text-[11px] text-[#7A8595] leading-relaxed text-center">
          Mirror processes your trades server-side. Raw rows are never sent to
          any language model. Use the &ldquo;Delete all my Mirror data&rdquo;
          button on the Mirror home page to purge at any time.
        </p>
      </div>
    </div>
  );
}
