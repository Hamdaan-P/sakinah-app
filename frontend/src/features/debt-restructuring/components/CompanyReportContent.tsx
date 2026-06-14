/**
 * Body content for the company variant of the debt-restructuring PDF
 * preview. Phase 5 split.
 */

import { ReportRecommendations } from './ReportRecommendations';
import { COMPANY_RECOMMENDATIONS } from '../_constants';
import type { CompanyFormData } from '../_types';

interface Props {
  companyForm: CompanyFormData;
}

const sectionH2Style = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#10151F',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '2px solid #E2E8F0',
} as const;

const labelStyle = { fontSize: '13px', color: '#64748B', marginBottom: '4px' } as const;
const valueStyle = { fontSize: '16px', color: '#10151F', fontWeight: '600' } as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value || 'Not provided'}</p>
    </div>
  );
}

function MoneyTile({ label, value, color = '#16A34A', labelColor = '#166534' }: { label: string; value: string; color?: string; labelColor?: string }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: labelColor, marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: '700', color }}>₹ {value || '0'}</p>
    </div>
  );
}

export function CompanyReportContent({ companyForm }: Props) {
  return (
    <>
      {/* Company Information */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Company Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Field label="Company Name" value={companyForm.companyName} />
          <Field label="Registration Number" value={companyForm.registrationNumber} />
          <Field label="Industry" value={companyForm.industry} />
          <Field label="Contact Name" value={companyForm.contactName} />
        </div>
      </div>

      {/* Debt Summary */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Debt Summary</h2>
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#991B1B', marginBottom: '4px' }}>Outstanding Principal</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#DC2626' }}>
                ₹ {companyForm.outstandingPrincipal || '0'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#991B1B', marginBottom: '4px' }}>Interest Rate</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#DC2626' }}>
                {companyForm.interestRate || '0'}%
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Field label="Lender Name" value={companyForm.lenderName} />
          <Field label="Maturity Date" value={companyForm.maturityDate} />
        </div>
      </div>

      {/* Financial Position */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={sectionH2Style}>Financial Position</h2>
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <MoneyTile label="Cash & Equivalents" value={companyForm.cashEquivalents} />
            <MoneyTile label="Accounts Receivable" value={companyForm.accountsReceivable} />
            <MoneyTile label="Shareholder Equity" value={companyForm.shareholderEquity} />
          </div>
        </div>
      </div>

      <ReportRecommendations bullets={COMPANY_RECOMMENDATIONS} />
    </>
  );
}
