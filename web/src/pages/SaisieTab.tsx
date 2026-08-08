import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { useAppStore } from '@/store/AppStore';
import { spacing, fontSize, radius } from '@/theme/tokens';
import { workedMinutes, formatStandard, toDecimal, validateEntry, Break } from '@/utils/time';
import { todayKey, weekDays, toKey, dayShort } from '@/utils/dates';
import TimeField from '@/components/TimeField';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextField from '@/components/TextField';
import { Plus, X } from 'lucide-react';

export default function SaisieTab() {
  const { colors } = useTheme();
  const { employees, companies, entries, selectedEmployeeId, addEntry, selectEmployee } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [breaks, setBreaks] = useState<Break[]>([{ start: '', end: '' }]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const weekStart = new Date(selectedDate);
  const week = weekDays(weekStart);
  const minutes = workedMinutes({ start, end, breaks });

  const handleSave = () => {
    if (!selectedEmployeeId) {
      setError('Sélectionnez un employé');
      return;
    }
    const err = validateEntry({ start, end, breaks });
    if (err) {
      setError(err);
      return;
    }
    addEntry({
      id: Math.random().toString(36).slice(2),
      employeeId: selectedEmployeeId,
      companyId: selectedCompanyId,
      date: selectedDate,
      start,
      end,
      breaks,
      createdAt: new Date().toISOString(),
    });
    setStart('');
    setEnd('');
    setBreaks([{ start: '', end: '' }]);
    setSelectedCompanyId(undefined);
    setError(null);
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
        <button
          onClick={() => setShowEmployeeModal(true)}
          data-testid="employee-selector-button"
          style={{
            width: '100%',
            padding: spacing.md,
            borderRadius: radius.md,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceTertiary,
            color: colors.onSurface,
            cursor: 'pointer',
            marginBottom: spacing.md,
          }}
        >
          <div data-testid="selected-employee-name">
            {selectedEmployee ? selectedEmployee.name : 'Sélectionner un employé'}
          </div>
        </button>
      </div>

      {/* Week Strip */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          gap: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          borderBottomStyle: 'solid',
        }}
      >
        {week.map((d) => {
          const key = toKey(d);
          const isSelected = key === selectedDate;
          const hasEntry = entries.some((e) => e.date === key && e.employeeId === selectedEmployeeId);
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              data-testid={`day-${key}`}
              style={{
                flex: '0 0 auto',
                padding: `${spacing.md}px ${spacing.sm}px`,
                borderRadius: radius.md,
                border: `1px solid ${isSelected ? colors.brandPrimary : colors.border}`,
                backgroundColor: isSelected ? colors.brandPrimary : colors.surfaceTertiary,
                color: isSelected ? colors.onBrandPrimary : colors.onSurface,
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: 60,
              }}
            >
              <div>{dayShort(d)}</div>
              <div style={{ fontSize: fontSize.sm }}>{d.getDate()}</div>
              {hasEntry && <div style={{ fontSize: 10 }}>✓</div>}
            </button>
          );
        })}
      </div>

      {/* Hero Metrics */}
      <div
        style={{
          padding: spacing.lg,
          backgroundColor: colors.surfaceSecondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          borderBottomStyle: 'solid',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.onSurfaceTertiary, fontSize: fontSize.sm, marginBottom: spacing.sm }}>Temps travaillé</div>
          <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center', alignItems: 'baseline' }}>
            <div>
              <div style={{ color: colors.onSurfaceTertiary, fontSize: fontSize.sm }}>Standard</div>
              <div
                data-testid="standard-total"
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.onSurface,
                }}
              >
                {formatStandard(minutes)}
              </div>
            </div>
            <div style={{ color: colors.divider }}>|</div>
            <div>
              <div style={{ color: colors.onSurfaceTertiary, fontSize: fontSize.sm }}>Décimal</div>
              <div
                data-testid="decimal-total"
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.brandPrimary,
                }}
              >
                {toDecimal(minutes)} h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing.lg,
        }}
      >
        {error && (
          <div
            style={{
              backgroundColor: colors.error,
              color: colors.onError,
              padding: spacing.md,
              borderRadius: radius.md,
              marginBottom: spacing.md,
            }}
          >
            {error}
          </div>
        )}

        {/* Company Selector */}
        <div style={{ marginBottom: spacing.lg }}>
          <button
            onClick={() => setShowCompanyModal(true)}
            data-testid="company-selector-button"
            style={{
              width: '100%',
              padding: spacing.md,
              borderRadius: radius.md,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceTertiary,
              color: colors.onSurface,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div data-testid="selected-company-name">
              {selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId)?.name : 'Aucune — appuyez pour choisir'}
            </div>
          </button>
        </div>

        {/* Time Fields */}
        <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
          <TimeField
            label="Début"
            value={start}
            onChange={setStart}
            testID="start-input"
          />
          <TimeField
            label="Fin"
            value={end}
            onChange={setEnd}
            testID="end-input"
          />
        </div>

        {/* Breaks */}
        <div style={{ marginBottom: spacing.lg }}>
          <div style={{ marginBottom: spacing.md, fontWeight: 500, color: colors.onSurface }}>Pauses</div>
          {breaks.map((brk, idx) => (
            <div key={idx} style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.md }}>n              <TimeField
                label={`Pause ${idx + 1} - Début`}
                value={brk.start}
                onChange={(v) => {
                  const updated = [...breaks];
                  updated[idx].start = v;
                  setBreaks(updated);
                }}
                testID={`break-${idx}-start`}
              />
              <TimeField
                label={`Pause ${idx + 1} - Fin`}
                value={brk.end}
                onChange={(v) => {
                  const updated = [...breaks];
                  updated[idx].end = v;
                  setBreaks(updated);
                }}
                testID={`break-${idx}-end`}
              />
              <button
                onClick={() => setBreaks(breaks.filter((_, i) => i !== idx))}
                data-testid={`remove-break-${idx}`}
                style={{
                  padding: spacing.md,
                  backgroundColor: colors.error,
                  border: 'none',
                  borderRadius: radius.md,
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                <X size={20} color={colors.onError} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setBreaks([...breaks, { start: '', end: '' }])}
            data-testid="add-break-button"
            style={{
              padding: `${spacing.sm}px ${spacing.md}px`,
              backgroundColor: colors.surfaceTertiary,
              border: `1px dashed ${colors.border}`,
              borderRadius: radius.md,
              cursor: 'pointer',
              color: colors.brandPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Plus size={16} /> Ajouter une pause
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          borderTopStyle: 'solid',
        }}
      >
        <Button label="Enregistrer" onPress={handleSave} testID="save-entry-button" />
      </div>

      {/* Employee Modal */}
      <Modal
        title="Sélectionner un employé"
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => {
                selectEmployee(emp.id);
                setShowEmployeeModal(false);
              }}
              data-testid={`picker-employee-${emp.id}`}
              style={{
                padding: spacing.md,
                backgroundColor: colors.surfaceTertiary,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                cursor: 'pointer',
                color: colors.onSurface,
                textAlign: 'left',
              }}
            >
              {emp.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Company Modal */}
      <Modal
        title="Sélectionner une entreprise"
        open={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <button
            onClick={() => {
              setSelectedCompanyId(undefined);
              setShowCompanyModal(false);
            }}
            data-testid="picker-company-none"
            style={{
              padding: spacing.md,
              backgroundColor: colors.surfaceTertiary,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              cursor: 'pointer',
              color: colors.onSurface,
              textAlign: 'left',
            }}
          >
            Aucune
          </button>
          {companies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => {
                setSelectedCompanyId(comp.id);
                setShowCompanyModal(false);
              }}
              data-testid={`picker-company-${comp.id}`}
              style={{
                padding: spacing.md,
                backgroundColor: colors.surfaceTertiary,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                cursor: 'pointer',
                color: colors.onSurface,
                textAlign: 'left',
              }}
            >
              {comp.name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
