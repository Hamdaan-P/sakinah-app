/**
 * TiswaAdminView — platform-admin dashboard for TiswaPage.
 */

import { motion } from 'framer-motion';
import {
  ChartBar, FileText, GearSix, GraduationCap, Megaphone, Pulse, Question,
  UsersThree, WarningCircle,
} from '@phosphor-icons/react';
import {
  NAVY_BG, NAVY_CARD, NAVY_BORDER, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN,
} from '../../_constants';
import { TISWA_ADMIN_ACTIVITY, URGENT_ITEMS } from '../../_data';

interface TiswaAdminViewProps {
  onChangeRole: () => void;
}

export function TiswaAdminView({ onChangeRole }: TiswaAdminViewProps) {
  return (
      <div style={{
        minHeight: '100vh',
        background: NAVY_BG,
        padding: '24px',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {/* Header with Role Switcher */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <button
              onClick={() => onChangeRole()}
              style={{
                background: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
                borderRadius: '8px',
                padding: '8px 16px',
                color: TEXT_SECONDARY,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Change Role
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Welcome Header */}
            <div style={{
              background: NAVY_CARD,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: CREAM,
                  marginBottom: '8px',
                }}>
                  Welcome, Dr. Abdul Rahman
                </h2>
                <p style={{ fontSize: '14px', color: TEXT_SECONDARY }}>
                  TISWA Platform Administrator
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: TEXT_MUTED }}>Platform Health</span>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  94%
                  <Pulse size={24} color="#10B981" />
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Pending School Approvals', value: '3', icon: GraduationCap, color: '#EF4444', badge: true },
                { label: 'Flagged Content', value: '5', icon: WarningCircle, color: '#F59E0B', badge: true },
                { label: 'Support Tickets', value: '12', icon: Question, color: '#3B82F6', badge: true },
                { label: 'Total UsersThree', value: '2,450', icon: UsersThree, color: '#10B981' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      background: NAVY_CARD,
                      borderRadius: '12px',
                      padding: '20px',
                      position: 'relative',
                    }}
                  >
                    {stat.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: stat.color,
                        color: CREAM,
                        borderRadius: '12px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        Urgent
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: `${stat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon size={20} color={stat.color} />
                      </div>
                      <span style={{ fontSize: '14px', color: TEXT_MUTED }}>{stat.label}</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: CREAM }}>
                      {stat.value}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* TISWA Network Overview */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
              }}>
                TISWA Network Overview
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}>
                {[
                  { label: 'Total Schools', value: '45', color: TISWA_GREEN },
                  { label: 'Total Teachers', value: '680', color: '#3B82F6' },
                  { label: 'Total Students', value: '12,400', color: '#10B981' },
                  { label: 'Total Resources', value: '890', color: '#8B5CF6' },
                  { label: 'Daily Active UsersThree', value: '1,200', color: '#F59E0B' },
                  { label: 'Platform Health', value: '94%', color: '#10B981' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      background: NAVY_CARD,
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '32px', fontWeight: '700', color: stat.color, marginBottom: '8px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '13px', color: TEXT_MUTED }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Administrative Functions */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
              }}>
                Administrative Functions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}>
                {[
                  { label: 'School Approvals', icon: GraduationCap, color: '#EF4444', badge: 3 },
                  { label: 'Content Moderation', icon: FileText, color: '#F59E0B', badge: 5 },
                  { label: 'Announcements', icon: Megaphone, color: '#3B82F6' },
                  { label: 'Analytics', icon: ChartBar, color: '#10B981' },
                  { label: 'Support Center', icon: Question, color: '#8B5CF6', badge: 12 },
                  { label: 'System GearSix', icon: GearSix, color: TEXT_MUTED },
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: NAVY_CARD,
                        border: `1px solid ${NAVY_BORDER}`,
                        borderRadius: '12px',
                        padding: '24px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = action.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = NAVY_BORDER;
                      }}
                    >
                      {action.badge && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: action.color,
                          color: CREAM,
                          borderRadius: '10px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '700',
                        }}>
                          {action.badge}
                        </div>
                      )}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: `${action.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <Icon size={28} color={action.color} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: CREAM, textAlign: 'center' }}>
                        {action.label}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Urgent Items */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <WarningCircle size={24} color="#EF4444" />
                Urgent Items
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {URGENT_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: NAVY_CARD,
                      borderRadius: '12px',
                      padding: '20px',
                      border: `2px solid ${item.priority === 'critical' ? '#EF4444' : '#F59E0B'}`,
                      display: 'flex',
                      alignItems: 'start',
                      gap: '16px',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: item.priority === 'critical' ? '#EF444420' : '#F59E0B20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <WarningCircle size={24} color={item.priority === 'critical' ? '#EF4444' : '#F59E0B'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: CREAM, marginBottom: '8px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: TEXT_SECONDARY, marginBottom: '16px' }}>
                        {item.description}
                      </p>
                      <button style={{
                        background: item.priority === 'critical' ? '#EF4444' : '#F59E0B',
                        color: CREAM,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}>
                        Take Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
              }}>
                Recent System Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TISWA_ADMIN_ACTIVITY.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      background: NAVY_CARD,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      border: `1px solid ${NAVY_BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activity.color,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', color: CREAM, fontWeight: '500' }}>
                        {activity.action}
                      </span>
                      <span style={{ fontSize: '14px', color: TEXT_SECONDARY }}> - {activity.item}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: TEXT_MUTED, whiteSpace: 'nowrap' }}>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}
