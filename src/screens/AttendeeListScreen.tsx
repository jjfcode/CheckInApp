import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attendee, Class } from '../types';

export const AttendeeListScreen: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [className, setClassName] = useState('');

  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      const classDataString = await AsyncStorage.getItem('currentClass');
      if (classDataString) {
        const classData: Class = JSON.parse(classDataString);
        setClassName(classData.name);
        setAttendees(classData.attendees);
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };
  const exportToCSV = async () => {
    try {
      // Create CSV content
      const headers = ['Full Name', 'Company Name', 'Email', 'Phone Number', 'Interested in Future Classes', 'Check-in Time', 'Class Name'];
      const rows = attendees.map(attendee => [
        attendee.fullName,
        attendee.companyName,
        attendee.email,
        attendee.phoneNumber,
        attendee.interestedInFutureClasses ? 'Yes' : 'No',
        new Date(attendee.timestamp).toLocaleString(),
        attendee.className
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(','))
      ].join('\n');

      if (Platform.OS === 'web') {
        // For web, create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${className.replace(/\s+/g, '_')}_attendees.csv`;
        link.click();
      } else {
        // For mobile, use Share API
        await Share.share({
          message: csvContent,
          title: `${className} Attendees`,
        });
      }

      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const renderItem = ({ item }: { item: Attendee }) => (
    <View style={styles.attendeeCard}>
      <Text style={styles.name}>{item.fullName}</Text>
      <Text style={styles.details}>{item.companyName}</Text>
      <Text style={styles.details}>{item.email}</Text>
      <Text style={styles.details}>{item.phoneNumber}</Text>
      <Text style={styles.interested}>
        {item.interestedInFutureClasses ? '✓ Interested in future classes' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.subtitle}>Attendees: {attendees.length}</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
          <Text style={styles.exportButtonText}>Export to CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  list: {
    padding: 20,
  },
  attendeeCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  interested: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
