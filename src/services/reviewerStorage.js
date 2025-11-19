// src/services/reviewerStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "reviewers";

export const loadReviewers = async () => {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.log("Load reviewers error:", err);
    return [];
  }
};

export const saveReviewers = async (list) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.log("Save reviewers error:", err);
  }
};
