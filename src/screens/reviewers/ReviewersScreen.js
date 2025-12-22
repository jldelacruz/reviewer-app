// src/screens/ReviewersScreen.js
import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { FAB, Text, Button } from "react-native-paper";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import ReviewerCard from "../../components/ReviewerCard";
import ReviewerModal from "../../components/ReviewerModal";
import ConfirmDialog from "../../components/ConfirmDialog";


import { loadReviewers, saveReviewers } from "../../services/reviewerStorage";
import { pastel } from "../../theme/pastel";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewersScreen({ navigation }) {
  const [reviewers, setReviewers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [titleValue, setTitleValue] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState(null);

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["45%", "70%"], []);

    const openSheet = () => {
    bottomSheetRef.current?.expand();

    // Let the sheet finish animating before mascot moves
    // setTimeout(() => {
    //   mascotRef.current?.play(idleFrames[0], idleFrames[1]);
    // }, 250);
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
    // setIsListening(false);
    // mascotRef.current?.reset();
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

  useEffect(() => {
    (async () => {
      const stored = await loadReviewers();
      setReviewers(stored);
    })();
  }, []);

  const openAdd = () => {
    setEditMode(false);
    setTitleValue("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditMode(true);
    setCurrentId(item.id);
    setTitleValue(item.title);
    setModalVisible(true);
  };

  const askDeleteReviewer = (id) => {
    setSelectedReviewerId(id);
    setConfirmVisible(true);
  };

  const saveReviewer = () => {
    if (!titleValue.trim()) return;

    let updated;

    if (editMode) {
      updated = reviewers.map((r) =>
        r.id === currentId ? { ...r, title: titleValue.trim() } : r
      );
    } else {
      updated = [
        ...reviewers,
        { id: uuid.v4(), title: titleValue.trim(), count: 0 },
      ];
    }

    setReviewers(updated);
    saveReviewers(updated);
    setModalVisible(false);
  };

  const deleteReviewer = (id) => {
    const updated = reviewers.filter(r => r.id !== selectedReviewerId);
    setReviewers(updated);
    saveReviewers(updated);

    setConfirmVisible(false);
  };

  const playReviewer = async (reviewer) => {
    openSheet();
    try {
      const storageKey = `reviewer_${reviewer.id}_qa`;
      const saved = await AsyncStorage.getItem(storageKey);

      if (!saved) {
        Speech.speak("This reviewer has no questions yet.");
        return;
      }

      const list = JSON.parse(saved);

      if (list.length === 0) {
        Speech.speak("This reviewer has no questions yet.");
        return;
      }

      let script = "";
      list.forEach((item, index) => {
        script += `Question ${index + 1}. ${item.question}. Answer: ${item.answer}. `;
      });

      Speech.speak(`Let's start reviewing ${reviewer.title}. ` + script, { rate: 0.70, pitch: 1.0 });

    } catch (err) {
      console.log("TTS error", err);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineSmall" style={styles.headerText}>
        Reviewers
      </Text>

      <FlatList
        data={reviewers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewerCard
            item={item}
            onPress={() => navigation.navigate("ReviewerDetails", { reviewer: item })}
            onEdit={() => openEdit(item)}
            onDelete={() => askDeleteReviewer(item.id)}
            onPlay={() => playReviewer(item)}
          />
        )}
      />

      {/* Add/Edit Modal */}
      <ReviewerModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title={editMode ? "Edit Reviewer" : "Create Reviewer"}
        value={titleValue}
        setValue={setTitleValue}
        onSave={saveReviewer}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete Reviewer"
        message="Are you sure you want to delete this reviewer?"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={deleteReviewer}
      />

      {/* BOTTOM SHEET WITH MASCOT + STT UI */}
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={-1} backdropComponent={renderBackdrop}>
        <BottomSheetView style={styles.sheetContainer}>
          {/* <LottieView
            ref={mascotRef}
            source={require("../../assets/robot_listening.json")}
            style={styles.mascot}
            loop
            autoPlay={false}
          /> */}

          {/* <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            {activeField === "question"
              ? "Dictating Question"
              : "Dictating Answer"}
          </Text> */}

          {/* <Text style={styles.liveText}>
            {sttText || "Say something..."}
          </Text> */}

          {/* <Button mode="contained" onPress={toggleListening}>
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button> */}

          <Button mode="text" onPress={closeSheet} style={{ marginTop: 10 }}>
            Close
          </Button>
        </BottomSheetView>
      </BottomSheet>

      <FAB icon="notebook-edit" style={styles.fab} color="#fff" onPress={openAdd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: pastel.light,
  },
  headerText: {
    fontWeight: "700",
    marginBottom: 12,
    color: pastel.textDark,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: pastel.primary,
  },
});
