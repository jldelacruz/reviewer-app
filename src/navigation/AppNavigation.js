import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import BottomTabs from "./BottomTabs";
import ReviewerDetailsScreen from "../screens/reviewers/ReviewerDetailsScreen";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;