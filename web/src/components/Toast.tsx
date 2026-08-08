import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/theme/tokens';

type Props = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }: Props) {
  const { colors } = useTheme();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? colors.success : type === 'error' ? colors.error : colors.info;
  const textColor = colors.onSurface;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        padding: spacing.md,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: 8,
        fontSize: fontSize.base,
        zIndex: 9999,
        animation: 'slideUp 0.3s ease',
      }}
    >
      {message}
    </div>
  );
}
