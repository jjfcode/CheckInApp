import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { Attendee, Class } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;
};

export const CheckInScreen: React.FC<Props> = ({ navigation }) => {
  const [attendee, setAttendee] = useState<Partial<Attendee>>({
    fullName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    interestedInFutureClasses: false,
  });

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Check-In</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={attendee.fullName}
            onChangeText={(text) => setAttendee({ ...attendee, fullName: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={attendee.companyName}
            onChangeText={(text) => setAttendee({ ...attendee, companyName: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={attendee.email}
            onChangeText={(text) => setAttendee({ ...attendee, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={attendee.phoneNumber}
            onChangeText={(text) => setAttendee({ ...attendee, phoneNumber: text })}
            keyboardType="phone-pad"
          />          <TouchableOpacity 
            style={styles.switchContainer}
            onPress={() => setAttendee({ 
              ...attendee, 
              interestedInFutureClasses: !attendee.interestedInFutureClasses 
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>Interested in future classes?</Text>
            <View style={styles.switchWrapper}>
              <Switch
                value={attendee.interestedInFutureClasses}
                onValueChange={(value) =>
                  setAttendee({ ...attendee, interestedInFutureClasses: value })
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={attendee.interestedInFutureClasses ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Complete Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, styles.secondaryButton]} 
            onPress={viewAttendees}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
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
