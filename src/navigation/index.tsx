import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClassSetupScreen } from '../screens/ClassSetupScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { AttendeeListScreen } from '../screens/AttendeeListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};
