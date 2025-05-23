import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Footer: React.FC = () => (
  <View style={styles.footer}>
    <Text style={styles.text}>Created by JJF Code 2025 v1.0.0</Text>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    padding: 20,
    width: '100%',
  },
  text: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
