import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProgressBarProps {
  progress: number; // Valeur entre 0 et 1
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  // On s'assure que la width reste entre 0% et 100%
  const widthVal = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${widthVal}%` as DimensionValue }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#EFF3F6', // Ou Colors.lightGray si défini
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden', // Pour que la barre interne respecte les bords arrondis
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});

export default ProgressBar;