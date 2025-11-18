import React, { useState } from "react";
import { ScrollView } from "react-native";
import { TextInput, Button, Card, IconButton, Text } from "react-native-paper";

export default function CreateReviewerScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [qaList, setQaList] = useState([
    { question: "", answer: "" }
  ]);

  const addItem = () => {
    setQaList([...qaList, { question: "", answer: "" }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...qaList];
    updated[index][field] = value;
    setQaList(updated);
  };

  const removeItem = (index) => {
    const updated = qaList.filter((_, i) => i !== index);
    setQaList(updated);
  };

  const saveReviewer = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    // Later: save to AsyncStorage
    console.log("Saved reviewer:", { title, qaList });
    alert("Reviewer saved (storage coming next!)");
    navigation.goBack();
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <TextInput
        label="Reviewer Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
      />

      <Text style={{ marginTop: 20, marginBottom: 10, fontSize: 18, fontWeight: "bold" }}>
        Questions & Answers
      </Text>

      {qaList.map((item, index) => (
        <Card key={index} style={{ marginBottom: 16, padding: 12 }}>
          <TextInput
            label={`Question ${index + 1}`}
            value={item.question}
            onChangeText={(text) => updateItem(index, "question", text)}
            mode="outlined"
          />

          <TextInput
            style={{ marginTop: 10 }}
            label={`Answer ${index + 1}`}
            value={item.answer}
            onChangeText={(text) => updateItem(index, "answer", text)}
            mode="outlined"
          />

          <IconButton
            icon="delete"
            size={24}
            onPress={() => removeItem(index)}
            style={{ alignSelf: "flex-end", marginTop: 6 }}
          />
        </Card>
      ))}

      <Button mode="contained" onPress={addItem} style={{ marginBottom: 20 }}>
        Add Q&A
      </Button>

      <Button mode="contained" onPress={saveReviewer}>
        Save Reviewer
      </Button>
    </ScrollView>
  );
}