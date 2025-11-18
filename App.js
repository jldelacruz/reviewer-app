import { PaperProvider } from 'react-native-paper';

import AppNavigation from './src/navigation/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
}