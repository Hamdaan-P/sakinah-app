/**
 * AssignmentDetailModal — full-screen overlay for inspecting a single
 * assignment, with optional grade/feedback panel and submit button.
 */

import { motion } from 'framer-motion';
import { X, PaperPlaneRight } from '@phosphor-icons/react';
import {
  NAVY_CARD, NAVY_HOVER, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN, SUBJECT_COLORS,
} from '../../_constants';
import { ASSIGNMENTS_DATA } from '../../_data';

interface AssignmentDetailModalProps {
  assignment: typeof ASSIGNMENTS_DATA[0];
  onClose: () => void;
}

export function AssignmentDetailModal({ assignment, onClose }: AssignmentDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: NAVY_CARD,
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: `1px solid ${NAVY_BORDER}`,
        }}
      >
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${NAVY_BORDER}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
        }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: CREAM, marginBottom: '8px' }}>
              {assignment.title}
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: `${SUBJECT_COLORS[assignment.subject]}20`,
                color: SUBJECT_COLORS[assignment.subject],
              }}>
                {assignment.subject}
              </span>
              <span style={{ fontSize: '14px', color: TEXT_MUTED }}>
                Due: {assignment.dueDate}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: TEXT_MUTED,
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <X size={24} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: TEXT_MUTED, marginBottom: '8px' }}>
              Description
            </h4>
            <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: '1.6' }}>
              {assignment.description}
            </p>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: TEXT_MUTED, marginBottom: '8px' }}>
              Instructions
            </h4>
            <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: '1.6' }}>
              {assignment.instructions}
            </p>
          </div>
          {assignment.grade !== null && (
            <div style={{
              background: `${NAVY_HOVER}80`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '8px' }}>Grade</div>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: assignment.grade >= 90 ? '#10B981' : assignment.grade >= 75 ? '#3B82F6' : '#F59E0B',
                marginBottom: '12px',
              }}>
                {assignment.grade}/100
              </div>
              {assignment.feedback && (
                <>
                  <div style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '8px' }}>Teacher Feedback</div>
                  <p style={{ fontSize: '15px', color: TEXT_SECONDARY, lineHeight: '1.6' }}>
                    {assignment.feedback}
                  </p>
                </>
              )}
            </div>
          )}
          {assignment.status === 'pending' && (
            <button style={{
              width: '100%',
              background: TISWA_GREEN,
              color: CREAM,
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <PaperPlaneRight size={18} />
              Submit Assignment
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
