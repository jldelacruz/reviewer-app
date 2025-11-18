import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import Reviewers from '../screens/reviewers/ReviewersScreen';

const HomeRoute = () => <Text>Home</Text>;

const ReviewersRoute = () => <Reviewers />;

const SettingsRoute = () => <Text>Settings</Text>;

const AppNavigation = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'heart', unfocusedIcon: 'heart-outline'},
    { key: 'reviewers', title: 'Reviewers', focusedIcon: 'album' },
    { key: 'settings', title: 'Settings', focusedIcon: 'history' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    reviewers: ReviewersRoute,
    settings: SettingsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default AppNavigation;