import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/src/components/AppHeader";
import TimeField from "@/src/components/TimeField";
import { useStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/src/theme/tokens";
import {
  addDays,
  dayShort,
  formatFullDate,
  toKey,
  todayKey,
  weekDays,
} from "@/src/utils/dates";
import {
  Break,
  formatStandard,
  toDecimal,
  validateEntry,
  workedMinutes,
} from "@/src/utils/time";

const DEFAULT_BREAK: Break = { start: "12:00", end: "12:30" };

export default function TimeEntryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    employees,
    companies,
    addCompany,
    companyName,
    selectedEmployeeId,
    setSelectedEmployeeId,
    getEntry,
    upsertEntry,
    deleteEntry,
  } = useStore();

  const [dateKey, setDateKey] = useState(todayKey());
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [breaks, setBreaks] = useState<Break[]>([DEFAULT_BREAK]);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const existing =
    selectedEmployeeId && getEntry(selectedEmployeeId, dateKey);

  // Load form from stored entry whenever employee or day changes.
  useEffect(() => {
    if (existing) {
      setStart(existing.start);
      setEnd(existing.end);
      setBreaks(existing.breaks.length ? existing.breaks : []);
      setCompanyId(existing.companyId);
    } else {
      setStart("");
      setEnd("");
      setBreaks([DEFAULT_BREAK]);
      setCompanyId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, dateKey]);

  const minutes = useMemo(
    () => workedMinutes({ start, end, breaks }),
    [start, end, breaks],
  );
  const error = useMemo(
    () => validateEntry({ start, end, breaks }),
    [start, end, breaks],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const days = weekDays(weekAnchor);

  const updateBreak = (i: number, field: keyof Break, v: string) => {
    setBreaks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: v } : b)),
    );
  };

  const onSave = () => {
    if (!selectedEmployeeId) {
      showToast("Sélectionnez d'abord un employé");
      return;
    }
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error);
      return;
    }
    upsertEntry({
      employeeId: selectedEmployeeId,
      companyId,
      date: dateKey,
      start,
      end,
      breaks: breaks.filter((b) => b.start && b.end),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Journée enregistrée ✓");
  };

  const onDelete = () => {
    if (existing) {
      deleteEntry(existing.id);
      setStart("");
      setEnd("");
      setBreaks([DEFAULT_BREAK]);
      setCompanyId(undefined);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast("Entrée supprimée");
    }
  };

  const onAddCompany = () => {
    const trimmed = newCompanyName.trim();
    if (!trimmed) return;
    const comp = addCompany(trimmed);
    setCompanyId(comp.id);
    setNewCompanyName("");
    setAddCompanyOpen(false);
    setCompanyPickerOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const bottomPad = insets.bottom + 96;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <AppHeader title="DECITRACK" subtitle="Suivi des heures · Convertisseur décimal" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomPad }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Employee selector */}
          <Pressable
            testID="employee-selector-button"
            onPress={() => setPickerOpen(true)}
            style={[
              styles.empSelector,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <View style={styles.empRow}>
              <View
                style={[styles.avatar, { backgroundColor: colors.brandTertiary }]}
              >
                <Text style={[styles.avatarText, { color: colors.onBrandTertiary, fontFamily: fonts.displayBold }]}>
                  {selectedEmployee ? selectedEmployee.name.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.empHint, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
                  EMPLOYÉ
                </Text>
                <Text
                  testID="selected-employee-name"
                  style={[styles.empName, { color: colors.onSurface, fontFamily: fonts.textSemi }]}
                >
                  {selectedEmployee ? selectedEmployee.name : "Aucun — appuyez pour choisir"}
                </Text>
              </View>
              <Feather name="chevron-down" size={22} color={colors.onSurfaceTertiary} />
            </View>
          </Pressable>

          {/* Week strip */}
          <View style={styles.weekHeader}>
            <Pressable
              testID="week-prev-button"
              hitSlop={10}
              onPress={() => setWeekAnchor((d) => addDays(d, -7))}
            >
              <Feather name="chevron-left" size={22} color={colors.onSurfaceSecondary} />
            </Pressable>
            <Text style={[styles.dateLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.textMedium }]}>
              {formatFullDate(dateKey)}
            </Text>
            <Pressable
              testID="week-next-button"
              hitSlop={10}
              onPress={() => setWeekAnchor((d) => addDays(d, 7))}
            >
              <Feather name="chevron-right" size={22} color={colors.onSurfaceSecondary} />
            </Pressable>
          </View>

          <View style={styles.strip}>
            {days.map((d) => {
              const k = toKey(d);
              const active = k === dateKey;
              const hasEntry =
                selectedEmployeeId && !!getEntry(selectedEmployeeId, k);
              const isToday = k === todayKey();
              return (
                <Pressable
                  key={k}
                  testID={`day-${k}`}
                  onPress={() => {
                    setDateKey(k);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                      borderColor: active
                        ? colors.brandPrimary
                        : isToday
                        ? colors.borderStrong
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      { color: active ? colors.onBrandPrimary : colors.onSurfaceTertiary, fontFamily: fonts.textMedium },
                    ]}
                  >
                    {dayShort(d)}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      { color: active ? colors.onBrandPrimary : colors.onSurface, fontFamily: fonts.displaySemi },
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: hasEntry
                          ? active
                            ? colors.onBrandPrimary
                            : colors.brandPrimary
                          : "transparent",
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Hero dual metric */}
          <View
            style={[
              styles.hero,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <View style={styles.heroCol}>
              <Text style={[styles.heroLabel, { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium }]}>
                STANDARD
              </Text>
              <Text testID="standard-total" style={[styles.heroStd, { color: colors.onSurface, fontFamily: fonts.displaySemi }]}>
                {formatStandard(minutes)}
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.heroCol}>
              <Text style={[styles.heroLabel, { color: colors.brandSecondary ?? colors.brandPrimary, fontFamily: fonts.textMedium }]}>
                ADMIN (DÉCIMAL)
              </Text>
              <Text testID="decimal-total" style={[styles.heroDec, { color: colors.brandPrimary, fontFamily: fonts.displayBold }]}>
                {toDecimal(minutes)}
                <Text style={[styles.heroUnit, { color: colors.brandPrimary, fontFamily: fonts.displaySemi }]}> h</Text>
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Company / site selector */}
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium }]}>
              ENTREPRISE / CHANTIER
            </Text>
            <Pressable
              testID="company-selector-button"
              onPress={() => setCompanyPickerOpen(true)}
              style={[
                styles.companySelector,
                { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
              ]}
            >
              <Feather name="briefcase" size={18} color={colors.brandPrimary} />
              <Text
                testID="selected-company-name"
                style={[
                  styles.companyName,
                  { color: companyId ? colors.onSurface : colors.onSurfaceTertiary, fontFamily: fonts.textSemi },
                ]}
                numberOfLines={1}
              >
                {companyId ? companyName(companyId) : "Aucune — appuyez pour choisir"}
              </Text>
              <Feather name="chevron-down" size={20} color={colors.onSurfaceTertiary} />
            </Pressable>

            <View style={styles.rowFields}>
              <TimeField
                testID="start-input"
                label="Début matin"
                value={start}
                onChange={setStart}
                accent
              />
              <View style={{ width: spacing.md }} />
              <TimeField
                testID="end-input"
                label="Fin soir"
                value={end}
                onChange={setEnd}
                accent
              />
            </View>

            <View style={styles.breaksHeader}>
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceSecondary, fontFamily: fonts.textSemi }]}>
                PAUSES
              </Text>
              <Pressable
                testID="add-break-button"
                onPress={() => {
                  setBreaks((p) => [...p, { start: "", end: "" }]);
                  Haptics.selectionAsync();
                }}
                style={[styles.addBreak, { borderColor: colors.brandPrimary }]}
              >
                <Feather name="plus" size={16} color={colors.brandPrimary} />
                <Text style={[styles.addBreakText, { color: colors.brandPrimary, fontFamily: fonts.textSemi }]}>
                  Ajouter
                </Text>
              </Pressable>
            </View>

            {breaks.length === 0 ? (
              <Text style={[styles.noBreak, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
                Aucune pause — journée continue.
              </Text>
            ) : (
              breaks.map((b, i) => (
                <View key={i} style={styles.breakRow}>
                  <TimeField
                    testID={`break-${i}-start`}
                    label={`Pause ${i + 1} début`}
                    value={b.start}
                    onChange={(v) => updateBreak(i, "start", v)}
                  />
                  <View style={{ width: spacing.sm }} />
                  <TimeField
                    testID={`break-${i}-end`}
                    label="Fin"
                    value={b.end}
                    onChange={(v) => updateBreak(i, "end", v)}
                  />
                  <Pressable
                    testID={`remove-break-${i}`}
                    hitSlop={8}
                    onPress={() => {
                      setBreaks((p) => p.filter((_, idx) => idx !== i));
                      Haptics.selectionAsync();
                    }}
                    style={styles.removeBreak}
                  >
                    <Feather name="x-circle" size={22} color={colors.error} />
                  </Pressable>
                </View>
              ))
            )}

            {error && (start || end) ? (
              <View style={[styles.errorBox, { backgroundColor: colors.brandTertiary }]}>
                <Feather name="alert-triangle" size={14} color={colors.onBrandTertiary} />
                <Text style={[styles.errorText, { color: colors.onBrandTertiary, fontFamily: fonts.textMedium }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {existing ? (
              <Pressable
                testID="delete-entry-button"
                onPress={onDelete}
                style={styles.deleteLink}
              >
                <Feather name="trash-2" size={15} color={colors.error} />
                <Text style={[styles.deleteText, { color: colors.error, fontFamily: fonts.textMedium }]}>
                  Supprimer cette journée
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Save */}
      <View
        style={[
          styles.saveBar,
          { paddingBottom: spacing.md, backgroundColor: colors.surface, borderTopColor: colors.divider },
        ]}
      >
        <Pressable
          testID="save-entry-button"
          onPress={onSave}
          style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
        >
          <Feather name="check" size={20} color={colors.onBrandPrimary} />
          <Text style={[styles.saveText, { color: colors.onBrandPrimary, fontFamily: fonts.textBold }]}>
            {existing ? "Mettre à jour" : "Enregistrer la journée"}
          </Text>
        </Pressable>
      </View>

      {/* Toast */}
      {toast ? (
        <View style={[styles.toast, { bottom: insets.bottom + 100, backgroundColor: colors.surfaceInverse ?? "#F5F5F5" }]}>
          <Text testID="toast-message" style={[styles.toastText, { color: colors.onSurfaceInverse ?? "#111", fontFamily: fonts.textSemi }]}>
            {toast}
          </Text>
        </View>
      ) : null}

      {/* Employee picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.borderStrong }]} />
            <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
              CHOISIR UN EMPLOYÉ
            </Text>
            {employees.length === 0 ? (
              <Text style={[styles.noBreak, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
                Aucun employé. Ajoutez-en un dans l'onglet Équipe.
              </Text>
            ) : (
              employees.map((emp) => {
                const active = emp.id === selectedEmployeeId;
                return (
                  <Pressable
                    key={emp.id}
                    testID={`picker-employee-${emp.id}`}
                    onPress={() => {
                      setSelectedEmployeeId(emp.id);
                      setPickerOpen(false);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.pickerRow,
                      { borderColor: active ? colors.brandPrimary : colors.border, backgroundColor: colors.surfaceTertiary },
                    ]}
                  >
                    <View style={[styles.avatarSm, { backgroundColor: colors.brandTertiary }]}>
                      <Text style={[styles.avatarText, { color: colors.onBrandTertiary, fontFamily: fonts.displayBold }]}>
                        {emp.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.pickerName, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
                      {emp.name}
                    </Text>
                    {active ? <Feather name="check" size={20} color={colors.brandPrimary} /> : null}
                  </Pressable>
                );
              })
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Company picker modal (bottom sheet: list + add row) */}
      <Modal
        visible={companyPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCompanyPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCompanyPickerOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.borderStrong }]} />
            <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
              ENTREPRISE / CHANTIER
            </Text>

            <Pressable
              testID="open-add-company-button"
              onPress={() => setAddCompanyOpen(true)}
              style={[styles.addCompanyRow, { borderColor: colors.brandPrimary }]}
            >
              <Feather name="plus" size={18} color={colors.brandPrimary} />
              <Text style={[styles.pickerName, { color: colors.brandPrimary, fontFamily: fonts.textSemi }]}>
                Nouvelle entreprise
              </Text>
            </Pressable>

            {/* Option: no company */}
            <Pressable
              testID="picker-company-none"
              onPress={() => {
                setCompanyId(undefined);
                setCompanyPickerOpen(false);
                Haptics.selectionAsync();
              }}
              style={[
                styles.pickerRow,
                { borderColor: !companyId ? colors.brandPrimary : colors.border, backgroundColor: colors.surfaceTertiary },
              ]}
            >
              <View style={[styles.avatarSm, { backgroundColor: colors.surfaceSecondary }]}>
                <Feather name="slash" size={16} color={colors.onSurfaceTertiary} />
              </View>
              <Text style={[styles.pickerName, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
                Aucune
              </Text>
              {!companyId ? <Feather name="check" size={20} color={colors.brandPrimary} /> : null}
            </Pressable>

            {companies.map((comp) => {
              const active = comp.id === companyId;
              return (
                <Pressable
                  key={comp.id}
                  testID={`picker-company-${comp.id}`}
                  onPress={() => {
                    setCompanyId(comp.id);
                    setCompanyPickerOpen(false);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.pickerRow,
                    { borderColor: active ? colors.brandPrimary : colors.border, backgroundColor: colors.surfaceTertiary },
                  ]}
                >
                  <View style={[styles.avatarSm, { backgroundColor: colors.brandTertiary }]}>
                    <Feather name="briefcase" size={16} color={colors.onBrandTertiary} />
                  </View>
                  <Text style={[styles.pickerName, { color: colors.onSurface, fontFamily: fonts.textSemi }]} numberOfLines={1}>
                    {comp.name}
                  </Text>
                  {active ? <Feather name="check" size={20} color={colors.brandPrimary} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add company — centered dialog (keyboard-safe) */}
      <Modal
        visible={addCompanyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAddCompanyOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={styles.centerBackdrop} onPress={() => setAddCompanyOpen(false)}>
            <Pressable
              style={[styles.dialog, { backgroundColor: colors.surfaceSecondary }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
                NOUVELLE ENTREPRISE
              </Text>
              <TextInput
                testID="company-name-input"
                value={newCompanyName}
                onChangeText={setNewCompanyName}
                placeholder="Nom de l'entreprise / chantier"
                placeholderTextColor={colors.onSurfaceTertiary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={onAddCompany}
                style={[
                  styles.dialogInput,
                  { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border, fontFamily: fonts.textMedium },
                ]}
              />
              <Pressable
                testID="confirm-add-company-button"
                onPress={onAddCompany}
                style={[styles.dialogBtn, { backgroundColor: colors.brandPrimary }]}
              >
                <Text style={[styles.dialogBtnText, { color: colors.onBrandPrimary, fontFamily: fonts.textBold }]}>
                  Ajouter
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  empSelector: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  empRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSm: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20 },
  empHint: { fontSize: 11, letterSpacing: 1 },
  empName: { fontSize: fontSize.lg, marginTop: 1 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dateLabel: { fontSize: fontSize.base },
  strip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  dayCell: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  dayName: { fontSize: 11, textTransform: "uppercase" },
  dayNum: { fontSize: 22, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  hero: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
  },
  heroCol: { flex: 1, alignItems: "center" },
  heroDivider: { width: 1, marginVertical: spacing.xs },
  heroLabel: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs },
  heroStd: { fontSize: 40, lineHeight: 44 },
  heroDec: { fontSize: 48, lineHeight: 50 },
  heroUnit: { fontSize: 22 },
  formSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  fieldLabel: {
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  companySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  companyName: { flex: 1, fontSize: fontSize.lg },
  addCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  centerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  dialog: { width: "100%", borderRadius: radius.lg, padding: spacing.xl },
  dialogInput: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  dialogBtn: { height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  dialogBtnText: { fontSize: fontSize.lg },
  rowFields: { flexDirection: "row" },
  breaksHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.base, letterSpacing: 1 },
  addBreak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  addBreakText: { fontSize: fontSize.sm },
  breakRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: spacing.md },
  removeBreak: { paddingLeft: spacing.sm, paddingBottom: 14 },
  noBreak: { fontSize: fontSize.base, paddingVertical: spacing.sm },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  errorText: { fontSize: fontSize.base, flex: 1 },
  deleteLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    justifyContent: "center",
  },
  deleteText: { fontSize: fontSize.base },
  saveBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.md,
  },
  saveText: { fontSize: fontSize.lg, letterSpacing: 0.5 },
  toast: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  toastText: { fontSize: fontSize.base },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: 22, letterSpacing: 1, marginBottom: spacing.md },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pickerName: { fontSize: fontSize.lg, flex: 1 },
});
