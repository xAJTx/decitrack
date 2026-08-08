import React from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, radius } from '@/theme/tokens';
import { X } from 'lucide-react';

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
};

export default function Modal({ title, children, onClose, open }: Props) {
  const { colors } = useTheme();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          padding: spacing.lg,
          maxWidth: 500,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <h2 style={{ margin: 0, color: colors.onSurface }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={24} color={colors.onSurface} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
