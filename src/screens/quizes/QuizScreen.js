import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable  } from "react-native";
import {
  Text,
  Button,
  RadioButton,
  ProgressBar,
  IconButton,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pastel } from "../../theme/pastel";

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

  // 🧠 Typing effect
  const [typedText, setTypedText] = useState("");

  // 🤖 Mascot
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

  // ✍️ Typing animation
  useEffect(() => {
    if (!items.length) return;

    const fullText = items[index]?.question || "";
    let i = 0;

    setTypedText("");

    const interval = setInterval(() => {
      i++;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [index, items]);

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
    setProgress(0);
    setSelected(null);
    setIsAnswered(false);
    playIdle();
  };

  const generateOptions = () => {
    const current = items[index];
    if (!current) return;

    const wrong = shuffleArray(
      items
        .filter((q) => q.id !== current.id)
        .map((q) => q.answer)
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

  const handleSkip = () => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelected(null); // nothing selected
    setProgress((p) => p + 1 / items.length);

    // Skip is always wrong
    playSad();
  };

  // 👉 Select only
  const handleSelect = (opt) => {
    if (isAnswered) return;
    setSelected(opt);
  };

  // ✅ Submit
  const handleSubmit = () => {
    if (!selected || isAnswered) return;

    setIsAnswered(true);
    setProgress((p) => p + 1 / items.length);

    if (selected === items[index].answer) {
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
  const isTyping = typedText.length < current.question.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {/* 📊 Progress + Exit */}
        <View style={styles.progressRow}>
          <IconButton
            icon="close"
            size={22}
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          />

          <View style={styles.progressWrapper}>
            <ProgressBar
              progress={progress}
              color={pastel.primary}
              style={styles.progress}
              animated 
              animationType="timing"
            />
          </View>
        </View>

        <Text style={styles.counter}>
          Question {index + 1} of {items.length}
        </Text>

        <Text variant="titleLarge" style={styles.header}>
          {reviewer.title} — Quiz
        </Text>

        {/* 🤖 Mascot + 💬 Bubble */}
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
              <Text style={styles.questionText}>{typedText}</Text>
            </View>
          </View>
        </View>

        {/* ✅ Options */}
        <RadioButton.Group value={selected} onValueChange={handleSelect}>
          {options.map((opt, idx) => {
            const isSelected = selected === opt;
            const isCorrect = opt === current.answer;
            const isWrong = isAnswered && isSelected && opt !== current.answer;

            return (
              <Pressable
                key={idx}
                onPress={() => handleSelect(opt)}
                disabled={isAnswered || isTyping}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  isAnswered && isCorrect && styles.correct,
                  isWrong && styles.wrong,
                ]}
              >
                <RadioButton
                  value={opt}
                  color={pastel.primary}
                  disabled={isAnswered || isTyping}
                />

                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </RadioButton.Group>
      </View>

      {/* 🔒 BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        {!isAnswered ? (
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              onPress={handleSkip}
              disabled={isTyping}
              style={styles.skipBtn}
              icon="arrow-right"
            >
              SKIP
            </Button>

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!selected || isTyping}
              style={styles.submitBtn}
              buttonColor={pastel.primary}
              icon="check"
            >
              SUBMIT
            </Button>
          </View>
        ) : (
          <Button mode="contained" onPress={next} buttonColor={pastel.primary} icon="arrow-right">
            {index + 1 === items.length ? "FINISH" : "CONTINUE"}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const mascotSize = width * 0.32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: pastel.light
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
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
    borderColor: "#cfcfcfff",
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

    borderWidth: 2,
    borderColor: "#fff"
  },
  optionSelected: {
    borderColor: pastel.primary, // 🔵 blue border when selected
    backgroundColor: "#eef8ff",
    borderWidth: 2,
  },
  correct: {
    backgroundColor: "#c6f6d5",
  },
  wrong: {
    backgroundColor: "#fed7d7",
  },
  optionText: {
    fontSize: 16,
    flexShrink: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeBtn: {
    margin: 0,
  },
  progressWrapper: {
    flex: 1,              // ⭐ THIS makes it visible
    justifyContent: "center",
  },
  progress: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: pastel.light,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  skipBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
