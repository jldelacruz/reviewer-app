import { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, Button, Platform, PermissionsAndroid } from 'react-native';

import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  startListening, 
  stopListening,
  addEventListener
 } from '@ascendtis/react-native-voice-to-text';

import AppNavigation from './src/navigation/AppNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Request microphone permission
    async function requestMicrophonePermission() {
      if (Platform.OS !== 'android') return true;
      const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      
      if(isGranted) return;

      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for speech recognition',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    requestMicrophonePermission();

    const startEventListener = addEventListener('onSpeechStart', () => {
      setIsListening(true);
    });

    const endEventListener = addEventListener('onSpeechEnd', () => {
      console.log('onSpeechEnd');
      setIsListening(false);
    });

    const resultsEventListener = addEventListener('onSpeechResults', (e) => {
      console.log('onSpeechResults', e);
      setResult(e.value);
    });
    
    const errorEventListener = addEventListener('onSpeechError', (e) => {
      console.log('onSpeechError', e);
      setIsListening(false);
    });

    const resultsPartialEventListener = addEventListener('onSpeechPartialResults', (e) => {
      console.log('onSpeechPartialResults', e);
      setResult(e.value);
    });

    return () => {
      startEventListener.remove();
      endEventListener.remove();
      resultsEventListener.remove();
      errorEventListener.remove();
    }
  }, []);

  const _handlePressButton = async () => {
    await requestMicrophonePermission();

    try {
      if(isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider>
        <SafeAreaProvider>
          <AppNavigation />
          {/* <View style={styles.container}>
            <Text>{result || 'Say Something!'}</Text>
            <Button 
              title={isListening ? 'Stop Listening' : 'Start Listening'}
              onPress={_handlePressButton}
            />
          </View> */}
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});