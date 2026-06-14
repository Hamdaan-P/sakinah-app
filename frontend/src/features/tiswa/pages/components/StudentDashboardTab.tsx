/**
 * StudentDashboardTab — welcome + stats + network/feed/resources pane for
 * the student role inside TiswaPage.
 */

import { motion } from 'framer-motion';
import {
  BookOpen, ChatText, ClipboardText, DownloadSimple, FileText,
  GraduationCap, CheckCircle, TrendUp, Trophy,
} from '@phosphor-icons/react';
import {
  NAVY_CARD, NAVY_BORDER, GOLD, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN, TISWA_GREEN_LIGHT, SUBJECT_COLORS,
} from '../../_constants';
import { NETWORK_SCHOOLS, NETWORK_FEED, SHARED_RESOURCES } from '../../_data';

interface StudentDashboardTabProps {
  setSelectedResource: (r: typeof SHARED_RESOURCES[0] | null) => void;
}

export function StudentDashboardTab({ setSelectedResource }: StudentDashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Welcome Header */}
      <div style={{
        background: NAVY_CARD,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${TISWA_GREEN} 0%, ${TISWA_GREEN_LIGHT} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: '600',
          color: CREAM,
        }}>
          AI
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: CREAM,
            marginBottom: '8px',
          }}>
            Welcome back, Ahmad Ibrahim
          </h2>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
            color: TEXT_SECONDARY,
          }}>
            <span>Class: 10-A</span>
            <span>Section: Science</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Pending Assignments', value: '5', icon: ClipboardText, color: '#F59E0B', badge: true },
          { label: 'Overall Grade', value: '87%', icon: Trophy, color: '#10B981', badge: false },
          { label: 'Attendance', value: '92%', icon: CheckCircle, color: '#3B82F6', badge: false },
          { label: 'Achievement Points', value: '450', icon: Trophy, color: GOLD, badge: false },
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

      {/* TISWA Network Schools */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: CREAM,
          marginBottom: '16px',
        }}>
          TISWA Network Schools
        </h3>
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          {NETWORK_SCHOOLS.map((school) => (
            <div
              key={school.id}
              style={{
                background: NAVY_CARD,
                borderRadius: '12px',
                padding: '20px',
                minWidth: '300px',
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
                <div>
                  <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Resources</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: CREAM }}>{school.resources}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Followers</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: CREAM }}>{school.followers}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: school.membership === 'PREMIUM' ? GOLD : TEXT_MUTED,
                  background: school.membership === 'PREMIUM' ? `${GOLD}20` : `${TEXT_MUTED}20`,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}>
                  {school.membership}
                </span>
                <button style={{
                  background: school.connected ? NAVY_BORDER : TISWA_GREEN,
                  color: CREAM,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}>
                  {school.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: CREAM,
          marginBottom: '16px',
        }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {[
            { label: 'Assignments', icon: ClipboardText, color: '#3B82F6' },
            { label: 'Study Materials', icon: BookOpen, color: '#10B981' },
            { label: 'Practice Tests', icon: FileText, color: '#8B5CF6' },
            { label: 'Progress', icon: TrendUp, color: '#F59E0B' },
            { label: 'Competitions', icon: Trophy, color: '#EC4899' },
            { label: 'Class Chat', icon: ChatText, color: '#06B6D4' },
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
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = NAVY_BORDER;
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${action.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={24} color={action.color} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: CREAM }}>
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Network Feed */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: CREAM,
          marginBottom: '16px',
        }}>
          Network Feed
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {NETWORK_FEED.map((item) => (
            <div
              key={item.id}
              style={{
                background: NAVY_CARD,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${NAVY_BORDER}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: `${TISWA_GREEN}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <GraduationCap size={20} color={TISWA_GREEN} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: CREAM, marginBottom: '2px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: TEXT_MUTED }}>
                        {item.school}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: TEXT_MUTED, whiteSpace: 'nowrap' }}>
                      {item.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: TEXT_SECONDARY, lineHeight: '1.5' }}>
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Resources */}
      <div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: CREAM,
          marginBottom: '16px',
        }}>
          Shared Resources
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SHARED_RESOURCES.map((resource) => (
            <div
              key={resource.id}
              style={{
                background: NAVY_CARD,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${NAVY_BORDER}`,
              }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: `${SUBJECT_COLORS[resource.subject]}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FileText size={24} color={SUBJECT_COLORS[resource.subject]} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: CREAM, marginBottom: '8px' }}>
                    {resource.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: TEXT_SECONDARY, marginBottom: '12px', lineHeight: '1.5' }}>
                    {resource.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: `${SUBJECT_COLORS[resource.subject]}20`,
                      color: SUBJECT_COLORS[resource.subject],
                    }}>
                      {resource.subject}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: `${TEXT_MUTED}20`,
                      color: TEXT_MUTED,
                    }}>
                      {resource.grade}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: `${TEXT_MUTED}20`,
                      color: TEXT_MUTED,
                    }}>
                      {resource.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: TEXT_MUTED }}>
                      {resource.downloads} downloads • {resource.uploader} • {resource.school}
                    </div>
                    <button
                      onClick={() => setSelectedResource(resource)}
                      style={{
                        background: TISWA_GREEN,
                        color: CREAM,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <DownloadSimple size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
