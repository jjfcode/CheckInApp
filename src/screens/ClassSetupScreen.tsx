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

// Custom TextInput that handles web-specific props
const CustomTextInput = ({ style, ...props }: any) => (
  <TextInput
    {...props}
    style={style}
    {...(Platform.OS === 'web' ? {
      autoComplete: 'off',
      dataSet: { webkitAppearance: 'none' }
    } : {})}
  />
);

const TimeInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onPickerPress: () => void;
}> = ({ label, value, onChangeText, placeholder, onPickerPress }) => (
  <View style={styles.timeInput}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.timeInputContainer}>
      <CustomTextInput
        style={styles.timeInputField}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        accessibilityLabel={`${label} input`}
      />
      <TouchableOpacity
        style={styles.timeButton}
        onPress={onPickerPress}
        accessibilityLabel={`Select ${label}`}
        accessibilityRole="button"
      >
        <Text style={styles.timeButtonText}>🕐</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const ClassSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const formatTime = (input: string): string => {
    const numbers = input.replace(/[^0-9]/g, '');
    
    if (numbers.length >= 4) {
      const hours = parseInt(numbers.substring(0, 2));
      const minutes = parseInt(numbers.substring(2, 4));
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    return input;
  };

  const handleTimeChange = (text: string, setTime: (time: string) => void) => {
    const cleaned = text.replace(/[^0-9:]/g, '');
    if (cleaned.length <= 5) {
      if (!cleaned.includes(':') && cleaned.length === 4) {
        setTime(formatTime(cleaned));
      } else {
        setTime(cleaned);
      }
    }
  };

  const showTimePicker = (
    title: string,
    currentTime: string,
    setTime: (time: string) => void,
    defaultTimes: string[]
  ) => {
    Alert.alert(
      title,
      '',
      [
        ...defaultTimes.map(time => ({
          text: time,
          onPress: () => setTime(time)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleStartClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    const finalStartTime = formatTime(startTime) || '09:00';
    const finalEndTime = formatTime(endTime) || '17:00';

    try {
      const currentClass = {
        id: Date.now().toString(),
        name: className.trim(),
        date: new Date().toISOString().split('T')[0],
        startTime: finalStartTime,
        endTime: finalEndTime,
        attendees: []
      };
      
      await AsyncStorage.setItem('currentClass', JSON.stringify(currentClass));
      navigation.replace('CheckIn');
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Error', 'Failed to save class information');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>        <View style={[styles.formContainer, { flex: 1 }]}>
          <Text style={styles.title}>Class Setup</Text>
          
          <CustomTextInput
            style={styles.input}
            placeholder="Enter Class Name"
            value={className}
            onChangeText={setClassName}
            autoCapitalize="words"
            accessibilityLabel="Class name input"
          />
          
          <View style={styles.timeContainer}>
            <TimeInput
              label="Start Time"
              value={startTime}
              onChangeText={(text) => handleTimeChange(text, setStartTime)}
              placeholder="09:00"
              onPickerPress={() => showTimePicker(
                'Select Start Time',
                startTime,
                setStartTime,
                ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
              )}
            />
            
            <TimeInput
              label="End Time"
              value={endTime}
              onChangeText={(text) => handleTimeChange(text, setEndTime)}
              placeholder="17:00"
              onPickerPress={() => showTimePicker(
                'Select End Time',
                endTime,
                setEndTime,
                ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
              )}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !className.trim() && styles.buttonDisabled]}
            onPress={handleStartClass}
            disabled={!className.trim()}
            accessibilityLabel="Start class"
            accessibilityRole="button"
          >            <Text style={styles.buttonText}>Start Class</Text>
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
    marginBottom: 8,
    marginLeft: 5,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  timeInputField: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  timeButton: {
    width: 46,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  timeButtonText: {
    fontSize: 20,
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
