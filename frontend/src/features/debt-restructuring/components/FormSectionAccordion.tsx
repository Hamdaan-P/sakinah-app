/**
 * Single accordion card for a debt-restructuring form section.
 * Phase 5 split — extracted from FormView.tsx.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, CaretUp, CheckCircle } from '@phosphor-icons/react';
import { FormField } from './FormField';
import type { FormSection } from '../_types';

interface Props {
  section: FormSection;
  index: number;
  isExpanded: boolean;
  formRecord: Record<string, string>;
  onToggle: () => void;
  onChange: (key: string, value: string) => void;
}

export function FormSectionAccordion({
  section,
  index,
  isExpanded,
  formRecord,
  onToggle,
  onChange,
}: Props) {
  const Icon = section.icon;
  const sectionFields = section.fields.filter((f) => f.required).length;
  const filledFields = section.fields.filter(
    (f) => f.required && formRecord[f.key]?.trim(),
  ).length;
  const sectionComplete = sectionFields === filledFields;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: '#10151F',
        borderRadius: '12px',
        border: `2px solid ${isExpanded ? section.color : 'rgba(212,168,83,0.2)'}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Section Header */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isExpanded ? `${section.color}15` : 'transparent',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: section.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={24} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#F5E8C7',
              marginBottom: '4px',
            }}>
              {section.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#7A7363' }}>
              {filledFields} of {sectionFields} required fields completed
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {sectionComplete && <CheckCircle size={24} color="#10B981" />}
          {isExpanded ? (
            <CaretUp size={24} color="#C9C0A8" />
          ) : (
            <CaretDown size={24} color="#C9C0A8" />
          )}
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '24px',
              borderTop: '1px solid rgba(212,168,83,0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#C9C0A8',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    {field.label}
                    {field.required && (
                      <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                    )}
                  </label>
                  <FormField
                    field={field}
                    value={formRecord[field.key]}
                    onChange={(value: string) => onChange(field.key, value)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
