/**
 * Static form-section definitions and empty-form templates for
 * DebtRestructuringPage.
 *
 * Phase 5 split — these used to live as in-component useMemo()
 * literals; moving them out is purely mechanical and trims ~140 lines
 * from the page. No behaviour change.
 */

import {
  Buildings,
  User,
  CreditCard,
  CurrencyDollar,
  TrendUp,
  Wallet,
  ShoppingCart,
  PiggyBank,
} from '@phosphor-icons/react';

import type { CompanyFormData, FormSection, PersonalFormData } from './_types';

export const COMPANY_SECTIONS: FormSection[] = [
  {
    id: 1,
    title: 'Company Information',
    icon: Buildings,
    color: '#3B82F6',
    fields: [
      { key: 'companyName', label: 'Company Name', required: true, type: 'text' },
      { key: 'registrationNumber', label: 'Registration Number', required: true, type: 'text' },
      { key: 'industry', label: 'Industry', required: true, type: 'text' },
      { key: 'contactName', label: 'Contact Name', required: true, type: 'text' },
      { key: 'contactEmail', label: 'Contact Email', required: true, type: 'email' },
      { key: 'contactPhone', label: 'Contact Phone', required: true, type: 'tel' },
    ],
  },
  {
    id: 2,
    title: 'Debt Information',
    icon: CreditCard,
    color: '#EF4444',
    fields: [
      { key: 'outstandingPrincipal', label: 'Outstanding Principal', required: true, type: 'currency' },
      { key: 'interestRate', label: 'Interest Rate', required: true, type: 'percentage' },
      { key: 'lenderName', label: 'Lender Name', required: true, type: 'text' },
      { key: 'loanAgreementNumber', label: 'Loan Agreement Number', required: false, type: 'text' },
      { key: 'maturityDate', label: 'Maturity Date', required: true, type: 'date' },
      { key: 'collateralDetails', label: 'Collateral Details', required: false, type: 'textarea' },
    ],
  },
  {
    id: 3,
    title: 'Financial Position',
    icon: Wallet,
    color: '#10B981',
    fields: [
      { key: 'cashEquivalents', label: 'Cash & Equivalents', required: true, type: 'currency' },
      { key: 'accountsReceivable', label: 'Accounts Receivable', required: true, type: 'currency' },
      { key: 'inventory', label: 'Inventory', required: true, type: 'currency' },
      { key: 'fixedAssets', label: 'Fixed Assets/PPE', required: false, type: 'currency' },
      { key: 'currentLiabilities', label: 'Current Liabilities', required: true, type: 'currency' },
      { key: 'longTermDebt', label: 'Long-term Debt', required: true, type: 'currency' },
      { key: 'shareholderEquity', label: 'Shareholder Equity', required: true, type: 'currency' },
    ],
  },
  {
    id: 4,
    title: 'Cash Flow Analysis',
    icon: TrendUp,
    color: '#F59E0B',
    fields: [
      { key: 'annualRevenue', label: 'Annual Revenue', required: true, type: 'currency' },
      { key: 'annualOperatingExpenses', label: 'Annual Operating Expenses', required: true, type: 'currency' },
      { key: 'ebitda', label: 'EBITDA', required: false, type: 'currency' },
      { key: 'capitalExpenditures', label: 'Capital Expenditures', required: false, type: 'currency' },
      { key: 'projectedRevenueGrowth', label: 'Projected Revenue Growth', required: false, type: 'percentage' },
    ],
  },
  {
    id: 5,
    title: 'Income & Revenue',
    icon: CurrencyDollar,
    color: '#8B5CF6',
    fields: [
      { key: 'primaryRevenueSource', label: 'Primary Revenue Source', required: true, type: 'text' },
      { key: 'annualRevenueAmount', label: 'Annual Revenue Amount', required: true, type: 'currency' },
      { key: 'majorCustomers', label: 'Major Customers', required: false, type: 'textarea' },
      { key: 'customerConcentration', label: 'Customer Concentration Top 5', required: false, type: 'percentage' },
    ],
  },
];

export const PERSONAL_SECTIONS: FormSection[] = [
  {
    id: 1,
    title: 'Personal Information',
    icon: User,
    color: '#3B82F6',
    fields: [
      { key: 'fullName', label: 'Full Name', required: true, type: 'text' },
      { key: 'nationalId', label: 'National ID/Aadhar', required: true, type: 'text' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'phone', label: 'Phone', required: true, type: 'tel' },
      { key: 'employmentStatus', label: 'Employment Status', required: true, type: 'text' },
      { key: 'monthlyIncome', label: 'Monthly Income', required: true, type: 'currency' },
    ],
  },
  {
    id: 2,
    title: 'Current Debts',
    icon: CreditCard,
    color: '#EF4444',
    fields: [
      { key: 'creditCardDebt', label: 'Credit Card Debt', required: false, type: 'currency' },
      { key: 'personalLoans', label: 'Personal Loans', required: false, type: 'currency' },
      { key: 'homeLoan', label: 'Home Loan/Mortgage', required: false, type: 'currency' },
      { key: 'vehicleLoan', label: 'Vehicle Loan', required: false, type: 'currency' },
      { key: 'educationLoan', label: 'Education Loan', required: false, type: 'currency' },
      { key: 'familyLoans', label: 'Family/Friends Loans', required: false, type: 'currency' },
      { key: 'otherDebts', label: 'Other Debts', required: false, type: 'currency' },
    ],
  },
  {
    id: 3,
    title: 'Monthly Income',
    icon: CurrencyDollar,
    color: '#10B981',
    fields: [
      { key: 'salaryWages', label: 'Salary/Wages', required: true, type: 'currency' },
      { key: 'businessIncome', label: 'Business Income', required: false, type: 'currency' },
      { key: 'rentalIncome', label: 'Rental Income', required: false, type: 'currency' },
      { key: 'otherIncome', label: 'Other Income', required: false, type: 'currency' },
    ],
  },
  {
    id: 4,
    title: 'Monthly Expenses',
    icon: ShoppingCart,
    color: '#F59E0B',
    fields: [
      { key: 'housingRent', label: 'Housing/Rent/EMI', required: true, type: 'currency' },
      { key: 'utilities', label: 'Utilities', required: false, type: 'currency' },
      { key: 'foodGroceries', label: 'Food & Groceries', required: true, type: 'currency' },
      { key: 'transportation', label: 'Transportation', required: false, type: 'currency' },
      { key: 'insurancePremiums', label: 'Insurance Premiums', required: false, type: 'currency' },
      { key: 'childrenEducation', label: "Children's Education", required: false, type: 'currency' },
      { key: 'otherExpenses', label: 'Other Expenses', required: false, type: 'currency' },
    ],
  },
  {
    id: 5,
    title: 'Assets',
    icon: PiggyBank,
    color: '#8B5CF6',
    fields: [
      { key: 'bankSavings', label: 'Bank Savings', required: false, type: 'currency' },
      { key: 'investments', label: 'Investments/Stocks/MF', required: false, type: 'currency' },
      { key: 'propertyValue', label: 'Property Value', required: false, type: 'currency' },
      { key: 'vehicleValue', label: 'Vehicle Value', required: false, type: 'currency' },
      { key: 'goldJewelry', label: 'Gold/Jewelry Value', required: false, type: 'currency' },
    ],
  },
];

export const EMPTY_COMPANY_FORM: CompanyFormData = {
  companyName: '',
  registrationNumber: '',
  industry: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  outstandingPrincipal: '',
  interestRate: '',
  lenderName: '',
  loanAgreementNumber: '',
  maturityDate: '',
  collateralDetails: '',
  cashEquivalents: '',
  accountsReceivable: '',
  inventory: '',
  fixedAssets: '',
  currentLiabilities: '',
  longTermDebt: '',
  shareholderEquity: '',
  annualRevenue: '',
  annualOperatingExpenses: '',
  ebitda: '',
  capitalExpenditures: '',
  projectedRevenueGrowth: '',
  primaryRevenueSource: '',
  annualRevenueAmount: '',
  majorCustomers: '',
  customerConcentration: '',
};

export const COMPANY_RECOMMENDATIONS = [
  'Consider Shariah-compliant debt consolidation options',
  'Explore Islamic financing alternatives to reduce interest burden',
  'Consult with our restructuring specialists for customized solutions',
];

export const PERSONAL_RECOMMENDATIONS = [
  'Prioritize high-interest debt elimination using Islamic principles',
  'Explore Qard Hasan (interest-free loan per AAOIFI SS 19) options through Islamic institutions',
  'Connect with our financial advisors for personalized debt management plan',
];

export const EMPTY_PERSONAL_FORM: PersonalFormData = {
  fullName: '',
  nationalId: '',
  email: '',
  phone: '',
  employmentStatus: '',
  monthlyIncome: '',
  creditCardDebt: '',
  personalLoans: '',
  homeLoan: '',
  vehicleLoan: '',
  educationLoan: '',
  familyLoans: '',
  otherDebts: '',
  salaryWages: '',
  businessIncome: '',
  rentalIncome: '',
  otherIncome: '',
  housingRent: '',
  utilities: '',
  foodGroceries: '',
  transportation: '',
  insurancePremiums: '',
  childrenEducation: '',
  otherExpenses: '',
  bankSavings: '',
  investments: '',
  propertyValue: '',
  vehicleValue: '',
  goldJewelry: '',
};
