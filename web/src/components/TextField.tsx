import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, radius, fontSize } from '@/theme/tokens';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
  placeholder?: string;
};

export default function TextField({
  label,
  value,
  onChange,
  testID,
  placeholder,
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ width: '100%' }}>
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
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 52,
          borderRadius: radius.md,
          border: `1px solid ${focused ? colors.brandPrimary : colors.border}`,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          fontSize: fontSize.lg,
          backgroundColor: colors.surfaceTertiary,
          color: colors.onSurface,
          fontWeight: 500,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
