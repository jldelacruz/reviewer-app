// src/modals/ReviewerModal.js
import React from "react";
import { StyleSheet } from "react-native";
import { Portal, Modal, Text, TextInput, Button } from "react-native-paper";

const pastel = {
  textDark: "#2A2A2A",
  blue: "#A5C8FF",
};

export default function ReviewerModal({
  visible,
  onDismiss,
  title,
  value,
  setValue,
  onSave,
}) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalCard}>
        <Text variant="titleMedium" style={styles.modalTitle}>
          {title}
        </Text>

        <TextInput
          label="Reviewer Title"
          value={value}
          onChangeText={setValue}
          mode="outlined"
          style={{ marginBottom: 14 }}
        />

        <Button
          mode="contained"
          onPress={onSave}
          style={styles.saveBtn}
          buttonColor={pastel.blue}
        >
          Save
        </Button>

        <Button onPress={onDismiss}>Cancel</Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    width: "85%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: 12,
    fontWeight: "600",
    color: pastel.textDark,
  },
  saveBtn: {
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 10,
  },
});
