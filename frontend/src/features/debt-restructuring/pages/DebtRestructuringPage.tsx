import { useState, useMemo } from 'react';
import { SelectionView } from '../components/SelectionView';
import { FormView } from '../components/FormView';
import { PDFPreview } from '../components/PDFPreview';
import {
  COMPANY_SECTIONS,
  PERSONAL_SECTIONS,
  EMPTY_COMPANY_FORM,
  EMPTY_PERSONAL_FORM,
} from '../_constants';
import type {
  CompanyFormData,
  PathType,
  PersonalFormData,
  ViewMode,
} from '../_types';

export function DebtRestructuringPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [pathType, setPathType] = useState<PathType>(null);
  const [expandedSection, setExpandedSection] = useState<number>(1);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const [companyForm, setCompanyForm] = useState<CompanyFormData>(EMPTY_COMPANY_FORM);
  const [personalForm, setPersonalForm] = useState<PersonalFormData>(EMPTY_PERSONAL_FORM);

  const companySections = useMemo(() => COMPANY_SECTIONS, []);
  const personalSections = useMemo(() => PERSONAL_SECTIONS, []);

  const calculateProgress = () => {
    const form = pathType === 'company' ? companyForm : personalForm;
    const sections = pathType === 'company' ? companySections : personalSections;

    let totalFields = 0;
    let filledFields = 0;

    sections.forEach(section => {
      section.fields.forEach(field => {
        totalFields++;
        if ((form as unknown as Record<string, string>)[field.key]?.trim()) {
          filledFields++;
        }
      });
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  const handleSelectPath = (path: 'company' | 'personal') => {
    setPathType(path);
    setViewMode(path === 'company' ? 'company-form' : 'personal-form');
    setExpandedSection(1);
  };

  const handleCompanyFormChange = (key: keyof CompanyFormData, value: string) => {
    setCompanyForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePersonalFormChange = (key: keyof PersonalFormData, value: string) => {
    setPersonalForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateReport = () => {
    setViewMode('pdf-preview');
  };

  const handleSaveDraft = () => {
    // Mock save functionality
    alert('Draft saved successfully!');
  };

  const handleEmailReport = () => {
    if (emailAddress) {
      alert(`Report sent to ${emailAddress}`);
      setShowEmailDialog(false);
      setEmailAddress('');
    }
  };

  const isFormView = viewMode === 'company-form' || viewMode === 'personal-form';
  const activeSections = pathType === 'company' ? companySections : personalSections;
  const activeForm = pathType === 'company' ? companyForm : personalForm;
  const activeChange =
    pathType === 'company'
      ? (key: string, value: string) =>
          handleCompanyFormChange(key as keyof CompanyFormData, value)
      : (key: string, value: string) =>
          handlePersonalFormChange(key as keyof PersonalFormData, value);

  return (
    <>
      {viewMode === 'selection' && (
        <SelectionView onSelectPath={handleSelectPath} />
      )}
      {isFormView && (
        <FormView
          pathType={pathType}
          sections={activeSections}
          form={activeForm}
          expandedSection={expandedSection}
          progress={calculateProgress()}
          onSetExpanded={setExpandedSection}
          onBack={() => setViewMode('selection')}
          onChange={activeChange}
          onSaveDraft={handleSaveDraft}
          onGenerateReport={handleGenerateReport}
        />
      )}
      {viewMode === 'pdf-preview' && (
        <PDFPreview
          pathType={pathType}
          companyForm={companyForm}
          personalForm={personalForm}
          showEmailDialog={showEmailDialog}
          emailAddress={emailAddress}
          onBack={() => setViewMode(pathType === 'company' ? 'company-form' : 'personal-form')}
          onShare={() => alert('Report shared!')}
          onOpenEmail={() => setShowEmailDialog(true)}
          onCloseEmail={() => setShowEmailDialog(false)}
          onChangeEmail={setEmailAddress}
          onEmailReport={handleEmailReport}
          onDownload={() => alert('Report downloaded!')}
          onSend={() => alert('Report sent!')}
        />
      )}
    </>
  );
}
