// src/screens/ReviewersScreen.js
import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { FAB, Text } from "react-native-paper";
import uuid from "react-native-uuid";
import ReviewerCard from "../../components/ReviewerCard";
import ReviewerModal from "../../components/ReviewerModal";
import { loadReviewers, saveReviewers } from "../../services/reviewerStorage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { pastel } from "../../theme/pastel";

export default function ReviewersScreen({ navigation }) {
  const [reviewers, setReviewers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [titleValue, setTitleValue] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState(null);


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

  return (
    <View style={styles.container}>
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
          />
        )}
      />

      {/* Add/Edit Modal */}
      <ReviewerModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title={editMode ? "Edit Reviewer" : "Add Reviewer"}
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

      <FAB icon="plus" style={styles.fab} color="#fff" onPress={openAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAF7FF",
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
