import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card, RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function QuizScreen({ route, navigation }) {
  const { reviewer, globalShuffle } = route.params;

  const [originalItems, setOriginalItems] = useState([]);
  const [items, setItems] = useState([]);

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // -------------------------------------
  // Load stored questions only once
  // -------------------------------------
  useEffect(() => {
    loadData();
  }, []);

  // Whenever the active question changes, regenerate choices
  useEffect(() => {
    if (items.length > 0) {
      generateOptions();
    }
  }, [items, index]);

  // -------------------------------------
  // Re-shuffle every time the screen gains focus
  // -------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (originalItems.length > 0) {
        applyShuffle();
      }
    }, [globalShuffle, originalItems])
  );

  // Load saved QNAs
  const loadData = async () => {
    const storageKey = `reviewer_${reviewer.id}_qa`;
    const saved = await AsyncStorage.getItem(storageKey);
    const list = saved ? JSON.parse(saved) : [];
    setOriginalItems(list);
  };

  // Shuffle logic
  const applyShuffle = () => {
    if (globalShuffle) {
      setItems(shuffleArray(originalItems));
    } else {
      setItems(originalItems);
    }

    // Reset quiz whenever shuffle changes or screen reopens
    setIndex(0);
    setScore(0);
    setSelected(null);
    setIsAnswered(false);
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Generate answer choices
  const generateOptions = () => {
    const current = items[index];
    if (!current) return;

    let wrongAnswers = items
      .filter((q) => q.id !== current.id)
      .map((q) => q.answer);

    const shuffledWrong = shuffleArray(wrongAnswers).slice(0, 3);
    const allOptions = shuffleArray([current.answer, ...shuffledWrong]);

    setOptions(allOptions);
    setSelected(null);
    setIsAnswered(false);
  };

  const handleSelect = (opt) => {
    if (isAnswered) return;

    setSelected(opt);
    setIsAnswered(true);

    if (opt === items[index].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const next = () => {
    if (index + 1 === items.length) {
      navigation.goBack();
      return;
    }
    setIndex((prev) => prev + 1);
  };

  if (!items.length) {
    return (
      <View style={styles.center}>
        <Text>No Q&A found for this reviewer.</Text>
      </View>
    );
  }

  const current = items[index];

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>
        {reviewer.name} — Quiz
      </Text>

      <Text style={styles.counter}>
        Question {index + 1} of {items.length}
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.question}>
            {current.question}
          </Text>

          <RadioButton.Group
            onValueChange={handleSelect}
            value={selected}
          >
            {options.map((opt, idx) => {
              let isCorrect = opt === current.answer;
              let isWrongSelected =
                opt === selected && selected !== current.answer;

              return (
                <View
                  key={idx}
                  style={[
                    styles.option,
                    isAnswered && isCorrect && { backgroundColor: "#c6f6d5" },
                    isAnswered &&
                      isWrongSelected && { backgroundColor: "#fed7d7" },
                  ]}
                >
                  <RadioButton value={opt} disabled={isAnswered} />
                  <Text style={styles.optionText}>{opt}</Text>
                </View>
              );
            })}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {isAnswered && (
        <Button mode="contained" onPress={next}>
          {index + 1 === items.length ? "Finish Quiz" : "Next Question"}
        </Button>
      )}

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={{ marginTop: 16 }}
      >
        Exit
      </Button>

      <Text style={{ marginTop: 20, textAlign: "center" }}>
        Score: {score}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  counter: {
    marginBottom: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  card: { marginBottom: 20, paddingVertical: 10 },
  question: { marginBottom: 20, fontWeight: "600" },
  option: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  optionText: { fontSize: 16, flexShrink: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
