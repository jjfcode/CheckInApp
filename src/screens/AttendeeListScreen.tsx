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
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attendee, Class } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as FileSystem from 'expo-file-system';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type AdminAction = 'export' | 'newClass';

export const AttendeeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [className, setClassName] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<AdminAction>('newClass');

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

  const generateCSV = () => {
    const headers = ['Full Name', 'Company Name', 'Email', 'Phone Number', 'Interested in Future Classes', 'Check-in Time', 'Class Name'];
    const rows = attendees.map(attendee => [      attendee.fullName,
      attendee.companyName,
      attendee.email,
      attendee.phoneNumber,
      attendee.interestedInFutureClasses ? 'Yes' : 'No',
      new Date(attendee.timestamp).toISOString().replace('T', ' ').split('.')[0], // Format: YYYY-MM-DD HH:mm:ss
      attendee.className
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(','))
    ].join('\n');
  };

  const exportToCSV = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `${className.replace(/\s+/g, '_')}_attendees.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      } else {
        try {
          // Crear archivo temporal
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8
          });

          // Compartir el archivo
          const shareResult = await Share.share({
            url: fileUri,
            title: `${className} Attendees`,
            message: Platform.select({
              ios: fileUri,
              android: `${className} Attendees List` // Android no necesita el URI en el mensaje
            }) || '',
          });

          // Limpiar el archivo temporal después de compartir
          if (shareResult.action !== Share.dismissedAction) {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
            Alert.alert('Success', 'Data exported successfully!');
          }
          
          return true;
        } catch (error) {
          console.error('Error sharing file:', error);
          Alert.alert('Error', 'Failed to share file');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
      return false;
    }
  };

  const handleExport = async () => {
    setCurrentAction('export');
    setShowAdminDialog(true);
  };

  const handleNewClass = async () => {
    setCurrentAction('newClass');
    setShowAdminDialog(true);
  };

  const handleAdminSubmit = async () => {
    if (isProcessing) return;
    
    if (adminCode === 'admin') {
      setIsProcessing(true);
      
      try {
        if (currentAction === 'newClass') {
          if (attendees.length > 0) {
            // Show export confirmation
            Alert.alert(
              'Export Data',
              'Do you want to export the current class data before creating a new class?',
              [
                {
                  text: 'No',
                  style: 'cancel',
                  onPress: async () => {
                    await AsyncStorage.removeItem('currentClass');
                    setShowAdminDialog(false);
                    setAdminCode('');
                    setIsProcessing(false);
                    navigation.replace('ClassSetup');
                  }
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    const exported = await exportToCSV();
                    await AsyncStorage.removeItem('currentClass');
                    setShowAdminDialog(false);
                    setAdminCode('');
                    setIsProcessing(false);
                    navigation.replace('ClassSetup');
                  }
                }
              ]
            );
          } else {
            await AsyncStorage.removeItem('currentClass');
            setShowAdminDialog(false);
            setAdminCode('');
            setIsProcessing(false);
            navigation.replace('ClassSetup');
          }
        } else if (currentAction === 'export') {
          await exportToCSV();
          setShowAdminDialog(false);
          setAdminCode('');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing action:', error);
        Alert.alert('Error', `Failed to ${currentAction === 'newClass' ? 'start new class' : 'export data'}`);
        setIsProcessing(false);
      }
    } else {
      Alert.alert('Error', 'Invalid admin code');
      setAdminCode('');
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
        <View style={styles.buttonContainer}>          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExport}
          >
            <Text style={styles.exportButtonText}>Export to CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.exportButton, styles.newClassButton]} 
            onPress={handleNewClass}
          >
            <Text style={styles.exportButtonText}>New Class</Text>
          </TouchableOpacity>
        </View>
      </View>      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={() => (
          <Text style={styles.footer}>
            Created by JJF Code 2025 v1.0.0
          </Text>
        )}
      />

      <Modal
        visible={showAdminDialog}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isProcessing) {
            setShowAdminDialog(false);
            setAdminCode('');
          }
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>
              {currentAction === 'newClass' ? 'Admin Verification' : 'Export Verification'}
            </Text>
            <TextInput
              style={styles.adminInput}
              placeholder="Enter admin code"
              value={adminCode}
              onChangeText={setAdminCode}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!isProcessing}
              onSubmitEditing={handleAdminSubmit}
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.cancelButton]} 
                onPress={() => {
                  if (!isProcessing) {
                    setShowAdminDialog(false);
                    setAdminCode('');
                  }
                }}
                disabled={isProcessing}
              >
                <Text style={[
                  styles.cancelButtonText,
                  isProcessing && styles.disabledText
                ]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.dialogButton, 
                  styles.submitButton,
                  isProcessing && styles.disabledButton
                ]} 
                onPress={handleAdminSubmit}
                disabled={isProcessing}
              >
                <Text style={styles.dialogButtonText}>
                  {isProcessing ? 'Processing...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>    </SafeAreaView>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
  },
  newClassButton: {
    backgroundColor: '#34C759',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  adminInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dialogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  footer: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});
