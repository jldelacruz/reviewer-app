import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  Text,
  Button,
  RadioButton,
  ProgressBar,
} from "react-native-paper";
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
  const [progress, setProgress] = useState(0);

  // 🤖 Mascot state
  const [mascotState, setMascotState] = useState("idle");
  const mascotRef = useRef(null);

  // 🎞 Frame ranges
  const idleFrames = [0, 47];
  const happyFrames = [47, 134];
  const sadFrames = [134, 210];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (items.length > 0) generateOptions();
  }, [items, index]);

  useFocusEffect(
    useCallback(() => {
      if (originalItems.length > 0) applyShuffle();
    }, [globalShuffle, originalItems])
  );

  const loadData = async () => {
    const key = `reviewer_${reviewer.id}_qa`;
    const saved = await AsyncStorage.getItem(key);
    setOriginalItems(saved ? JSON.parse(saved) : []);
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const applyShuffle = () => {
    setItems(globalShuffle ? shuffleArray(originalItems) : originalItems);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setIsAnswered(false);
    playIdle();
    setProgress(0);
  };

  const generateOptions = () => {
    const current = items[index];
    if (!current) return;

    const wrong = shuffleArray(
      items.filter((q) => q.id !== current.id).map((q) => q.answer)
    ).slice(0, 3);

    setOptions(shuffleArray([current.answer, ...wrong]));
    setSelected(null);
    setIsAnswered(false);
    playIdle();
  };

  // 🎭 Mascot controls
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

  const handleSelect = (opt) => {
    if (isAnswered) return;

    setSelected(opt);
    setIsAnswered(true);

    setProgress((prev) => prev + 1 / items.length);

    if (opt === items[index].answer) {
      setScore((s) => s + 1);
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
    setIndex((i) => i + 1);
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
      {/* 📊 PROGRESS BAR */}
      <ProgressBar
        progress={progress}
        style={styles.progress}
        animated
        color="#07CDFF"
      />

      <Text variant="titleLarge" style={styles.header}>
        {reviewer.name} — Quiz
      </Text>

      <Text style={styles.counter}>
        Question {index + 1} of {items.length}
      </Text>

      {/* 🤖 Mascot + 💬 Chat Bubble */}
      <View style={styles.questionRow}>
        <LottieView
          ref={mascotRef}
          source={require("../../assets/robot_quiz.json")}
          style={styles.mascot}
          autoPlay={false}
          loop={mascotState === "idle"}
          onAnimationFinish={() => {
            if (mascotState !== "idle") playIdle();
          }}
        />

        <View style={styles.bubbleWrapper}>
          <View style={styles.bubble}>
            <Text style={styles.questionText}>{current.question}</Text>
          </View>
        </View>
      </View>

      {/* ✅ Options */}
      <RadioButton.Group value={selected} onValueChange={handleSelect}>
        {options.map((opt, idx) => {
          const isCorrect = opt === current.answer;
          const isWrong = opt === selected && selected !== current.answer;

          return (
            <View
              key={idx}
              style={[
                styles.option,
                isAnswered && isCorrect && styles.correct,
                isAnswered && isWrong && styles.wrong,
              ]}
            >
              <RadioButton value={opt} disabled={isAnswered} />
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          );
        })}
      </RadioButton.Group>

      {isAnswered && (
        <Button mode="contained" onPress={next} style={{ marginTop: 10 }}>
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

      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
}

const { width } = Dimensions.get("window");
const mascotSize = width * 0.32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f3f3",
  },

  progress: {
    height: 8,
    borderRadius: 6,
    marginBottom: 16,
  },

  header: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },

  counter: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 16,
  },

  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  mascot: {
    width: mascotSize,
    height: mascotSize,
    marginRight: 12,
  },

  bubbleWrapper: {
    flex: 1,
  },

  bubble: {
    marginTop: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cfcfcfb0",
  },

  questionText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  option: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  correct: { backgroundColor: "#c6f6d5" },
  wrong: { backgroundColor: "#fed7d7" },

  optionText: {
    fontSize: 16,
    flexShrink: 1,
  },

  score: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
