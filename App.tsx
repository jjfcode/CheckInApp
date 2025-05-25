import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Navigation } from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Navigation />
          <StatusBar style="auto" />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
