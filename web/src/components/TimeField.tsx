import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
  accent?: boolean;
};

// Formats raw digit input into an HH:MM mask as the user types.
function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
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
    <div style={{ flex: 1 }}>
      <label
        style={{
          fontSize: fontSize.sm,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: spacing.xs,
          display: 'block',
          color: colors.onSurfaceTertiary,
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        data-testid={testID}
        type="text"
        value={value}
        onChange={(e) => onChange(maskTime(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        placeholder="--:--"
        maxLength={5}
        style={{
          width: '100%',
          height: 52,
          borderRadius: radius.md,
          border: `1px solid ${focused ? colors.brandPrimary : colors.border}`,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          fontSize: 26,
          letterSpacing: 1,
          textAlign: 'center',
          backgroundColor: colors.surfaceTertiary,
          color: accent ? colors.brandPrimary : colors.onSurface,
          fontWeight: 600,
          fontFamily: 'monospace',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
