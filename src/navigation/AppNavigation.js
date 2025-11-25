import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import BottomTabs from "./BottomTabs";
import ReviewerDetailsScreen from "../screens/reviewers/ReviewerDetailsScreen";
import QnAFormScreen from "../screens/reviewers/QnAFormScreen";

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;