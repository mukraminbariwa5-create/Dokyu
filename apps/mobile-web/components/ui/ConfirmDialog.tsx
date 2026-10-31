import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';

/** In-app confirmation (never the browser's own alert, which blocks the page). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
  confirmDisabled,
  onConfirm,
  onCancel,
  children,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={onCancel}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(8,16,56,0.55)',
          }}
        />
        <View
          accessibilityViewIsModal
          className="gap-4 self-center bg-surface p-5"
          style={{ borderRadius: 24, width: '100%', maxWidth: 420 }}
        >
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          {message ? (
            <AppText variant="body" tone="muted">
              {message}
            </AppText>
          ) : null}
          {children}
          <View className="flex-row flex-wrap justify-end gap-2">
            <Button label={cancelLabel} variant="ghost" size="md" onPress={onCancel} />
            <Button
              label={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              size="md"
              loading={loading}
              disabled={confirmDisabled}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
