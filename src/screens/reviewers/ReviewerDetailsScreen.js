import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, FAB } from 'react-native-paper';

export default function ReviewerDetailScreen({ route, navigation }) {
  const { reviewer } = route.params;

  const [qaList, setQaList] = useState([
    { id: '1', question: 'What is photosynthesis?', answer: 'Process where plants make food.' },
    { id: '2', question: 'What is a cell?', answer: 'Basic unit of life.' },
  ]);

  const renderItem = ({ item }) => (
    <Card style={{ marginBottom: 12 }} onPress={() =>
      navigation.navigate('EditQA', { qa: item, reviewerId: reviewer.id })
    }>
      <Card.Content>
        <Text variant="titleSmall">{item.question}</Text>
        <Text variant="bodySmall" style={{ marginTop: 4 }}>{item.answer}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
        {reviewer.title}
      </Text>

      <FlatList
        data={qaList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* floating add Q&A button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
        }}
        onPress={() =>
          navigation.navigate('CreateQA', { reviewerId: reviewer.id })
        }
      />
    </View>
  );
}
