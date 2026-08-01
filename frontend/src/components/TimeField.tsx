import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { fonts, fontSize, radius, spacing } from "@/src/theme/tokens";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
  accent?: boolean;
};

// Formats raw digit input into an HH:MM mask as the user types.
function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function TimeField({
  label,
  value,
  onChange,
  testID,
  accent,
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.wrap}>
      <Text
        style={[styles.label, { color: colors.onSurfaceTertiary, fontFamily: fonts.textMedium }]}
      >
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={(t) => onChange(maskTime(t))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        placeholder="--:--"
        placeholderTextColor={colors.onSurfaceTertiary}
        maxLength={5}
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceTertiary,
            color: accent ? colors.brandPrimary : colors.onSurface,
            borderColor: focused ? colors.brandPrimary : colors.border,
            fontFamily: fonts.displaySemi,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  label: {
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 26,
    letterSpacing: 1,
    textAlign: "center",
  },
});
