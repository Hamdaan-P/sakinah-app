/**
 * TeacherDashboardTab — teacher home pane with welcome + stats + actions +
 * network feed + activity + shared resources.
 */

import { motion } from 'framer-motion';
import {
  Bell, BookOpen, Calendar, ChatText, DownloadSimple, FileText,
  TrendUp, Trophy, UploadSimple, UserPlus, UsersThree,
} from '@phosphor-icons/react';
import {
  NAVY_CARD, NAVY_BORDER, GOLD, CREAM,
  TEXT_SECONDARY, TEXT_MUTED, TISWA_GREEN, TISWA_GREEN_LIGHT, SUBJECT_COLORS,
} from '../../_constants';
import { NETWORK_SCHOOLS, SHARED_RESOURCES, TEACHER_RECENT_ACTIVITY } from '../../_data';

export function TeacherDashboardTab() {
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
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: CREAM,
          marginBottom: '8px',
        }}>
          Welcome back, Fatima Begum
        </h2>
        <p style={{ fontSize: '14px', color: TEXT_SECONDARY }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: "Today's Classes", value: '4', icon: Calendar, color: '#3B82F6' },
          { label: 'Total Students', value: '120', icon: UsersThree, color: '#10B981' },
          { label: 'Pending Requests', value: '3', icon: Bell, color: '#EF4444', badge: true },
          { label: 'New Messages', value: '7', icon: ChatText, color: '#8B5CF6' },
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {[
            { label: 'Student Approvals', icon: UserPlus, color: '#EF4444', badge: 3 },
            { label: 'Student Management', icon: UsersThree, color: '#3B82F6' },
            { label: 'Classes & Schedule', icon: Calendar, color: '#10B981' },
            { label: 'Teaching Resources', icon: BookOpen, color: '#8B5CF6' },
            { label: 'Upload Content', icon: UploadSimple, color: '#F59E0B' },
            { label: 'Student Progress', icon: TrendUp, color: '#06B6D4' },
            { label: 'Teacher Forums', icon: ChatText, color: '#EC4899' },
            { label: 'Professional Development', icon: Trophy, color: GOLD },
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
                    top: '8px',
                    right: '8px',
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
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${action.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Icon size={24} color={action.color} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: CREAM, textAlign: 'center' }}>
                  {action.label}
                </div>
              </motion.button>
            );
          })}
        </div>
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

      {/* Shared Resources */}
      <div style={{ marginBottom: '32px' }}>
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
                      {resource.downloads} downloads • {resource.uploader}
                    </div>
                    <button style={{
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
                    }}>
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
          {TEACHER_RECENT_ACTIVITY.map((activity) => (
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
                background: activity.type === 'request' ? '#EF4444' : activity.type === 'message' ? '#3B82F6' : '#10B981',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', color: CREAM, fontWeight: '500' }}>
                  {activity.student}
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
  );
}
