import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

// Глобальный провайдер состояния
import { StoreProvider } from './src/store/StoreProvider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#f5f5f5" 
        />
        <StoreProvider>
          <AppNavigator />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
