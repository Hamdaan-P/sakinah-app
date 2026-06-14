/**
 * TutorialDetailModal — full-screen modal showing the steps/content for a
 * single tutorial, with a mark-complete CTA.
 */

import { motion } from 'framer-motion';
import { X, Sparkle, Clock, TrendUp, Check } from '@phosphor-icons/react';
import type { Tutorial } from '../../_supportData';
import { getTutorialTypeColor, getDifficultyColor } from './_helpers';

interface TutorialDetailModalProps {
  tutorial: Tutorial;
  completed: boolean;
  onClose: () => void;
  onToggleCompletion: () => void;
}

export function TutorialDetailModal({
  tutorial, completed, onClose, onToggleCompletion,
}: TutorialDetailModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0, 0.7)', zIndex: 1000,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '700px', maxHeight: '90vh',
          background: '#10151F', borderRadius: '16px',
          border: '1px solid rgba(212,168,83,0.2)',
          padding: '32px', zIndex: 1001, overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '6px 14px', borderRadius: '6px',
                  background: `${getTutorialTypeColor(tutorial.type)}20`,
                  color: getTutorialTypeColor(tutorial.type),
                  fontSize: '13px', fontWeight: '600',
                }}
              >
                {tutorial.type}
              </span>
              <span
                style={{
                  padding: '6px 14px', borderRadius: '6px',
                  background: `${getDifficultyColor(tutorial.difficulty)}20`,
                  color: getDifficultyColor(tutorial.difficulty),
                  fontSize: '13px', fontWeight: '600',
                }}
              >
                {tutorial.difficulty}
              </span>
              {tutorial.isFeatured && (
                <span
                  style={{
                    padding: '6px 14px', borderRadius: '6px',
                    background: '#D4A85320', color: '#D4A853',
                    fontSize: '13px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <Sparkle size={12} />
                  FEATURED
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#F5E8C7', margin: 0 }}>{tutorial.title}</h2>
            <p style={{ fontSize: '16px', color: '#C9C0A8', marginTop: '12px' }}>{tutorial.description}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <span style={{ fontSize: '14px', color: '#C9C0A8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                {tutorial.duration}
              </span>
              <span style={{ fontSize: '14px', color: '#C9C0A8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendUp size={16} />
                {tutorial.views} views
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#161D2C', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: '16px',
            }}
          >
            <X size={20} style={{ color: '#C9C0A8' }} />
          </button>
        </div>

        {/* Tutorial Content */}
        {tutorial.steps && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Steps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tutorial.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: '#161D2C', borderRadius: '12px',
                    border: '1px solid rgba(212,168,83,0.2)',
                    display: 'flex', gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#D4A853', color: '#10151F',
                      fontSize: '16px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: '15px', color: '#C9C0A8', lineHeight: '1.6' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tutorial.content && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#F5E8C7', marginBottom: '16px' }}>Content</h3>
            <div
              style={{
                padding: '20px',
                background: '#161D2C', borderRadius: '12px',
                border: '1px solid rgba(212,168,83,0.2)',
                fontSize: '15px', color: '#C9C0A8', lineHeight: '1.7',
              }}
            >
              {tutorial.content}
            </div>
          </div>
        )}

        {/* Mark Complete Button */}
        <button
          onClick={onToggleCompletion}
          style={{
            width: '100%', marginTop: '24px', padding: '14px',
            background: completed
              ? 'transparent'
              : 'linear-gradient(135deg, #00A885 0%, #008F6F 100%)',
            border: completed ? '1px solid rgba(212,168,83,0.2)' : 'none',
            borderRadius: '8px',
            color: completed ? '#C9C0A8' : '#FFFFFF',
            fontSize: '16px', fontWeight: '600',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Check size={18} />
          {completed ? 'Completed' : 'Mark as Complete'}
        </button>
      </motion.div>
    </>
  );
}
