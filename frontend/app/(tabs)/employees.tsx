import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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
import { useStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/src/theme/tokens";
import { currentMonthKey } from "@/src/utils/dates";
import { toDecimal, workedMinutes } from "@/src/utils/time";

const EMPTY_IMG =
  "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxvZmZpY2UlMjBkZXNrJTIwZGFyayUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg1NTQ0MjE0fDA&ixlib=rb-4.1.0&q=85";

export default function EmployeesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    employees,
    entries,
    selectedEmployeeId,
    setSelectedEmployeeId,
    addEmployee,
    removeEmployee,
  } = useStore();

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const month = currentMonthKey();

  const monthTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      if (e.date.startsWith(month)) {
        map[e.employeeId] = (map[e.employeeId] ?? 0) + workedMinutes(e);
      }
    }
    return map;
  }, [entries, month]);

  const onAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addEmployee(trimmed);
    setName("");
    setAddOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deletingEmployee = employees.find((e) => e.id === confirmDelete);
  const bottomPad = insets.bottom + 96;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <AppHeader title="ÉQUIPE" subtitle="Gérer les employés" />

      {employees.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Image source={{ uri: EMPTY_IMG }} style={styles.emptyImg} contentFit="cover" />
          <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
            Aucun employé
          </Text>
          <Text style={[styles.emptySub, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
            Ajoutez votre premier employé pour commencer à suivre les heures.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          {employees.map((emp) => {
            const active = emp.id === selectedEmployeeId;
            const min = monthTotals[emp.id] ?? 0;
            return (
              <Pressable
                key={emp.id}
                testID={`employee-row-${emp.id}`}
                onPress={() => {
                  setSelectedEmployeeId(emp.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.empCard,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: active ? colors.brandPrimary : colors.border,
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.brandTertiary }]}>
                  <Text style={[styles.avatarText, { color: colors.onBrandTertiary, fontFamily: fonts.displayBold }]}>
                    {emp.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.empName, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
                    {emp.name}
                  </Text>
                  <Text style={[styles.empMeta, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
                    {toDecimal(min)} h ce mois-ci
                  </Text>
                </View>
                {active ? (
                  <View style={[styles.activeBadge, { backgroundColor: colors.brandTertiary }]}>
                    <Text style={[styles.activeBadgeText, { color: colors.onBrandTertiary, fontFamily: fonts.textSemi }]}>
                      ACTIF
                    </Text>
                  </View>
                ) : null}
                <Pressable
                  testID={`delete-employee-${emp.id}`}
                  hitSlop={8}
                  onPress={() => setConfirmDelete(emp.id)}
                  style={styles.delBtn}
                >
                  <Feather name="trash-2" size={18} color={colors.error} />
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Sticky Add button */}
      <View
        style={[
          styles.addBar,
          { paddingBottom: insets.bottom + spacing.sm, backgroundColor: colors.surface, borderTopColor: colors.divider },
        ]}
      >
        <Pressable
          testID="open-add-employee-button"
          onPress={() => setAddOpen(true)}
          style={[styles.addBtn, { backgroundColor: colors.brandPrimary }]}
        >
          <Feather name="user-plus" size={20} color={colors.onBrandPrimary} />
          <Text style={[styles.addText, { color: colors.onBrandPrimary, fontFamily: fonts.textBold }]}>
            Ajouter un employé
          </Text>
        </Pressable>
      </View>

      {/* Add modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.backdrop} onPress={() => setAddOpen(false)}>
            <Pressable
              style={[styles.sheet, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + spacing.lg }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
              <Text style={[styles.sheetTitle, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
                NOUVEL EMPLOYÉ
              </Text>
              <TextInput
                testID="employee-name-input"
                value={name}
                onChangeText={setName}
                placeholder="Nom de l'employé"
                placeholderTextColor={colors.onSurfaceTertiary}
                autoFocus
                onSubmitEditing={onAdd}
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border, fontFamily: fonts.textMedium },
                ]}
              />
              <Pressable
                testID="confirm-add-employee-button"
                onPress={onAdd}
                style={[styles.sheetBtn, { backgroundColor: colors.brandPrimary }]}
              >
                <Text style={[styles.sheetBtnText, { color: colors.onBrandPrimary, fontFamily: fonts.textBold }]}>
                  Ajouter
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete confirm modal */}
      <Modal visible={!!confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(null)}>
        <Pressable style={styles.centerBackdrop} onPress={() => setConfirmDelete(null)}>
          <Pressable
            style={[styles.dialog, { backgroundColor: colors.surfaceSecondary }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Feather name="alert-triangle" size={28} color={colors.error} />
            <Text style={[styles.dialogTitle, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
              Supprimer {deletingEmployee?.name} ?
            </Text>
            <Text style={[styles.dialogSub, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
              Toutes les heures enregistrées pour cet employé seront perdues.
            </Text>
            <View style={styles.dialogRow}>
              <Pressable
                testID="cancel-delete-button"
                onPress={() => setConfirmDelete(null)}
                style={[styles.dialogBtn, { backgroundColor: colors.surfaceTertiary }]}
              >
                <Text style={[styles.dialogBtnText, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>Annuler</Text>
              </Pressable>
              <Pressable
                testID="confirm-delete-button"
                onPress={() => {
                  if (confirmDelete) removeEmployee(confirmDelete);
                  setConfirmDelete(null);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }}
                style={[styles.dialogBtn, { backgroundColor: colors.error }]}
              >
                <Text style={[styles.dialogBtnText, { color: colors.onError, fontFamily: fonts.textSemi }]}>Supprimer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  empCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: { width: 46, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22 },
  empName: { fontSize: fontSize.lg },
  empMeta: { fontSize: fontSize.sm, marginTop: 2 },
  activeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  activeBadgeText: { fontSize: 10, letterSpacing: 1 },
  delBtn: { padding: spacing.sm },
  emptyWrap: { alignItems: "center", paddingTop: spacing["3xl"], paddingHorizontal: spacing.xl },
  emptyImg: { width: 150, height: 150, borderRadius: radius.lg, marginBottom: spacing.lg, opacity: 0.85 },
  emptyTitle: { fontSize: fontSize.lg, marginBottom: spacing.xs },
  emptySub: { fontSize: fontSize.base, textAlign: "center", lineHeight: 20 },
  addBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.md,
  },
  addText: { fontSize: fontSize.lg },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: spacing.md },
  sheetTitle: { fontSize: 24, letterSpacing: 1, marginBottom: spacing.md },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  sheetBtn: { height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  sheetBtnText: { fontSize: fontSize.lg },
  centerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  dialog: { width: "100%", borderRadius: radius.lg, padding: spacing.xl, alignItems: "center" },
  dialogTitle: { fontSize: fontSize.lg, marginTop: spacing.md, textAlign: "center" },
  dialogSub: { fontSize: fontSize.base, marginTop: spacing.sm, textAlign: "center", lineHeight: 20 },
  dialogRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  dialogBtn: { flex: 1, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  dialogBtnText: { fontSize: fontSize.base },
});
