import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attendee, Class } from '../types';

export const DebugScreen: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [className, setClassName] = useState<string>('');

  useEffect(() => {
    loadClassData();
  }, []);

  const loadClassData = async () => {
    try {
      addLog('Loading class data...');
      const classDataString = await AsyncStorage.getItem('currentClass');
      
      if (classDataString) {
        const classData: Class = JSON.parse(classDataString);
        setClassName(classData.name);
        setAttendees(classData.attendees);
        addLog(`Class loaded: ${classData.name}`);
        addLog(`Attendees count: ${classData.attendees.length}`);
      } else {
        addLog('No class data found');
      }
    } catch (error) {
      addLog(`Error loading class data: ${error}`);
    }
  };

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  const clearLogs = () => {
    setLogs([]);
  };

  const testAlternativeFileSystem = async () => {
    try {
      addLog('Starting alternative file system test...');
      
      // Create simple content
      const content = 'Test,Data,Row\n1,2,3\n4,5,6';
      const fileName = `test_${Date.now()}.csv`;
      
      addLog('File system directories:');
      
      // Check all available directories
      if (FileSystem.documentDirectory) {
        addLog(`Document directory: ${FileSystem.documentDirectory}`);
      } else {
        addLog('Document directory not available');
      }
      
      if (FileSystem.cacheDirectory) {
        addLog(`Cache directory: ${FileSystem.cacheDirectory}`);
      } else {
        addLog('Cache directory not available');
      }

      // On Android, we can write to the cache directory
      const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      if (!targetDir) {
        addLog('ERROR: No directory available for writing');
        Alert.alert('Error', 'No directory available for writing files');
        return;
      }
      
      const fileUri = `${targetDir}${fileName}`;
      addLog(`Writing file to: ${fileUri}`);
      
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      addLog(`File info: ${JSON.stringify(fileInfo)}`);
      
      // Try to read the file to verify content
      const readContent = await FileSystem.readAsStringAsync(fileUri);
      addLog(`File content read: ${readContent.substring(0, 20)}...`);
      
      // Share the file
      addLog('Attempting to share file...');
      try {
        const shareResult = await Share.share({
          url: fileUri,
          message: 'Test CSV file from Debug screen',
        });
        
        addLog(`Share result: ${JSON.stringify(shareResult)}`);
        
        // Delete file after successful share
        await FileSystem.deleteAsync(fileUri);
        addLog('File deleted after sharing');
      } catch (shareError: any) {
        addLog(`SHARE ERROR: ${shareError?.message || shareError}`);
        Alert.alert('Share Error', `Failed to share file: ${shareError?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      addLog(`ERROR: ${error?.message || error}`);
      Alert.alert('File System Error', `${error?.message || 'Unknown error'}`);
    }
  };

  const testFileSystem = async () => {
    try {
      addLog('Starting FileSystem test...');
      
      // Check if FileSystem is available
      if (!FileSystem) {
        addLog('ERROR: FileSystem is not available!');
        return;
      }
      
      addLog(`FileSystem is available, documentDirectory: ${FileSystem.documentDirectory}`);
      
      // Create a simple test file
      const testContent = 'Test content for CSV export,Column2,Column3\nRow1,Data1,Data2\nRow2,Data3,Data4';
      const fileName = 'test_export.csv';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      addLog(`Writing test file to: ${fileUri}`);
      
      await FileSystem.writeAsStringAsync(fileUri, testContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Check if file was created successfully
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        addLog(`File created successfully! Size: ${fileInfo.size} bytes`);
        
        // Try to read file content to verify
        const content = await FileSystem.readAsStringAsync(fileUri);
        addLog(`File content (first 50 chars): ${content.substring(0, 50)}...`);
        
        // Try to share the file
        addLog('Attempting to share the file...');
        const shareResult = await Share.share({
          url: fileUri,
          title: 'Test CSV Export',
          message: 'Test CSV Export'
        });
        
        addLog(`Share result: ${JSON.stringify(shareResult)}`);
        
        // Clean up
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        addLog('Test file deleted');
        
        Alert.alert('Test Complete', 'FileSystem test completed successfully. Check the logs below.');
      } else {
        addLog('ERROR: File was not created!');
        Alert.alert('Error', 'Failed to create test file');
      }
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      Alert.alert('Error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const testSimpleCsvExport = async () => {
    try {
      addLog('Starting simple CSV export test...');
      
      if (attendees.length === 0) {
        addLog('No attendees data available');
        Alert.alert('Error', 'No attendees data available for export');
        return;
      }
      
      // Generate a simple CSV content
      const headers = ['Name', 'Email', 'Company', 'Phone'];
      const rows = attendees.map(attendee => 
        `"${attendee.fullName}","${attendee.email}","${attendee.companyName}","${attendee.phoneNumber}"`
      );
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      addLog(`CSV content generated (${csvContent.length} chars)`);
      
      // Create file and share
      const fileName = `simple_export_${new Date().getTime()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      addLog(`Writing CSV to: ${fileUri}`);
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      addLog('File written, attempting to share...');
      const result = await Share.share({
        url: fileUri,
        message: 'Simple CSV export test',
      });
      
      addLog(`Share result: ${JSON.stringify(result)}`);
      
      if (result.action !== Share.dismissedAction) {
        Alert.alert('Success', 'Simple CSV export completed');
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      addLog(`Error in simple export: ${errorMsg}`);
      Alert.alert('Export Error', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CSV Export Debug</Text>
      
      {className && (
        <Text style={styles.classInfo}>
          Current class: {className} ({attendees.length} attendees)
        </Text>
      )}
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testFileSystem}>
          <Text style={styles.buttonText}>Test FileSystem</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, {backgroundColor: '#4CAF50'}]} onPress={testSimpleCsvExport}>
          <Text style={styles.buttonText}>Simple CSV</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, {backgroundColor: '#FF9800'}]} onPress={testAlternativeFileSystem}>
          <Text style={styles.buttonText}>Alt File Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      <Text style={styles.subtitle}>Debug Logs:</Text>
      
      <ScrollView style={styles.logContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet. Run a test to see logs here.</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  classInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    margin: 5,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
