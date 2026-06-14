/**
 * SchoolAdminView — school administrator dashboard for TiswaPage.
 */

import { motion } from 'framer-motion';
import {
  Calendar, ChartBar, ChatText, DownloadSimple, FileText, Globe,
  GraduationCap, Trophy, UserPlus, UsersThree,
} from '@phosphor-icons/react';
import {
  NAVY_BG, NAVY_CARD, NAVY_BORDER, GOLD, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN, TISWA_GREEN_LIGHT,
} from '../../_constants';
import { ADMIN_RECENT_ACTIVITY, NETWORK_SCHOOLS } from '../../_data';

interface SchoolAdminViewProps {
  onChangeRole: () => void;
}

export function SchoolAdminView({ onChangeRole }: SchoolAdminViewProps) {
  return (
      <div style={{
        minHeight: '100vh',
        background: NAVY_BG,
        padding: '24px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                  Al-Huda Islamic School
                </h2>
                <p style={{ fontSize: '14px', color: TEXT_SECONDARY }}>
                  School Administration Dashboard
                </p>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: GOLD,
                background: `${GOLD}20`,
                padding: '8px 16px',
                borderRadius: '8px',
              }}>
                PREMIUM
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Teachers', value: '24', icon: UsersThree, color: '#3B82F6' },
                { label: 'Students', value: '380', icon: GraduationCap, color: '#10B981' },
                { label: 'Teacher Requests', value: '5', icon: UserPlus, color: '#EF4444', badge: true },
                { label: 'Content Review', value: '8', icon: FileText, color: '#F59E0B', badge: true },
                { label: 'Network Followers', value: '12', icon: Globe, color: '#8B5CF6' },
                { label: 'Resource Downloads', value: '156', icon: DownloadSimple, color: GOLD },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
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
                        New
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

            {/* School Management */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
              }}>
                School Management
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                {[
                  { label: 'User Management', icon: UsersThree, color: '#3B82F6' },
                  { label: 'Content Review', icon: FileText, color: '#F59E0B', badge: 8 },
                  { label: 'Events', icon: Calendar, color: '#10B981' },
                  { label: 'Communications', icon: ChatText, color: '#8B5CF6' },
                  { label: 'Membership', icon: Trophy, color: GOLD },
                  { label: 'Reports & Analytics', icon: ChartBar, color: '#06B6D4' },
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

            {/* Partner Schools */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: CREAM,
                marginBottom: '16px',
              }}>
                Partner Schools
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}>
                {NETWORK_SCHOOLS.slice(1).map((school) => (
                  <div
                    key={school.id}
                    style={{
                      background: NAVY_CARD,
                      borderRadius: '12px',
                      padding: '20px',
                      border: `1px solid ${NAVY_BORDER}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${TISWA_GREEN} 0%, ${TISWA_GREEN_LIGHT} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: CREAM,
                        flexShrink: 0,
                      }}>
                        {school.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: CREAM,
                          marginBottom: '4px',
                        }}>
                          {school.name}
                        </h4>
                        <p style={{ fontSize: '13px', color: TEXT_MUTED }}>
                          {school.address}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Teachers</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: CREAM }}>{school.teachers}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Students</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: CREAM }}>{school.students}</div>
                      </div>
                    </div>
                    <button style={{
                      width: '100%',
                      background: school.connected ? NAVY_BORDER : TISWA_GREEN,
                      color: CREAM,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}>
                      {school.connected ? 'Connected' : 'Connect'}
                    </button>
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
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ADMIN_RECENT_ACTIVITY.map((activity) => (
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
                        {activity.user}
                      </span>
                      <span style={{ fontSize: '14px', color: TEXT_SECONDARY }}> {activity.action} </span>
                      <span style={{ fontSize: '14px', color: CREAM, fontWeight: '500' }}>
                        {activity.item}
                      </span>
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
