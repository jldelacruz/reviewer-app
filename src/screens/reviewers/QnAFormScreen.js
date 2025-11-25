import React, { useState, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QnAFormScreen({ route, navigation }) {
  const { reviewer, editingItem } = route.params;

  const [question, setQuestion] = useState(editingItem?.question || "");
  const [answer, setAnswer] = useState(editingItem?.answer || "");

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const openSheet = () => bottomSheetRef.current?.expand();

  const save = async () => {
    if (!question.trim() || !answer.trim()) return;

    const storageKey = `reviewer_${reviewer.id}_qa`;
    const saved = await AsyncStorage.getItem(storageKey);
    let list = saved ? JSON.parse(saved) : [];

    if (editingItem) {
      list = list.map(q =>
        q.id === editingItem.id
          ? { ...q, question, answer }
          : q
      );
    } else {
      list.push({
        id: Date.now().toString(),
        question,
        answer,
      });
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(list));

    navigation.goBack();  // parent auto-reloads
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>
        {editingItem ? "Edit Q&A" : "Add Q&A"}
      </Text>

      <TextInput
        label="Question"
        mode="outlined"
        multiline
        numberOfLines={4}
        value={question}
        onChangeText={setQuestion}
        style={styles.textArea}
      />

      <View style={styles.iconRow}>
        <IconButton icon="microphone" onPress={openSheet} />
        <IconButton icon="camera" />
      </View>

      <TextInput
        label="Answer"
        mode="outlined"
        multiline
        numberOfLines={4}
        value={answer}
        onChangeText={setAnswer}
        style={styles.textArea}
      />
      
      <View style={styles.iconRow}>
        <IconButton icon="microphone" onPress={openSheet} />
        <IconButton icon="camera" />
      </View>

      <Button mode="contained" onPress={save} style={{ marginBottom: 10 }}>
        Save
      </Button>

      <Button mode="text" onPress={() => navigation.goBack()}>
        Cancel
      </Button>

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={-1}>
        <BottomSheetView style={{ padding: 20 }}>
          <Text>Speech-to-text UI goes here.</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontWeight: "700", marginBottom: 16 },
  textArea: { marginBottom: 10, minHeight: 100 },
  iconRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
});
