import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { PaperProvider } from 'react-native-paper';
import AppNavigation from './src/navigation/AppNavigation';

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./src/navigation/BottomTabs";

import CreateReviewerScreen from "./src/screens/reviewers/CreateReviewerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Bottom Tabs */}
          <Stack.Screen 
            name="MainTabs" 
            component={BottomTabs} 
            options={{ headerShown: false }} 
          />

          {/* Screens NOT in tab bar */}
          <Stack.Screen 
            name="CreateReviewer" 
            component={CreateReviewerScreen}
            options={{ title: "Create Reviewer" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
