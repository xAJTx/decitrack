import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/theme/tokens';
import { Sun, Moon } from 'lucide-react';

export default function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { colors, mode, toggle } = useTheme();

  return (
    <div
      style={{
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        borderBottomStyle: 'solid',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ color: colors.brandPrimary, fontSize: 10, marginBottom: 2 }}>●</div>
          <h1
            style={{
              fontSize: 30,
              letterSpacing: 2,
              lineHeight: '32px',
              margin: 0,
              color: colors.onSurface,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                fontSize: fontSize.sm,
                marginTop: 2,
                margin: 0,
                color: colors.onSurfaceTertiary,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <button
          data-testid="theme-toggle-button"
          onClick={toggle}
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceTertiary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {mode === 'dark' ? (
            <Sun size={20} color={colors.brandPrimary} />
          ) : (
            <Moon size={20} color={colors.brandPrimary} />
          )}
        </button>
      </div>
    </div>
  );
}
