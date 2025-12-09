import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  startListening,
  stopListening,
  addEventListener,
} from "@ascendtis/react-native-voice-to-text";

import LottieView from "lottie-react-native";

export default function QnAFormScreen({ route, navigation }) {
  const { reviewer, editingItem } = route.params;

  const [question, setQuestion] = useState(editingItem?.question || "");
  const [answer, setAnswer] = useState(editingItem?.answer || "");

  const [activeField, setActiveField] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [sttText, setSttText] = useState("");

  const bottomSheetRef = useRef(null);

  // ⭐ Two animations
  const idleRef = useRef(null);
  const listeningRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const openSheet = () => {
    bottomSheetRef.current?.expand();
    setTimeout(() => {
      idleRef.current?.play(); // 🟢 Play IDLE when sheet opens
    }, 150);
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
    setIsListening(false);

    // Reset animations
    listeningRef.current?.reset();
    idleRef.current?.reset();
  };

  // MIC permission
  async function requestMicPermission() {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message: "This app needs microphone access for speech recognition.",
        buttonPositive: "OK",
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // STT Event Listeners
  useEffect(() => {
    const startEvent = addEventListener("onSpeechStart", () => {
      setIsListening(true);
    });

    const endEvent = addEventListener("onSpeechEnd", () => {
      setIsListening(false);
    });

    const resultsEvent = addEventListener("onSpeechResults", (e) => {
      setSttText(e.value);
      if (activeField === "question") setQuestion(e.value);
      if (activeField === "answer") setAnswer(e.value);
    });

    const partialEvent = addEventListener("onSpeechPartialResults", (e) => {
      setSttText(e.value);
      if (activeField === "question") setQuestion(e.value);
      if (activeField === "answer") setAnswer(e.value);
    });

    return () => {
      startEvent.remove();
      endEvent.remove();
      resultsEvent.remove();
      partialEvent.remove();
    };
  }, [activeField]);

  // Animation state controller
  useEffect(() => {
    if (isListening) {
      idleRef.current?.reset();
      listeningRef.current?.play(); // 🔴 Animate listening
    } else {
      listeningRef.current?.reset();
      idleRef.current?.play(); // 🟢 Back to idle
    }
  }, [isListening]);

  // Toggle STT
  const toggleListening = async () => {
    const ok = await requestMicPermission();
    if (!ok) return;

    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (e) {
      console.log("STT Error:", e);
    }
  };

  // Save Q&A
  const save = async () => {
    if (!question.trim() || !answer.trim()) return;

    const key = `reviewer_${reviewer.id}_qa`;
    const saved = await AsyncStorage.getItem(key);
    let list = saved ? JSON.parse(saved) : [];

    if (editingItem) {
      list = list.map((q) =>
        q.id === editingItem.id ? { ...q, question, answer } : q
      );
    } else {
      list.push({
        id: Date.now().toString(),
        question,
        answer,
      });
    }

    await AsyncStorage.setItem(key, JSON.stringify(list));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>
        {editingItem ? "Edit Q&A" : "Add Q&A"}
      </Text>

      {/* QUESTION FIELD */}
      <TextInput
        label="Question"
        mode="outlined"
        multiline
        numberOfLines={4}
        value={question}
        onChangeText={setQuestion}
        style={styles.textArea}
        right={
          <TextInput.Icon icon="microphone" onPress={() => {
            setActiveField("question");
            openSheet();
          }} />
        }
      />

      {/* ANSWER FIELD */}
      <TextInput
        label="Answer"
        mode="outlined"
        multiline
        numberOfLines={4}
        value={answer}
        onChangeText={setAnswer}
        style={styles.textArea}
        right={
          <TextInput.Icon icon="microphone" onPress={() => {
            setActiveField("answer");
            openSheet();
          }} />
        }
      />
      <Button mode="contained" onPress={save} style={{ marginBottom: 10, marginTop: 30 }}>
        Save
      </Button>

      <Button mode="text" onPress={() => navigation.goBack()}>
        Cancel
      </Button>

      {/* BOTTOM SHEET */}
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={-1}>
        <BottomSheetView style={styles.sheetContainer}>

          {/* IDLE Animation */}
          <LottieView
            ref={idleRef}
            source={require("../../assets/robot_idle.json")}
            style={[
              styles.robot,
              { opacity: isListening ? 0 : 1 } // 👈 hide when listening
            ]}
            loop
            autoPlay={false}
          />

          {/* LISTENING Animation */}
          <LottieView
            ref={listeningRef}
            source={require("../../assets/robot_listening.json")}
            style={[
              styles.robot,
              { 
                opacity: isListening ? 1 : 0, // 👈 show only when listening
                position: "absolute"
              }
            ]}
            loop
            autoPlay={false}
          />

          <Text variant="titleMedium" style={{ marginTop: 10, marginBottom: 10 }}>
            {activeField === "question"
              ? "Dictating Question"
              : "Dictating Answer"}
          </Text>

          <Text style={styles.liveText}>
            {sttText || "Say something..."}
          </Text>

          <Button mode="contained" onPress={toggleListening}>
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>

          <Button mode="text" onPress={closeSheet} style={{ marginTop: 10 }}>
            Close
          </Button>

        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", },
  header: { fontWeight: "700", marginBottom: 16 },
  textArea: { marginBottom: 10, minHeight: 100 },
  iconRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sheetContainer: { padding: 20, alignItems: "center" },
  liveText: { marginBottom: 20, fontSize: 16, opacity: 0.7 },
  robot: { width: 150, height: 150 },
});
