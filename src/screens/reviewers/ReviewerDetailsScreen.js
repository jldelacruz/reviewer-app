import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Card, FAB, IconButton, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pastel } from "../../theme/pastel";

export default function ReviewerDetailsScreen({ route, navigation }) {
  const { reviewer } = route.params || {};
  const storageKey = `reviewer_${reviewer.id}_qa`;

  const [qaList, setQaList] = useState([]);
  const [globalShuffle, setGlobalShuffle] = useState(false);

  // -----------------------------
  // LOAD QA
  // -----------------------------
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadQA();
      loadShuffleSetting();
    });

    return unsubscribe;
  }, [navigation]);

  const loadShuffleSetting = async () => {
    const saved = await AsyncStorage.getItem("global_shuffle");
    if (saved !== null) {
      setGlobalShuffle(JSON.parse(saved));
    }
  };

  const loadQA = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) setQaList(JSON.parse(saved));
    } catch (err) {
      console.log("Load QA error:", err);
    }
  };

  const saveQAList = async (list) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(list));
    } catch (err) {
      console.log("Save QA error:", err);
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------
  const deleteQA = (id) => {
    const updated = qaList.filter((i) => i.id !== id);
    setQaList(updated);
    saveQAList(updated);
  };

  // -----------------------------
  // RENDER CARD
  // -----------------------------
  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate("QnAForm", {
          reviewer,
          editingItem: item, // for edit only
        })
      }
    >
      <Card.Title
        title={item.question}
        titleNumberOfLines={2}
        subtitle={item.answer}
        subtitleNumberOfLines={3}
        right={() => (
          <IconButton icon="delete" iconColor={pastel.textDanger} style={styles.deleteIcon} onPress={() => deleteQA(item.id)} />
        )}
      />
    </Card>
  );

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

      <Button onPress={() => navigation.navigate("Quiz", { reviewer, globalShuffle })}> Try Quiz </Button>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() =>
          navigation.navigate("QnAForm", {
            reviewer,
            editingItem: null,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontWeight: "700", marginBottom: 16 },
  card: { backgroundColor: pastel.card, marginBottom: 12, borderRadius: 14 },
  fab: { backgroundColor: pastel.blue, position: "absolute", bottom: 24, right: 24 },
  deleteIcon: { color: pastel.textDanger }
});
