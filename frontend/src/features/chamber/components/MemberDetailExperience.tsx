/**
 * Skills + experience sections of the member-detail overlay.
 * Phase 5 split.
 */

import { COLORS } from '../_constants';
import type { Member } from '../_types';

interface Props {
  member: Member;
}

export function MemberDetailExperience({ member }: Props) {
  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '12px' }}>
          Skills
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {member.skills.map((skill) => (
            <span
              key={skill}
              style={{
                padding: '8px 16px',
                background: COLORS.navy.dark,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '20px',
                fontSize: '13px',
                color: COLORS.text.secondary,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '12px' }}>
          Experience
        </h4>
        <div style={{ display: 'grid', gap: '16px' }}>
          {member.experience.map((exp, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                background: COLORS.navy.dark,
                borderRadius: '12px',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text.primary }}>
                {exp.title}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.text.secondary, marginTop: '4px' }}>
                {exp.company}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.text.muted, marginTop: '4px' }}>
                {exp.period}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
