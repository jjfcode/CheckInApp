import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Footer } from './Footer';

interface Props {
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<Props> = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <Footer />
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
    display: 'flex',
    flexDirection: 'column',
  },
});
