import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, FAB } from 'react-native-paper';

export default function ReviewersScreen({ navigation }) {
  const [reviewers, setReviewers] = useState([
    { id: '1', title: 'Biology Reviewer', count: 12 },
    { id: '2', title: 'Math Formulas', count: 8 },
    { id: '3', title: 'Civil Service Vocabulary', count: 25 },
  ]);

  const renderReviewer = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ReviewerDetails', { reviewer: item })}>
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleMedium">{item.title}</Text>
          <Text variant="bodySmall" style={{ marginTop: 4 }}>
            {item.count} Q&A items
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={reviewers}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewer}
      />

      {/* Floating Add Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
        }}
        onPress={() => navigation.navigate('ReviewerDetails')}
      />
    </View>
  );
}
