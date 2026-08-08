import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, radius, fontSize } from '@/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  testID,
  variant = 'primary',
  disabled = false,
}: Props) {
  const { colors } = useTheme();

  const isPrimary = variant === 'primary';
  const bg = isPrimary ? colors.brandPrimary : colors.surfaceSecondary;
  const textColor = isPrimary ? colors.onBrandPrimary : colors.onSurface;
  const borderColor = isPrimary ? colors.brandPrimary : colors.border;

  return (
    <button
      data-testid={testID}
      onClick={onPress}
      disabled={disabled}
      style={{
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: radius.md,
        border: `1px solid ${borderColor}`,
        backgroundColor: disabled ? colors.surfaceTertiary : bg,
        color: disabled ? colors.onSurfaceTertiary : textColor,
        fontSize: fontSize.lg,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
        }
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
      }}
    >
      {label}
    </button>
  );
}
