import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Footer } from './Footer';

interface Props {
  children: React.ReactNode;
}

export const ContentWrapper: React.FC<Props> = ({ children }) => (
  <View style={styles.wrapper}>
    <View style={styles.content}>
      {children}
    </View>
    <Footer />
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
});
