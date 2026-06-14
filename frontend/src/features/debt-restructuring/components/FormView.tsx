/**
 * Multi-section form view for the debt-restructuring flow.
 *
 * Wires together the header, progress bar, and the accordion list of
 * form sections. Phase 5 split — extracted from
 * DebtRestructuringPage.tsx; no behaviour change.
 */

import { motion } from 'framer-motion';
import { FormHeader } from './FormHeader';
import { FormSectionAccordion } from './FormSectionAccordion';
import type { CompanyFormData, FormSection, PathType, PersonalFormData } from '../_types';

interface Props {
  pathType: PathType;
  sections: FormSection[];
  form: CompanyFormData | PersonalFormData;
  expandedSection: number;
  progress: number;
  onSetExpanded: (id: number) => void;
  onBack: () => void;
  onChange: (key: string, value: string) => void;
  onSaveDraft: () => void;
  onGenerateReport: () => void;
}

export function FormView({
  pathType,
  sections,
  form,
  expandedSection,
  progress,
  onSetExpanded,
  onBack,
  onChange,
  onSaveDraft,
  onGenerateReport,
}: Props) {
  const formRecord = form as unknown as Record<string, string>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10151F 0%, #14B8A6 50%, #10151F 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <FormHeader
          pathType={pathType}
          progress={progress}
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onGenerateReport={onGenerateReport}
        />

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#10151F',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(212,168,83,0.2)',
            marginBottom: '24px',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '15px', color: '#C9C0A8', fontWeight: '600' }}>
              Form Progress
            </span>
            <span style={{ fontSize: '18px', color: '#14B8A6', fontWeight: '700' }}>
              {progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#10151F',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #14B8A6 0%, #0d9488 100%)',
                borderRadius: '4px',
              }}
            />
          </div>
        </motion.div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((section, index) => (
            <FormSectionAccordion
              key={section.id}
              section={section}
              index={index}
              isExpanded={expandedSection === section.id}
              formRecord={formRecord}
              onToggle={() => onSetExpanded(expandedSection === section.id ? 0 : section.id)}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
