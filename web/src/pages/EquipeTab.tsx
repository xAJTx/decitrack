import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { useAppStore } from '@/store/AppStore';
import { spacing, fontSize, radius } from '@/theme/tokens';
import { workedMinutes, formatStandard, toDecimal } from '@/utils/time';
import { monthKeyOf, currentMonthKey } from '@/utils/dates';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextField from '@/components/TextField';
import { Plus, Trash2 } from 'lucide-react';

export default function EquipeTab() {
  const { colors } = useTheme();
  const { employees, companies, entries, addEmployee, removeEmployee, addCompany, removeCompany } = useAppStore();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const currentMonth = currentMonthKey();

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      addEmployee(newEmployeeName);
      setNewEmployeeName('');
      setShowAddEmployee(false);
    }
  };

  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      addCompany(newCompanyName);
      setNewCompanyName('');
      setShowAddCompany(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          borderBottomStyle: 'solid',
        }}
      >
        <button
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: colors.surface,
            color: colors.brandPrimary,
            border: 'none',
            cursor: 'pointer',
            fontSize: fontSize.base,
            fontWeight: 'bold',
            borderBottomWidth: 2,
            borderBottomColor: colors.brandPrimary,
            borderBottomStyle: 'solid',
          }}
        >
          Employés
        </button>
        <button
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: colors.surface,
            color: colors.onSurfaceTertiary,
            border: 'none',
            cursor: 'pointer',
            fontSize: fontSize.base,
          }}
        >
          Entreprises
        </button>
      </div>

      {/* Employees List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing.lg,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {employees.map((emp) => {
            const empEntries = entries.filter(
              (e) => e.employeeId === emp.id && monthKeyOf(e.date) === currentMonth
            );
            const totalMin = empEntries.reduce((sum, e) => sum + workedMinutes(e), 0);
            return (
              <div
                key={emp.id}
                style={{
                  padding: spacing.md,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: fontSize.base, fontWeight: 'bold', color: colors.onSurface }}>
                    {emp.name}
                  </div>
                  <div style={{ fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: spacing.xs }}>
                    {formatStandard(totalMin)} / {toDecimal(totalMin)} h
                  </div>
                </div>
                <button
                  onClick={() => removeEmployee(emp.id)}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.error,
                    border: 'none',
                    borderRadius: radius.md,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={20} color={colors.onError} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Button */}
      <div
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          borderTopStyle: 'solid',
        }}
      >
        <Button
          label="+ Ajouter un employé"
          onPress={() => setShowAddEmployee(true)}
          testID="open-add-employee-button"
        />
      </div>

      {/* Add Employee Modal */}
      <Modal
        title="Nouvel employé"
        open={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <TextField
            label="Nom"
            value={newEmployeeName}
            onChange={setNewEmployeeName}
            testID="employee-name-input"
            placeholder="Jean Dupont"
          />
          <Button
            label="Ajouter"
            onPress={handleAddEmployee}
            testID="confirm-add-employee-button"
          />
        </div>
      </Modal>

      {/* Add Company Modal */}
      <Modal
        title="Nouvelle entreprise"
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <TextField
            label="Nom"
            value={newCompanyName}
            onChange={setNewCompanyName}
            testID="company-name-input"
            placeholder="Chantier Nord"
          />
          <Button
            label="Ajouter"
            onPress={handleAddCompany}
            testID="confirm-add-company-button"
          />
        </div>
      </Modal>
    </div>
  );
}
