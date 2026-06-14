/**
 * 3-stage AAOIFI/TASIS screening view shown in the Shariah details sheet.
 * Verbatim — no behavior changes.
 */

import { Buildings, ChartBar, CurrencyDollar } from '@phosphor-icons/react';
import type { ShariahScreeningResult } from '../../types/shariahData';
import { StageSection, CriteriaItem } from './_primitives';

export function FullScreeningView({ sr }: { sr: ShariahScreeningResult }) {
  const { primaryScreening, businessScreening, financialScreening } = sr;

  return (
    <>
      {/* Stage 1: Primary Screening */}
      <StageSection
        number={1}
        title="Primary Screening"
        subtitle="Data quality checks"
        passed={primaryScreening.passed}
        icon={<ChartBar size={16} />}
      >
        <CriteriaItem
          title="Recent Financials"
          passed={primaryScreening.hasRecentFinancials}
          criteria="Annual report within last 3 years"
        />
        <CriteriaItem
          title="Non-Zero Assets"
          passed={primaryScreening.hasNonZeroAssets}
          criteria="Total assets > 0"
        />
        <CriteriaItem
          title="Non-Zero Income"
          passed={primaryScreening.hasNonZeroIncome}
          criteria="Total income > 0"
        />
      </StageSection>

      {/* Stage 2: Business Screening */}
      <StageSection
        number={2}
        title="Business Screening"
        subtitle="Halal/Haram activity check"
        passed={businessScreening.passed}
        icon={<Buildings size={16} />}
      >
        <CriteriaItem
          title="Primary Business"
          passed={businessScreening.primaryBusinessCompliant}
          criteria="Not in prohibited industry categories"
          value={businessScreening.industryGroup}
        />
        <CriteriaItem
          title="Secondary Activities"
          passed={businessScreening.secondaryBusinessCompliant}
          criteria="No prohibited secondary activities"
        />
        {businessScreening.haramCategoryMatched && (
          <p className="text-[10px] text-red-400 ml-7 -mt-1">
            Matched: {businessScreening.haramCategoryMatched}
          </p>
        )}
      </StageSection>

      {/* Stage 3: Financial Screening */}
      <StageSection
        number={3}
        title="Financial Screening"
        subtitle={`3 ratio tests (${sr.standard} thresholds)`}
        passed={financialScreening.allPassed}
        icon={<CurrencyDollar size={16} />}
      >
        <CriteriaItem
          title="Debt / Total Assets"
          passed={financialScreening.debtPassed}
          criteria={`Must be ≤ ${financialScreening.thresholds.debtLimit}%`}
          value={`${financialScreening.debtToTotalAssets.toFixed(1)}%`}
        />
        <CriteriaItem
          title="Interest Income Ratio"
          passed={financialScreening.interestPassed}
          criteria={`Must be ≤ ${financialScreening.thresholds.interestLimit}%${sr.standard === 'TASIS' ? ' (incl. 8% inv. return)' : ''}`}
          value={`${financialScreening.interestIncomeRatio.toFixed(1)}%`}
        />
        <CriteriaItem
          title="Cash + Receivables / Assets"
          passed={financialScreening.receivablesPassed}
          criteria={`Must be ≤ ${financialScreening.thresholds.receivablesLimit}%`}
          value={`${financialScreening.cashReceivablesToAssets.toFixed(1)}%`}
        />
      </StageSection>
    </>
  );
}
