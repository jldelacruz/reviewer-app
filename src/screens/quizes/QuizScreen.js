import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Card, RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";

export default function QuizScreen({ route, navigation }) {
  const { reviewer, globalShuffle } = route.params;

  const [originalItems, setOriginalItems] = useState([]);
  const [items, setItems] = useState([]);

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // 🧠 Mascot state machine
  const [mascotState, setMascotState] = useState("idle"); 
  // "idle" | "happy" | "sad"

  const mascotRef = useRef(null);

  // 🎞 FRAME RANGES
  const idleFrames = [0, 47];
  const happyFrames = [47, 134];
  const sadFrames = [134, 210];

  // -------------------------------------
  // Load stored questions once
  // -------------------------------------
  useEffect(() => {
    loadData();
  }, []);

  // Generate choices when question changes
  useEffect(() => {
    if (items.length > 0) {
      generateOptions();
    }
  }, [items, index]);

  // Shuffle on focus
  useFocusEffect(
    useCallback(() => {
      if (originalItems.length > 0) {
        applyShuffle();
      }
    }, [globalShuffle, originalItems])
  );

  // -------------------------------------
  // Data
  // -------------------------------------
  const loadData = async () => {
    const storageKey = `reviewer_${reviewer.id}_qa`;
    const saved = await AsyncStorage.getItem(storageKey);
    const list = saved ? JSON.parse(saved) : [];
    setOriginalItems(list);
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const applyShuffle = () => {
    setItems(globalShuffle ? shuffleArray(originalItems) : originalItems);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setIsAnswered(false);
    playIdle();
  };

  const generateOptions = () => {
    const current = items[index];
    if (!current) return;

    let wrongAnswers = items
      .filter((q) => q.id !== current.id)
      .map((q) => q.answer);

    const shuffledWrong = shuffleArray(wrongAnswers).slice(0, 3);
    setOptions(shuffleArray([current.answer, ...shuffledWrong]));
    setSelected(null);
    setIsAnswered(false);
    playIdle();
  };

  // -------------------------------------
  // Mascot controls
  // -------------------------------------
  const playIdle = () => {
    setMascotState("idle");
    mascotRef.current?.play(idleFrames[0], idleFrames[1]);
  };

  const playHappy = () => {
    setMascotState("happy");
    mascotRef.current?.play(happyFrames[0], happyFrames[1]);
  };

  const playSad = () => {
    setMascotState("sad");
    mascotRef.current?.play(sadFrames[0], sadFrames[1]);
  };

  // -------------------------------------
  // Answer selection
  // -------------------------------------
  const handleSelect = (opt) => {
    if (isAnswered) return;

    setSelected(opt);
    setIsAnswered(true);

    if (opt === items[index].answer) {
      setScore((prev) => prev + 1);
      playHappy();
    } else {
      playSad();
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

      {/* 🐣 MASCOT */}
      <LottieView
        ref={mascotRef}
        source={require("../../assets/robot_quiz.json")}
        style={styles.mascot}
        autoPlay={false}
        loop={mascotState === "idle"}
        onAnimationFinish={() => {
          if (mascotState !== "idle") {
            playIdle();
          }
        }}
      />

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.question}>
            {current.question}
          </Text>

          <RadioButton.Group value={selected} onValueChange={handleSelect}>
            {options.map((opt, idx) => {
              const isCorrect = opt === current.answer;
              const isWrongSelected =
                opt === selected && selected !== current.answer;

              return (
                <View
                  key={idx}
                  style={[
                    styles.option,
                    isAnswered && isCorrect && styles.correct,
                    isAnswered && isWrongSelected && styles.wrong,
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

      <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
        Exit
      </Button>

      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
}

const { width } = Dimensions.get("window");
const mascotSize = width * 0.45;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  counter: { marginBottom: 10, textAlign: "center", opacity: 0.7 },

  mascot: {
    width: mascotSize,
    height: mascotSize,
    alignSelf: "center",
    marginBottom: 10,
  },

  card: { marginBottom: 20 },
  question: { marginBottom: 20, fontWeight: "600" },

  option: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },

  correct: { backgroundColor: "#c6f6d5" },
  wrong: { backgroundColor: "#fed7d7" },

  optionText: { fontSize: 16, flexShrink: 1 },

  score: { marginTop: 16, textAlign: "center" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
