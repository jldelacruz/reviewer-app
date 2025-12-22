import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform, Dimensions } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
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
  const mascotRef = useRef(null);

  // ---- Frame ranges ----
  const idleFrames = [0, 47];
  const transitionFrames = [54, 77];
  const listeningFrames = [70, 117];

  const snapPoints = useMemo(() => ["45%", "70%"], []);

  const openSheet = () => {
    bottomSheetRef.current?.expand();

    // Let the sheet finish animating before mascot moves
    setTimeout(() => {
      mascotRef.current?.play(idleFrames[0], idleFrames[1]);
    }, 250);
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
    setIsListening(false);
    mascotRef.current?.reset();
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}   // show backdrop when sheet opens
      disappearsOnIndex={-1} // hide when closed
      opacity={0.4}        // dim strength (tweak if you want)
      pressBehavior="close" // tap outside to close sheet
    />
  );


  // Ask for mic permission
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

  useEffect(() => {
    const startEvent = addEventListener("onSpeechStart", () => {
      setIsListening(true);

      // Idle ➜ Transition
      mascotRef.current?.play(transitionFrames[0], transitionFrames[1]);

      // Transition ➜ Listening loop
      setTimeout(() => {
        mascotRef.current?.play(listeningFrames[0], listeningFrames[1]);
      }, 600); // adjust to your transition duration
    });

    const endEvent = addEventListener("onSpeechEnd", () => {
      setIsListening(false);

      // Listening ➜ Transition (reverse)
      mascotRef.current?.play(
        transitionFrames[1],
        transitionFrames[0]
      );

      // Transition ➜ Idle loop
      setTimeout(() => {
        mascotRef.current?.play(idleFrames[0], idleFrames[1]);
      }, 600);
    });

    return () => {
      startEvent.remove();
      endEvent.remove();
    };
  }, []);

  // Start / Stop STT
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
      />

      <View style={styles.iconRow}>
        <IconButton
          icon="microphone"
          onPress={() => {
            setActiveField("question");
            openSheet();
          }}
        />
      </View>

      {/* ANSWER FIELD */}
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
        <IconButton
          icon="microphone"
          onPress={() => {
            setActiveField("answer");
            openSheet();
          }}
        />
      </View>

      <Button mode="contained" onPress={save} style={{ marginBottom: 10 }}>
        Save
      </Button>

      <Button mode="text" onPress={() => navigation.goBack()}>
        Cancel
      </Button>

      {/* BOTTOM SHEET WITH MASCOT + STT UI */}
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={-1} backdropComponent={renderBackdrop}>
        <BottomSheetView style={styles.sheetContainer}>
          <LottieView
            ref={mascotRef}
            source={require("../../assets/robot_listening.json")}
            style={styles.mascot}
            loop
            autoPlay={false}
          />

          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
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

const { width } = Dimensions.get("window");
const mascotSize = width * 0.55; // mascot scales based on screen width

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff" 
  },

  header: { 
    fontWeight: "700", 
    marginBottom: 16 
  },

  textArea: { 
    marginBottom: 10, 
    minHeight: 100 
  },

  iconRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 16 
  },

  sheetContainer: { 
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  mascot: {
    width: mascotSize,
    height: mascotSize,
    marginBottom: 10,
  },

  liveText: { 
    marginBottom: 20, 
    fontSize: 16, 
    opacity: 0.7,
    textAlign: "center",
  },
});

