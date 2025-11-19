import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";

export default function ConfirmDialog({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>{title}</Dialog.Title>

        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onCancel} textColor="#777">
            {cancelLabel}
          </Button>

          <Button
            onPress={onConfirm}
            textColor="#d62246"
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
