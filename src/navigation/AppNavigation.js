import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import BottomTabs from "./BottomTabs";
import ReviewerDetailsScreen from "../screens/reviewers/ReviewerDetailsScreen";
import QnAFormScreen from "../screens/reviewers/QnAFormScreen";
import QuizScreen from "../screens/quizes/QuizScreen";

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabs} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="ReviewerDetails" 
          component={ReviewerDetailsScreen}
          options={{ title: "Reviewer Title" }}
        />

        <Stack.Screen 
          name="QnAForm" 
          component={QnAFormScreen}
          options={{ title: "Q & A Title" }}
        />

        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen}
          options={{ title: "Quiz" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;