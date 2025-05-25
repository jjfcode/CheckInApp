import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { Attendee, Class } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;
};

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

export const CheckInScreen: React.FC<Props> = ({ navigation }) => {
  const [className, setClassName] = useState<string>('');
  const [attendee, setAttendee] = useState<Partial<Attendee>>({
    fullName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    interestedInFutureClasses: false,
  });

  useEffect(() => {
    const loadClassName = async () => {
      try {
        const classDataString = await AsyncStorage.getItem('currentClass');
        if (classDataString) {
          const currentClass: Class = JSON.parse(classDataString);
          setClassName(currentClass.name);
        }
      } catch (error) {
        console.error('Error loading class name:', error);
      }
    };

    loadClassName();
  }, []);

  const handleSubmit = async () => {
    if (!attendee.fullName || !attendee.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    try {
      const classDataString = await AsyncStorage.getItem('currentClass');
      if (!classDataString) {
        navigation.replace('ClassSetup');
        return;
      }

      const currentClass: Class = JSON.parse(classDataString);
      const newAttendee: Attendee = {
        id: Date.now().toString(),
        fullName: attendee.fullName,
        companyName: attendee.companyName || '',
        email: attendee.email,
        phoneNumber: attendee.phoneNumber || '',
        interestedInFutureClasses: attendee.interestedInFutureClasses || false,
        timestamp: new Date().toISOString(),
        className: currentClass.name,
      };

      currentClass.attendees.push(newAttendee);
      await AsyncStorage.setItem('currentClass', JSON.stringify(currentClass));

      // Reset form
      setAttendee({
        fullName: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        interestedInFutureClasses: false,
      });

      Alert.alert('Success', 'Check-in completed successfully!');
    } catch (error) {
      console.error('Error saving attendee:', error);
      Alert.alert('Error', 'Failed to save check-in data');
    }
  };

  const viewAttendees = () => {
    navigation.navigate('AttendeeList');
  };

  const handleTextChange = (field: keyof Pick<Attendee, 'fullName' | 'companyName' | 'email' | 'phoneNumber'>) => (text: string) => {
    setAttendee(prev => ({ ...prev, [field]: text }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Check-In</Text>
          {className && (
            <Text style={styles.subtitle}>{className}</Text>
          )}
        </View>
        <View style={[styles.form, { flex: 1 }]}>
          <CustomTextInput
            style={styles.input}
            placeholder="Full Name *"
            value={attendee.fullName}
            onChangeText={handleTextChange('fullName')}
          />

          <CustomTextInput
            style={styles.input}
            placeholder="Company Name"
            value={attendee.companyName}
            onChangeText={handleTextChange('companyName')}
          />

          <CustomTextInput
            style={styles.input}
            placeholder="Email *"
            value={attendee.email}
            onChangeText={handleTextChange('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomTextInput
            style={styles.input}
            placeholder="Phone Number"
            value={attendee.phoneNumber}
            onChangeText={handleTextChange('phoneNumber')}
            keyboardType="phone-pad"
          />

          <TouchableOpacity 
            style={styles.switchContainer}
            onPress={() => setAttendee(prev => ({ 
              ...prev, 
              interestedInFutureClasses: !prev.interestedInFutureClasses 
            }))}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>Interested in future classes?</Text>
            <View style={styles.switchWrapper}>
              <Switch
                value={attendee.interestedInFutureClasses}
                onValueChange={(value) =>
                  setAttendee(prev => ({ ...prev, interestedInFutureClasses: value }))
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={attendee.interestedInFutureClasses ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            accessibilityLabel="Complete check-in"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Complete Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, styles.secondaryButton]} 
            onPress={viewAttendees}
            accessibilityLabel="View attendees"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>View Attendees</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  switchWrapper: {
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
