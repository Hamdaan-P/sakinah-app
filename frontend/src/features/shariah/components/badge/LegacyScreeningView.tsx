/**
 * Legacy single-stage compliance view, used when no 3-stage screeningResult
 * is available. Verbatim — no behavior changes.
 */

import { ChartBar } from '@phosphor-icons/react';
import { getActiveStandard, getStandardInfo } from '../../services/shariahService';
import type { ShariahData } from '../../types/shariahData';
import { StageSection, CriteriaItem } from './_primitives';

export function LegacyScreeningView({ data }: { data: ShariahData }) {
  const standard = getActiveStandard();
  const thresholds = getStandardInfo(standard);

  return (
    <StageSection
      number={0}
      title="Compliance Criteria"
      subtitle="Legacy data format"
      passed={data.isCompliant}
      icon={<ChartBar size={16} />}
    >
      {/* Business Activity */}
      {(data.businessScreening || data.checks.businessActivityCheck !== undefined) && (
        <CriteriaItem
          title="Business Activity"
          passed={data.checks.businessActivityCheck ?? true}
          criteria="Permissible business activities"
          value={data.businessScreening?.primaryBusiness?.toString()}
        />
      )}

      {/* Show correct AAOIFI/TASIS criteria names */}
      {data.checks.debtToTotalAssetsCheck !== undefined && (
        <CriteriaItem
          title="Debt / Total Assets"
          passed={data.checks.debtToTotalAssetsCheck}
          criteria={`Must be ≤ ${thresholds.debtToTotalAssetsLimit}%`}
          value={`${(data.calculations.debtToTotalAssets ?? 0).toFixed(1)}%`}
        />
      )}
      {/* Legacy fallback: old debtToEquity check */}
      {data.checks.debtToTotalAssetsCheck === undefined && data.checks.debtToEquityCheck !== undefined && (
        <CriteriaItem
          title="Debt to Equity (Legacy)"
          passed={data.checks.debtToEquityCheck}
          criteria="Debt/Equity < 33%"
          value={`${((data.calculations.debtToEquity ?? 0) * 100).toFixed(1)}%`}
        />
      )}

      {data.checks.interestIncomeCheck !== undefined && (
        <CriteriaItem
          title="Interest Income Ratio"
          passed={data.checks.interestIncomeCheck}
          criteria={`Must be ≤ ${thresholds.interestIncomeLimit}%`}
          value={`${(data.calculations.interestIncomeRatio ?? 0).toFixed(1)}%`}
        />
      )}
      {/* Legacy fallback: old interestToRevenue check */}
      {data.checks.interestIncomeCheck === undefined && data.checks.interestToRevenueCheck !== undefined && (
        <CriteriaItem
          title="Interest / Revenue (Legacy)"
          passed={data.checks.interestToRevenueCheck}
          criteria="Interest < 5% of Revenue"
          value={`${((data.calculations.interestToRevenue ?? 0) * 100).toFixed(1)}%`}
        />
      )}

      {data.checks.cashReceivablesCheck !== undefined && (
        <CriteriaItem
          title="Cash + Receivables / Assets"
          passed={data.checks.cashReceivablesCheck}
          criteria={`Must be ≤ ${thresholds.cashReceivablesToAssetsLimit}%`}
          value={`${(data.calculations.cashReceivablesToAssets ?? 0).toFixed(1)}%`}
        />
      )}
      {/* Legacy fallback: old receivablesToMarketCap check */}
      {data.checks.cashReceivablesCheck === undefined && data.checks.receivablesToMarketCapCheck !== undefined && (
        <CriteriaItem
          title="Receivables / Market Cap (Legacy)"
          passed={data.checks.receivablesToMarketCapCheck}
          criteria="Receivables/Market Cap < 33%"
          value={`${((data.calculations.receivablesToMarketCap ?? 0) * 100).toFixed(1)}%`}
        />
      )}
    </StageSection>
  );
}
