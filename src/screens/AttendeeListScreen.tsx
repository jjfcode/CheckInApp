// filepath: c:\code\CheckInApp\src\screens\AttendeeListScreen.tsx
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
    
    // Function to properly escape CSV fields
    const escapeCSVField = (field: string | null | undefined): string => {
      if (field === null || field === undefined) return '""';
      const stringValue = String(field);
      // If the field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
      }
      return '"' + stringValue + '"';
    };
    
    const rows = attendees.map(attendee => {
      // Format timestamp to readable date/time
      let formattedTime = '';
      try {
        const date = new Date(attendee.timestamp);
        if (!isNaN(date.getTime())) {
          formattedTime = date.toISOString().replace('T', ' ').split('.')[0]; // Format: YYYY-MM-DD HH:mm:ss
        } else {
          formattedTime = 'Unknown Time';
        }
      } catch (e) {
        formattedTime = 'Invalid Date';
      }
      
      return [
        attendee.fullName || '',
        attendee.companyName || '',
        attendee.email || '',
        attendee.phoneNumber || '',
        attendee.interestedInFutureClasses ? 'Yes' : 'No',
        formattedTime,
        attendee.className || ''
      ];
    });
    
    // Generate CSV content
    const headerLine = headers.map(header => escapeCSVField(header)).join(',');
    const dataLines = rows.map(row => row.map(cell => escapeCSVField(cell)).join(','));
    
    // Add BOM for Excel compatibility with special characters
    return '\uFEFF' + [headerLine, ...dataLines].join('\n');
  };

  const exportToCSV = async () => {
    try {
      const csvContent = generateCSV();
      const fileName = `${className.replace(/\s+/g, '_')}_attendees.csv`;

      if (Platform.OS === 'web') {
        // Web implementation
        try {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          Alert.alert('Success', 'Data exported successfully!');
        } catch (error) {
          console.error('Error in web export:', error);
          Alert.alert('Error', 'Failed to export data on web');
        }
        return true;      } else {
        // Mobile implementation
        try {
          console.log('[CSV Export] Starting export process for mobile');
          console.log('[CSV Export] CSV content length:', csvContent.length);
          
          // Check if FileSystem is available
          if (!FileSystem) {
            console.error('[CSV Export] FileSystem is not available');
            Alert.alert('Error', 'File system module is not available');
            return false;
          }
          
          if (!FileSystem.documentDirectory) {
            console.error('[CSV Export] documentDirectory is not available');
            Alert.alert('Error', 'File system directory is not accessible');
            return false;
          }

          console.log('[CSV Export] FileSystem is available:', FileSystem.documentDirectory);
          
          // Create temporary file with unique name and proper path
          const timestamp = new Date().getTime();
          const fileName = `${className.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          
          console.log(`[CSV Export] Preparing to write file: ${fileUri}`);
          
          // Write CSV content to file with error handling
          try {
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
              encoding: FileSystem.EncodingType.UTF8
            });
            console.log('[CSV Export] File written successfully');
          } catch (writeError: any) {
            console.error('[CSV Export] Error writing file:', writeError);
            Alert.alert('Export Error', `Failed to write file: ${writeError.message || 'Unknown error'}`);
            return false;
          }          // Verify file exists and has content
          try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            console.log(`[CSV Export] File check - exists: ${fileInfo.exists}`);
            
            if (!fileInfo.exists) {
              console.error('[CSV Export] File was not created successfully');
              Alert.alert('Error', 'Failed to create export file');
              return false;
            }
            
            if ('size' in fileInfo && typeof fileInfo.size === 'number') {
              console.log(`[CSV Export] File size: ${fileInfo.size} bytes`);
              if (fileInfo.size === 0) {
                console.error('[CSV Export] File is empty');
                Alert.alert('Error', 'Export file is empty');
                return false;
              }
            }
          } catch (checkError: any) {
            console.error('[CSV Export] Error checking file:', checkError);
            // Continue anyway since the file might still be usable
          }
            // Share the file using Share API
          try {
            console.log(`[CSV Export] Attempting to share file: ${fileUri}`);
            
            // Prepare share options based on platform
            const shareOptions = {
              url: fileUri,
              title: `${className} Attendees`,
              message: Platform.OS === 'ios' 
                ? `${className} Attendees List` 
                : `${className} Attendees List - ${new Date().toLocaleDateString()}`,
            };
            
            const dialogOptions = {
              dialogTitle: `Share ${className} Attendees Data`,
              subject: `${className} Attendees Data - ${new Date().toLocaleDateString()}`,
              tintColor: '#007AFF'
            };
            
            console.log('[CSV Export] Share options:', JSON.stringify(shareOptions));
            const shareResult = await Share.share(shareOptions, dialogOptions);

            console.log('[CSV Export] Share result:', JSON.stringify(shareResult));
            
            // Clean up temporary file after sharing
            if (shareResult.action !== Share.dismissedAction) {
              try {
                await FileSystem.deleteAsync(fileUri, { idempotent: true });
                console.log('[CSV Export] Temporary file deleted successfully');
              } catch (cleanupError: any) {
                console.warn('[CSV Export] Failed to delete temporary file:', cleanupError?.message || cleanupError);
                // Non-critical error, continue
              }
              
              Alert.alert('Success', 'Data exported successfully!');
            } else {
              console.log('[CSV Export] Share dismissed, keeping temporary file');
            }
          } catch (shareError: any) {
            console.error('[CSV Export] Error sharing file:', shareError?.message || shareError);
            
            // If sharing fails, offer to retry or cancel
            Alert.alert(
              'Sharing Failed',
              'Could not share the CSV file. Would you like to try again?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: async () => {
                    // Clean up the file
                    try {
                      await FileSystem.deleteAsync(fileUri, { idempotent: true });
                    } catch (e) {} // Ignore cleanup errors
                  }
                },
                {
                  text: 'Try Again',
                  onPress: async () => {
                    // Try sharing again
                    try {
                      await Share.share({
                        url: fileUri,
                        title: `${className} Attendees`,
                        message: `${className} Attendees List`,
                      });
                    } catch (e) {
                      Alert.alert('Error', 'Failed to share file. Please try a different export method.');
                    }
                  }
                }
              ]            );
          }
          
          return true;
        } catch (error: any) {
          console.error('Error in mobile export process:', error);
          Alert.alert('Export Error', `Failed to export data: ${error.message || 'Unknown error'}`);
          return false;
        }
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', `Failed to export data: ${error.message || 'Unknown error'}`);
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
      } catch (error: any) {
        console.error('Error processing action:', error);
        Alert.alert('Error', `Failed to ${currentAction === 'newClass' ? 'start new class' : 'export data'}: ${error.message || ''}`);
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
      <Text style={styles.details}>{item.companyName || ' '}</Text>
      <Text style={styles.details}>{item.email}</Text>
      <Text style={styles.details}>{item.phoneNumber || ' '}</Text>
      <Text style={styles.interested}>
        {item.interestedInFutureClasses ? '✓ Interested in future classes' : ' '}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.subtitle}>Attendees: {attendees.length}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
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
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.exportButton, {backgroundColor: '#9C27B0'}]} 
              onPress={() => navigation.navigate('Debug')}
            >
              <Text style={styles.exportButtonText}>Debug</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
                <Text style={[styles.cancelButtonText, isProcessing && styles.disabledText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.submitButton, isProcessing && styles.disabledButton]} 
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
      </Modal>
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
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});
