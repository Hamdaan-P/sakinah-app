/**
 * Role-selection landing for the TISWA page. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { GraduationCap, UsersThree, ShieldCheck } from '@phosphor-icons/react';
import {
  NAVY_BG,
  NAVY_CARD,
  NAVY_HOVER,
  NAVY_BORDER,
  CREAM,
  TEXT_SECONDARY,
  TEXT_MUTED,
  TISWA_GREEN,
  TISWA_GREEN_LIGHT,
} from '../_constants';
import type { UserRole } from '../_types';

interface Props {
  onSelectRole: (role: UserRole) => void;
}

const ROLES = [
  {
    id: 'student',
    icon: GraduationCap,
    name: 'Student',
    description: 'Access your assignments, grades, and study materials',
  },
  {
    id: 'teacher',
    icon: UsersThree,
    name: 'Teacher',
    description: 'Manage classes, students, and educational content',
  },
  {
    id: 'school-admin',
    icon: GraduationCap,
    name: 'School Admin',
    description: 'Administer school operations and manage users',
  },
  {
    id: 'tiswa-admin',
    icon: ShieldCheck,
    name: 'TISWA Admin',
    description: 'Oversee the entire TISWA network platform',
  },
];

export function TiswaRoleSelection({ onSelectRole }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY_BG,
      padding: '40px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            style={{
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${TISWA_GREEN} 0%, ${TISWA_GREEN_LIGHT} 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: `0 8px 32px ${TISWA_GREEN}40`,
            }}
          >
            <GraduationCap size={56} color={CREAM} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: CREAM,
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            TISWA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '18px',
              color: TEXT_SECONDARY,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Tamil Nadu Islamic Schools Welfare Association
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectRole(role.id as UserRole)}
                style={{
                  background: NAVY_CARD,
                  border: `2px solid ${NAVY_BORDER}`,
                  borderRadius: '16px',
                  padding: '32px 24px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = NAVY_HOVER;
                  e.currentTarget.style.borderColor = TISWA_GREEN;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = NAVY_CARD;
                  e.currentTarget.style.borderColor = NAVY_BORDER;
                }}
              >
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: `${TISWA_GREEN}20`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Icon size={36} color={TISWA_GREEN} />
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: CREAM,
                  marginBottom: '12px',
                }}>
                  {role.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: TEXT_MUTED,
                  lineHeight: '1.6',
                }}>
                  {role.description}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
