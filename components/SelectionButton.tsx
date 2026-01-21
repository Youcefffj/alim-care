import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface SelectionButtonProps {
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const SelectionButton = ({ label, isSelected = false, onPress, style }: SelectionButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isSelected && styles.containerActive, 
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.textActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F9FA', 
    paddingVertical: 20,
    paddingHorizontal: 15, // Ajout d'un petit padding horizontal pour éviter que le texte ne touche les bords
    borderRadius: 16,
    
    // --- CENTRAGE DU BLOC ---
    justifyContent: 'center', // Centre verticalement
    alignItems: 'center',     // Centre horizontalement
    
    // Ombres
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerActive: {
    backgroundColor: '#E0F2F1', 
    borderWidth: 1,
    borderColor: Colors.primary || '#5ABCB9', // Fallback si Colors.primary n'est pas chargé
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    
    // --- CENTRAGE DU TEXTE (Multi-lignes) ---
    textAlign: 'center', // Crucial pour les textes longs (ex: "Autre / Je préfère...")
  },
  textActive: {
    color: Colors.primary || '#5ABCB9',
  },
});

export default SelectionButton;