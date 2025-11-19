// src/components/ReviewerCard.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, IconButton, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { pastel } from "../theme/pastel";

export default function ReviewerCard({ item, onPress, onEdit, onDelete, onPlay }) {
  return (
    <TouchableRipple
      onPress={onPress}
      rippleColor="rgba(0,0,0,0.07)"
      style={{ marginBottom: 14, borderRadius: 18 }}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.row}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#fff" />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.count}>
              {item.count} Q&A items
            </Text>
          </View>

          <IconButton icon="play" size={23} onPress={onPlay} />
          <IconButton icon="pencil" size={20} onPress={onEdit} />
          <IconButton icon="delete" size={20} onPress={onDelete} />
        </Card.Content>
      </Card>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    elevation: 3,
    backgroundColor: pastel.card,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: pastel.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    color: pastel.textDark,
  },
  count: {
    marginTop: 2,
    color: pastel.textLight,
  },
});
