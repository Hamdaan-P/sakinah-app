/**
 * Initial path-selection screen for the debt-restructuring flow.
 *
 * Phase 5 split — extracted from DebtRestructuringPage.tsx. No behaviour
 * change; same DOM, same styling, same animations.
 */

import { motion } from 'framer-motion';
import { Buildings, User, Info } from '@phosphor-icons/react';
import { DisclaimerBanner } from '@/components/shared';
import { PathSelectionCard } from './PathSelectionCard';

interface Props {
  onSelectPath: (path: 'company' | 'personal') => void;
}

export function SelectionView({ onSelectPath }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10151F 0%, #14B8A6 50%, #10151F 100%)',
      padding: '48px 24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#F5E8C7',
            marginBottom: '16px',
          }}>
            Debt Restructuring
          </h1>
          <p style={{ fontSize: '20px', color: '#C9C0A8' }}>
            Shariah-Compliant Financial Solutions
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: '#10151F',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '48px',
            border: '1px solid rgba(212,168,83,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Info size={24} color="#14B8A6" style={{ flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#F5E8C7',
                marginBottom: '8px',
              }}>
                About Debt Restructuring
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#C9C0A8',
                lineHeight: '1.6',
              }}>
                Our Shariah-compliant debt restructuring service helps individuals and businesses
                reorganize their financial obligations without interest-based solutions (riba). Based on
                AAOIFI Shariah Standards — SS 19 (Qard/Interest-Free Loans), SS 8 (Murabahah),
                SS 9 (Ijarah), and SS 12 (Musharakah) — we provide expert guidance to create
                sustainable repayment plans that align with Islamic principles.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px',
        }}>
          <PathSelectionCard
            delay={0.2}
            fromLeft
            hoverBorder="#3B82F6"
            iconGradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
            Icon={Buildings}
            title="For Companies"
            description="Complex business debt restructuring for companies seeking Shariah-compliant solutions to reorganize their financial obligations and improve cash flow."
            ctaColor="#3B82F6"
            onClick={() => onSelectPath('company')}
          />
          <PathSelectionCard
            delay={0.3}
            fromLeft={false}
            hoverBorder="#10B981"
            iconGradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            Icon={User}
            title="For Individuals"
            description="Personal debt management solutions designed to help individuals overcome financial challenges while adhering to Islamic financial principles."
            ctaColor="#10B981"
            onClick={() => onSelectPath('personal')}
          />
        </div>
      </motion.div>

      <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: '0' }}>
        <DisclaimerBanner contentId="FINANCIAL" variant="banner" />
      </div>
    </div>
  );
}
