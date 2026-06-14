/**
 * Body content for the personal variant of the debt-restructuring PDF
 * preview. Phase 5 split.
 */

import { ReportRecommendations } from './ReportRecommendations';
import { PERSONAL_RECOMMENDATIONS } from '../_constants';
import type { PersonalFormData } from '../_types';

interface Props {
  personalForm: PersonalFormData;
}

const sectionH2Style = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#10151F',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '2px solid #E2E8F0',
} as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '16px', color: '#10151F', fontWeight: '600' }}>{value || 'Not provided'}</p>
    </div>
  );
}

function MoneyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: '#991B1B', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: '700', color: '#DC2626' }}>₹ {value || '0'}</p>
    </div>
  );
}

export function PersonalReportContent({ personalForm }: Props) {
  return (
    <>
      {/* Personal Information */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Personal Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Field label="Full Name" value={personalForm.fullName} />
          <Field label="National ID/Aadhar" value={personalForm.nationalId} />
          <Field label="Employment Status" value={personalForm.employmentStatus} />
          <div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Monthly Income</p>
            <p style={{ fontSize: '16px', color: '#10151F', fontWeight: '600' }}>
              ₹ {personalForm.monthlyIncome || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Debt Overview */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Debt Overview</h2>
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <MoneyField label="Credit Card Debt" value={personalForm.creditCardDebt} />
            <MoneyField label="Personal Loans" value={personalForm.personalLoans} />
            <MoneyField label="Home Loan" value={personalForm.homeLoan} />
            <MoneyField label="Vehicle Loan" value={personalForm.vehicleLoan} />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Financial Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#166534', marginBottom: '4px' }}>Monthly Income</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#16A34A' }}>
              ₹ {personalForm.salaryWages || '0'}
            </p>
          </div>
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#991B1B', marginBottom: '4px' }}>Monthly Expenses</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#DC2626' }}>
              ₹ {personalForm.housingRent || '0'}
            </p>
          </div>
        </div>
      </div>

      <ReportRecommendations bullets={PERSONAL_RECOMMENDATIONS} />
    </>
  );
}
