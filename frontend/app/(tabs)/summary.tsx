import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/src/components/AppHeader";
import { useStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/src/theme/tokens";
import {
  currentMonthKey,
  formatMonthLabel,
  fromKey,
  shiftMonth,
} from "@/src/utils/dates";
import { exportCSV, exportPDF } from "@/src/utils/export";
import { formatStandard, toDecimal, workedMinutes } from "@/src/utils/time";

const EMPTY_IMG =
  "https://images.unsplash.com/photo-1778136157872-44684bf44c57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGlnaXRhbCUyMGNsb2NrJTIwZGFya3xlbnwwfHx8fDE3ODU1NDQyMTR8MA&ixlib=rb-4.1.0&q=85";

export default function SummaryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    entriesForMonth,
  } = useStore();

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [busy, setBusy] = useState<null | "pdf" | "csv">(null);
  const [toast, setToast] = useState<string | null>(null);

  const employee = employees.find((e) => e.id === selectedEmployeeId);
  const entries = useMemo(
    () => (selectedEmployeeId ? entriesForMonth(selectedEmployeeId, monthKey) : []),
    [selectedEmployeeId, monthKey, entriesForMonth],
  );

  const totalMin = useMemo(
    () => entries.reduce((s, e) => s + workedMinutes(e), 0),
    [entries],
  );

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const doExport = async (kind: "pdf" | "csv") => {
    if (busy) return; // guard against a second share while one is in progress
    if (!employee || entries.length === 0) {
      showToast("Aucune donnée à exporter");
      return;
    }
    if (Platform.OS === "web") {
      showToast("L'export est disponible sur l'app mobile (Expo Go)");
      return;
    }
    try {
      setBusy(kind);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (kind === "pdf") await exportPDF(employee, monthKey, entries);
      else await exportCSV(employee, monthKey, entries);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de l'export";
      showToast(msg);
    } finally {
      setBusy(null);
    }
  };

  const bottomPad = insets.bottom + 96;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <AppHeader title="RÉCAP" subtitle="Bilan mensuel & export" />

      {/* Employee chips */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {employees.map((emp) => {
            const active = emp.id === selectedEmployeeId;
            return (
              <Pressable
                key={emp.id}
                testID={`summary-chip-${emp.id}`}
                onPress={() => {
                  setSelectedEmployeeId(emp.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                    borderColor: active ? colors.brandPrimary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary, fontFamily: fonts.textSemi },
                  ]}
                >
                  {emp.name}
                </Text>
              </Pressable>
            );
          })}
          {employees.length === 0 ? (
            <Text style={[styles.chipEmpty, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
              Ajoutez un employé dans l'onglet Équipe
            </Text>
          ) : null}
        </ScrollView>
      </View>

      {/* Month selector */}
      <View style={styles.monthRow}>
        <Pressable
          testID="month-prev-button"
          hitSlop={10}
          onPress={() => setMonthKey((m) => shiftMonth(m, -1))}
          style={[styles.monthBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Feather name="chevron-left" size={20} color={colors.onSurface} />
        </Pressable>
        <Text testID="month-label" style={[styles.monthLabel, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
          {formatMonthLabel(monthKey)}
        </Text>
        <Pressable
          testID="month-next-button"
          hitSlop={10}
          onPress={() => setMonthKey((m) => shiftMonth(m, 1))}
          style={[styles.monthBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Feather name="chevron-right" size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total card */}
        <View style={[styles.totalCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.totalCol}>
            <Text style={[styles.totalLabel, { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium }]}>
              TOTAL STANDARD
            </Text>
            <Text testID="month-total-standard" style={[styles.totalStd, { color: colors.onSurface, fontFamily: fonts.displaySemi }]}>
              {formatStandard(totalMin)}
            </Text>
          </View>
          <View style={[styles.totalDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.totalCol}>
            <Text style={[styles.totalLabel, { color: colors.brandSecondary, fontFamily: fonts.textMedium }]}>
              TOTAL ADMIN
            </Text>
            <Text testID="month-total-decimal" style={[styles.totalDec, { color: colors.brandPrimary, fontFamily: fonts.displayBold }]}>
              {toDecimal(totalMin)}
              <Text style={{ fontSize: 20, fontFamily: fonts.displaySemi }}> h</Text>
            </Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Image source={{ uri: EMPTY_IMG }} style={styles.emptyImg} contentFit="cover" />
            <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: fonts.textSemi }]}>
              Aucune entrée pour ce mois
            </Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
              Enregistrez des journées dans l'onglet Saisie.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            {entries.map((e) => {
              const min = workedMinutes(e);
              const d = fromKey(e.date);
              return (
                <View
                  key={e.id}
                  testID={`summary-row-${e.date}`}
                  style={[styles.dayRow, { borderBottomColor: colors.divider }]}
                >
                  <View style={styles.dayDateBox}>
                    <Text style={[styles.dayDateNum, { color: colors.onSurface, fontFamily: fonts.displayBold }]}>
                      {d.getDate().toString().padStart(2, "0")}
                    </Text>
                    <Text style={[styles.dayDateName, { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium }]}>
                      {["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"][d.getDay()]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dayHoraire, { color: colors.onSurfaceSecondary, fontFamily: fonts.textMedium }]}>
                      {e.start} – {e.end}
                    </Text>
                    <Text style={[styles.dayStd, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}>
                      {formatStandard(min)}
                    </Text>
                  </View>
                  <Text style={[styles.dayDec, { color: colors.brandPrimary, fontFamily: fonts.displayBold }]}>
                    {toDecimal(min)}
                    <Text style={{ fontSize: 14, fontFamily: fonts.displaySemi }}> h</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky export buttons */}
      <View
        style={[
          styles.exportBar,
          { paddingBottom: insets.bottom + spacing.sm, backgroundColor: colors.surface, borderTopColor: colors.divider },
        ]}
      >
        <Pressable
          testID="export-pdf-button"
          onPress={() => doExport("pdf")}
          style={[styles.exportBtn, { backgroundColor: colors.brandPrimary }]}
        >
          {busy === "pdf" ? (
            <ActivityIndicator color={colors.onBrandPrimary} />
          ) : (
            <>
              <Feather name="file-text" size={18} color={colors.onBrandPrimary} />
              <Text style={[styles.exportText, { color: colors.onBrandPrimary, fontFamily: fonts.textBold }]}>PDF</Text>
            </>
          )}
        </Pressable>
        <View style={{ width: spacing.md }} />
        <Pressable
          testID="export-csv-button"
          onPress={() => doExport("csv")}
          style={[styles.exportBtn, { backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.borderStrong }]}
        >
          {busy === "csv" ? (
            <ActivityIndicator color={colors.onSurface} />
          ) : (
            <>
              <Feather name="download" size={18} color={colors.onSurface} />
              <Text style={[styles.exportText, { color: colors.onSurface, fontFamily: fonts.textBold }]}>CSV</Text>
            </>
          )}
        </Pressable>
      </View>

      {toast ? (
        <View style={[styles.toast, { bottom: insets.bottom + 100, backgroundColor: colors.surfaceInverse }]}>
          <Text testID="summary-toast" style={[styles.toastText, { color: colors.onSurfaceInverse, fontFamily: fonts.textSemi }]}>
            {toast}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm, alignItems: "center" },
  chip: {
    height: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexShrink: 0,
  },
  chipText: { fontSize: fontSize.base },
  chipEmpty: { fontSize: fontSize.base },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontSize: 24, letterSpacing: 1 },
  totalCard: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
  },
  totalCol: { flex: 1, alignItems: "center" },
  totalDivider: { width: 1, marginVertical: spacing.xs },
  totalLabel: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs },
  totalStd: { fontSize: 34, lineHeight: 38 },
  totalDec: { fontSize: 40, lineHeight: 42 },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  dayDateBox: { alignItems: "center", width: 44 },
  dayDateNum: { fontSize: 26, lineHeight: 28 },
  dayDateName: { fontSize: 10, letterSpacing: 1 },
  dayHoraire: { fontSize: fontSize.base },
  dayStd: { fontSize: fontSize.sm, marginTop: 2 },
  dayDec: { fontSize: 26 },
  emptyWrap: { alignItems: "center", paddingTop: spacing["3xl"], paddingHorizontal: spacing.xl },
  emptyImg: { width: 140, height: 140, borderRadius: radius.lg, marginBottom: spacing.lg, opacity: 0.85 },
  emptyTitle: { fontSize: fontSize.lg, marginBottom: spacing.xs },
  emptySub: { fontSize: fontSize.base, textAlign: "center" },
  exportBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  exportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
  },
  exportText: { fontSize: fontSize.lg, letterSpacing: 1 },
  toast: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  toastText: { fontSize: fontSize.base },
});
