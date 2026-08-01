import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/src/theme/tokens";

export default function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { colors, mode, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.brandDot, { color: colors.brandPrimary }]}
          >
            ●
          </Text>
          <Text
            testID="header-title"
            style={[styles.title, { color: colors.onSurface, fontFamily: fonts.displayBold }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.onSurfaceTertiary, fontFamily: fonts.text }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          testID="theme-toggle-button"
          onPress={toggle}
          style={[
            styles.iconBtn,
            { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
          ]}
        >
          <Feather
            name={mode === "dark" ? "sun" : "moon"}
            size={20}
            color={colors.brandPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  brandDot: { fontSize: 10, marginBottom: 2 },
  title: {
    fontSize: 30,
    letterSpacing: 2,
    lineHeight: 32,
  },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
