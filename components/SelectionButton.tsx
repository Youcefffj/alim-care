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
        // L'ordre est important : le style actif écrase le style de base
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
    
    paddingHorizontal: 8, 
    
    borderRadius: 16,
    
    justifyContent: 'center', 
    alignItems: 'center',    
    
    borderWidth: 2, // On met 2 pour être sûr (ou 1 si tu préfères plus fin)
    borderColor: 'transparent', // Invisible pour l'instant
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerActive: {
    backgroundColor: '#E0F2F1', 
    
    borderColor: Colors.primary || '#5ABCB9', 
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center', 
  },
  textActive: {
    color: Colors.primary || '#5ABCB9',
  },
});

export default SelectionButton;