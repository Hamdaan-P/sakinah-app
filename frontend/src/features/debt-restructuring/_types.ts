/**
 * DebtRestructuringPage type definitions.
 *
 * Phase 5 split — moved out of DebtRestructuringPage.tsx so the page
 * component carries only JSX + state wiring. No behaviour change.
 */

export type ViewMode = 'selection' | 'company-form' | 'personal-form' | 'pdf-preview';
export type PathType = 'company' | 'personal' | null;

export interface CompanyFormData {
  // Section 1 - Company Information
  companyName: string;
  registrationNumber: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Section 2 - Debt Information
  outstandingPrincipal: string;
  interestRate: string;
  lenderName: string;
  loanAgreementNumber: string;
  maturityDate: string;
  collateralDetails: string;

  // Section 3 - Financial Position
  cashEquivalents: string;
  accountsReceivable: string;
  inventory: string;
  fixedAssets: string;
  currentLiabilities: string;
  longTermDebt: string;
  shareholderEquity: string;

  // Section 4 - Cash Flow Analysis
  annualRevenue: string;
  annualOperatingExpenses: string;
  ebitda: string;
  capitalExpenditures: string;
  projectedRevenueGrowth: string;

  // Section 5 - Income & Revenue
  primaryRevenueSource: string;
  annualRevenueAmount: string;
  majorCustomers: string;
  customerConcentration: string;
}

export interface PersonalFormData {
  // Section 1 - Personal Information
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  employmentStatus: string;
  monthlyIncome: string;

  // Section 2 - Current Debts
  creditCardDebt: string;
  personalLoans: string;
  homeLoan: string;
  vehicleLoan: string;
  educationLoan: string;
  familyLoans: string;
  otherDebts: string;

  // Section 3 - Monthly Income
  salaryWages: string;
  businessIncome: string;
  rentalIncome: string;
  otherIncome: string;

  // Section 4 - Monthly Expenses
  housingRent: string;
  utilities: string;
  foodGroceries: string;
  transportation: string;
  insurancePremiums: string;
  childrenEducation: string;
  otherExpenses: string;

  // Section 5 - Assets
  bankSavings: string;
  investments: string;
  propertyValue: string;
  vehicleValue: string;
  goldJewelry: string;
}

export interface SectionField {
  key: string;
  label: string;
  required: boolean;
  type: string;
}

export interface FormSection {
  id: number;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  fields: SectionField[];
}
