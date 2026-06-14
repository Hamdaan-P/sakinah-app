/**
 * Generated-PDF preview screen for the debt-restructuring flow.
 *
 * Wraps the toolbar, the white-paper document body (delegated to
 * CompanyReportContent or PersonalReportContent), and the email modal.
 * Phase 5 split — extracted from DebtRestructuringPage.tsx; no
 * behaviour change.
 */

import { motion } from 'framer-motion';
import { CompanyReportContent } from './CompanyReportContent';
import { PersonalReportContent } from './PersonalReportContent';
import { EmailDialog } from './EmailDialog';
import { PDFPreviewToolbar } from './PDFPreviewToolbar';
import type { CompanyFormData, PathType, PersonalFormData } from '../_types';

interface Props {
  pathType: PathType;
  companyForm: CompanyFormData;
  personalForm: PersonalFormData;
  showEmailDialog: boolean;
  emailAddress: string;
  onBack: () => void;
  onShare: () => void;
  onOpenEmail: () => void;
  onCloseEmail: () => void;
  onChangeEmail: (value: string) => void;
  onEmailReport: () => void;
  onDownload: () => void;
  onSend: () => void;
}

export function PDFPreview({
  pathType,
  companyForm,
  personalForm,
  showEmailDialog,
  emailAddress,
  onBack,
  onShare,
  onOpenEmail,
  onCloseEmail,
  onChangeEmail,
  onEmailReport,
  onDownload,
  onSend,
}: Props) {
  const isCompany = pathType === 'company';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10151F 0%, #14B8A6 50%, #10151F 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <PDFPreviewToolbar
          onBack={onBack}
          onShare={onShare}
          onOpenEmail={onOpenEmail}
          onDownload={onDownload}
          onSend={onSend}
        />

        {/* PDF Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            padding: '60px',
            boxShadow: '0 20px 60px rgba(0,0,0, 0.3)',
          }}
        >
          {/* Document Header */}
          <div style={{
            borderBottom: '3px solid #14B8A6',
            paddingBottom: '24px',
            marginBottom: '40px',
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#10151F',
              marginBottom: '8px',
            }}>
              Debt Restructuring Report
            </h1>
            <p style={{ fontSize: '18px', color: '#64748B' }}>
              {isCompany ? 'Company Financial Analysis' : 'Personal Financial Assessment'}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#94A3B8',
              marginTop: '8px',
            }}>
              Generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Report Content */}
          {isCompany ? (
            <CompanyReportContent companyForm={companyForm} />
          ) : (
            <PersonalReportContent personalForm={personalForm} />
          )}

          {/* Footer */}
          <div style={{
            marginTop: '60px',
            paddingTop: '24px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#94A3B8',
              marginBottom: '4px',
            }}>
              This report is generated based on the information provided and is for illustrative purposes only.
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              For comprehensive debt restructuring services, please consult with our certified advisors.
            </p>
          </div>
        </motion.div>
      </div>

      <EmailDialog
        open={showEmailDialog}
        emailAddress={emailAddress}
        onChangeEmail={onChangeEmail}
        onClose={onCloseEmail}
        onSubmit={onEmailReport}
      />
    </div>
  );
}
