import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClassSetupScreen } from '../screens/ClassSetupScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { AttendeeListScreen } from '../screens/AttendeeListScreen';
import { RootStackParamList } from './types';
import { Footer } from '../components/Footer';

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const AppContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    {children}
    <Footer />
  </View>
);

export const Navigation = () => {
  return (
    <NavigationContainer>
      <AppContainer>
        <Stack.Navigator initialRouteName="ClassSetup">
          <Stack.Screen 
            name="ClassSetup" 
            component={ClassSetupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CheckIn" 
            component={CheckInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AttendeeList" 
            component={AttendeeListScreen}
            options={{ title: 'Attendee List' }}
          />
        </Stack.Navigator>
      </AppContainer>
    </NavigationContainer>
  );
};
