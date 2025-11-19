import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Text,
  Card,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
} from "react-native-paper";

export default function ReviewerDetailsScreen({ route }) {
  const { reviewer } = route.params || {};
  const storageKey = `reviewer_${reviewer.id}_qa`;

  const [qaList, setQaList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // -----------------------------------------------------
  // LOAD Existing Q&A from Storage
  // -----------------------------------------------------
  useEffect(() => {
    loadQA();
  }, []);

  const loadQA = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        setQaList(JSON.parse(saved));
      }
    } catch (err) {
      console.log("Load QA error:", err);
    }
  };

  // -----------------------------------------------------
  // SAVE Q&A LIST
  // -----------------------------------------------------
  const saveQAList = async (list) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(list));
    } catch (err) {
      console.log("Save QA error:", err);
    }
  };

  // -----------------------------------------------------
  // ADD or UPDATE Q&A
  // -----------------------------------------------------
  const saveQA = () => {
    if (!question.trim() || !answer.trim()) return;

    let updated;

    if (editingItem) {
      // Update existing
      updated = qaList.map((item) =>
        item.id === editingItem.id
          ? { ...item, question, answer }
          : item
      );
    } else {
      // Create new
      const newItem = {
        id: Date.now().toString(),
        question,
        answer,
      };
      updated = [...qaList, newItem];
    }

    setQaList(updated);
    saveQAList(updated);

    setModalVisible(false);
  };

  // -----------------------------------------------------
  // DELETE Q&A
  // -----------------------------------------------------
  const deleteQA = (id) => {
    const updated = qaList.filter((item) => item.id !== id);
    setQaList(updated);
    saveQAList(updated);
  };

  // -----------------------------------------------------
  // UI Helpers
  // -----------------------------------------------------
  const openAddModal = () => {
    setEditingItem(null);
    setQuestion("");
    setAnswer("");
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setModalVisible(true);
  };

  // -----------------------------------------------------
  // RENDER EACH CARD
  // -----------------------------------------------------
  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => openEditModal(item)}>
      <Card.Title
        title={item.question}
        titleNumberOfLines={2}
        subtitle={item.answer}
        subtitleNumberOfLines={3}
        right={() => (
          <IconButton
            icon="delete"
            onPress={() => deleteQA(item.id)}
          />
        )}
      />
    </Card>
  );

  // -----------------------------------------------------

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        {reviewer?.title || "Reviewer"}
      </Text>

      <FlatList
        data={qaList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ADD BUTTON */}
      <FAB icon="plus" style={styles.fab} onPress={openAddModal} />

      {/* MODAL FORM */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={{ marginBottom: 12 }}>
            {editingItem ? "Edit Q&A" : "Add Q&A"}
          </Text>

          {/* QUESTION TEXT AREA */}
          <TextInput
            label="Question"
            value={question}
            mode="outlined"
            multiline
            numberOfLines={5}
            onChangeText={setQuestion}
            style={styles.textArea}
          />

          {/* ACTION ICONS */}
          <View style={styles.iconRow}>
            <IconButton icon="microphone" size={20} onPress={() => {}} />
            <IconButton icon="camera" size={20} onPress={() => {}} />
            <View style={{ flex: 1 }} />
          </View>

          {/* ANSWER FIELD */}
          <TextInput
            label="Answer"
            value={answer}
            mode="outlined"
            multiline
            numberOfLines={4}
            onChangeText={setAnswer}
            style={{ marginBottom: 14 }}
          />

          <Button mode="contained" onPress={saveQA} style={{ marginBottom: 10 }}>
            Save
          </Button>

          <Button mode="text" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  textArea: {
    marginBottom: 6,
    minHeight: 110,
    textAlignVertical: "top",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: -8,
  },
});
