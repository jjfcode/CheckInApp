import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClassSetup'>;
};

export const ClassSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const validateTime = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };
  const handleStartClass = async () => {
    try {
      const currentClass = {
        id: Date.now().toString(),
        name: className.trim(),
        date: new Date().toISOString().split('T')[0],
        startTime: startTime || '09:00',
        endTime: endTime || '17:00',
        attendees: []
      };

      console.log('Saving class:', currentClass); // Debug log
      
      await AsyncStorage.setItem('currentClass', JSON.stringify(currentClass));
      console.log('Class saved successfully'); // Debug log
      
      navigation.replace('CheckIn');
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Error', 'Failed to save class information');
    }
  };

  return (    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Class Setup</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Class Name"
            value={className}
            onChangeText={setClassName}
            autoCapitalize="words"
          />
          
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={[styles.input, styles.timeField]}
                placeholder="09:00"
                value={startTime}
                onChangeText={setStartTime}
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                maxLength={5}
                onBlur={() => {
                  if (startTime.length === 4 && !startTime.includes(':')) {
                    setStartTime(startTime.slice(0, 2) + ':' + startTime.slice(2));
                  }
                }}
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={[styles.input, styles.timeField]}
                placeholder="17:00"
                value={endTime}
                onChangeText={setEndTime}
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                maxLength={5}
                onBlur={() => {
                  if (endTime.length === 4 && !endTime.includes(':')) {
                    setEndTime(endTime.slice(0, 2) + ':' + endTime.slice(2));
                  }
                }}
              />
            </View>
          </View>          <TouchableOpacity 
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
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginLeft: 5,
  },
  timeField: {
    textAlign: 'center',
    marginBottom: 0,
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
