import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClassSetup'>;
};

export const ClassSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [className, setClassName] = useState('');

  const handleStartClass = async () => {
    if (className.trim()) {
      try {
        const currentClass = {
          id: Date.now().toString(),
          name: className.trim(),
          date: new Date().toISOString(),
          attendees: []
        };
        await AsyncStorage.setItem('currentClass', JSON.stringify(currentClass));
        navigation.replace('CheckIn');
      } catch (error) {
        console.error('Error saving class:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Class Setup</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Class Name"
          value={className}
          onChangeText={setClassName}
          autoCapitalize="words"
        />
        <TouchableOpacity 
          style={[
            styles.button,
            !className.trim() && styles.buttonDisabled
          ]}
          onPress={handleStartClass}
          disabled={!className.trim()}
        >
          <Text style={styles.buttonText}>Start Class</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
