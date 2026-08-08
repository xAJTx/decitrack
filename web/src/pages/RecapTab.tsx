import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { useAppStore } from '@/store/AppStore';
import { spacing, fontSize, radius } from '@/theme/tokens';
import { workedMinutes, formatStandard, toDecimal } from '@/utils/time';
import { monthKeyOf, currentMonthKey, shiftMonth, formatMonthLabel, toKey } from '@/utils/dates';
import { exportPDF, exportCSV } from '@/utils/export';
import Button from '@/components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecapTab() {
  const { colors } = useTheme();
  const { employees, companies, entries, selectedEmployeeId, getCompanyName } = useAppStore();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (e.employeeId !== selectedEmployeeId) return false;
      if (monthKeyOf(e.date) !== monthKey) return false;
      if (companyFilter && e.companyId !== companyFilter) return false;
      return true;
    });
  }, [entries, selectedEmployeeId, monthKey, companyFilter]);

  const totalMinutes = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + workedMinutes(e), 0);
  }, [filteredEntries]);

  const handleExportPDF = async () => {
    if (!selectedEmployee || filteredEntries.length === 0) {
      setToast('Aucune donnée à exporter');
      return;
    }
    try {
      await exportPDF(selectedEmployee, monthKey, filteredEntries, getCompanyName);
      setToast('PDF exporté avec succès');
    } catch (err) {
      setToast(`Erreur: ${err instanceof Error ? err.message : 'Export PDF échoué'}`);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedEmployee || filteredEntries.length === 0) {
      setToast('Aucune donnée à exporter');
      return;
    }
    try {
      await exportCSV(selectedEmployee, monthKey, filteredEntries, getCompanyName);
      setToast('CSV exporté avec succès');
    } catch (err) {
      setToast(`Erreur: ${err instanceof Error ? err.message : 'Export CSV échoué'}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          borderBottomStyle: 'solid',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <button
            onClick={() => setMonthKey(shiftMonth(monthKey, -1))}
            data-testid="month-prev-button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
            }}
          >
            <ChevronLeft size={24} color={colors.brandPrimary} />
          </button>
          <div
            data-testid="summary-month-label"
            style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: colors.onSurface }}
          >
            {formatMonthLabel(monthKey)}
          </div>
          <button
            onClick={() => setMonthKey(shiftMonth(monthKey, 1))}
            data-testid="month-next-button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
            }}
          >
            <ChevronRight size={24} color={colors.brandPrimary} />
          </button>
        </div>

        {/* Company Filter Chips */}
        {companies.length > 0 && (
          <div style={{ display: 'flex', gap: spacing.sm, overflowX: 'auto' }}>
            <button
              data-testid="company-filter-all"
              onClick={() => setCompanyFilter(null)}
              style={{
                padding: `${spacing.xs}px ${spacing.md}px`,
                borderRadius: radius.pill,
                border: `1px solid ${companyFilter === null ? colors.brandPrimary : colors.border}`,
                backgroundColor: companyFilter === null ? colors.brandPrimary : colors.surfaceTertiary,
                color: companyFilter === null ? colors.onBrandPrimary : colors.onSurface,
                cursor: 'pointer',
                fontSize: fontSize.sm,
              }}
            >
              Toutes
            </button>
            <button
              data-testid="company-filter-none"
              onClick={() => setCompanyFilter('')}
              style={{
                padding: `${spacing.xs}px ${spacing.md}px`,
                borderRadius: radius.pill,
                border: `1px solid ${companyFilter === '' ? colors.brandPrimary : colors.border}`,
                backgroundColor: companyFilter === '' ? colors.brandPrimary : colors.surfaceTertiary,
                color: companyFilter === '' ? colors.onBrandPrimary : colors.onSurface,
                cursor: 'pointer',
                fontSize: fontSize.sm,
              }}
            >
              Aucune
            </button>
            {companies.map((comp) => (
              <button
                key={comp.id}
                data-testid={`company-filter-${comp.id}`}
                onClick={() => setCompanyFilter(comp.id)}
                style={{
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  borderRadius: radius.pill,
                  border: `1px solid ${companyFilter === comp.id ? colors.brandPrimary : colors.border}`,
                  backgroundColor: companyFilter === comp.id ? colors.brandPrimary : colors.surfaceTertiary,
                  color: companyFilter === comp.id ? colors.onBrandPrimary : colors.onSurface,
                  cursor: 'pointer',
                  fontSize: fontSize.sm,
                }}
              >
                {comp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Totals Card */}
      <div
        style={{
          padding: spacing.lg,
          backgroundColor: colors.surfaceSecondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          borderBottomStyle: 'solid',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.onSurfaceTertiary, fontSize: fontSize.sm }}>Standard</div>
            <div
              data-testid="month-total-standard"
              style={{ fontSize: 20, fontWeight: 'bold', color: colors.onSurface }}
            >
              {formatStandard(totalMinutes)}
            </div>
          </div>
          <div style={{ color: colors.divider }}>|</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.onSurfaceTertiary, fontSize: fontSize.sm }}>Décimal</div>
            <div
              data-testid="month-total-decimal"
              style={{ fontSize: 20, fontWeight: 'bold', color: colors.brandPrimary }}
            >
              {toDecimal(totalMinutes)} h
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing.lg,
        }}
      >
        {filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.onSurfaceTertiary, marginTop: spacing.3xl }}>
            Aucune entrée pour ce mois
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {filteredEntries.map((entry) => {
              const mins = workedMinutes(entry);
              return (
                <div
                  key={entry.id}
                  data-testid={`summary-row-${entry.id}`}
                  style={{
                    padding: spacing.md,
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: radius.md,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.brandPrimary,
                    borderLeftStyle: 'solid',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: fontSize.base, fontWeight: 'bold', color: colors.onSurface }}>
                        {entry.date} {entry.start} – {entry.end}
                      </div>
                      {entry.companyId && (
                        <div style={{ fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: spacing.xs }}>
                          💼 {getCompanyName(entry.companyId)}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: fontSize.sm, color: colors.onSurfaceTertiary }}>{formatStandard(mins)}</div>
                      <div
                        style={{
                          fontSize: fontSize.lg,
                          fontWeight: 'bold',
                          color: colors.brandPrimary,
                        }}
                      >
                        {toDecimal(mins)} h
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          borderTopStyle: 'solid',
          display: 'flex',
          gap: spacing.md,
        }}
      >
        <Button
          label="Exporter PDF"
          onPress={handleExportPDF}
          testID="export-pdf-button"
          variant="primary"
        />
        <Button
          label="Exporter CSV"
          onPress={handleExportCSV}
          testID="export-csv-button"
          variant="secondary"
        />
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: spacing.lg,
            left: spacing.lg,
            right: spacing.lg,
            padding: spacing.md,
            backgroundColor: colors.success,
            color: colors.onError,
            borderRadius: radius.md,
            fontSize: fontSize.base,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
