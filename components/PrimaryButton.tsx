// components/PrimaryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary, // Couleur turquoise
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: Colors.white, // Texte blanc
    fontSize: 18,
    fontWeight: 'bold',
  },
});