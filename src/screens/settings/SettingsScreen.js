// SettingsScreen.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [shuffleAll, setShuffleAll] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem("global_shuffle");
    if (saved !== null) setShuffleAll(JSON.parse(saved));
  };

  const toggleShuffle = async () => {
    const newVal = !shuffleAll;
    setShuffleAll(newVal);
    await AsyncStorage.setItem("global_shuffle", JSON.stringify(newVal));
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.header}>
        Settings
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Shuffle All Quizzes</Text>
        <Switch value={shuffleAll} onValueChange={toggleShuffle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  header: { fontWeight: "700", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#efefef",
    borderRadius: 8,
  },
  label: { fontSize: 16 },
});
