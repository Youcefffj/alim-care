import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface InputFieldProps extends TextInputProps {
  placeholder: string;
  unit?: string; // <--- NOUVEAU : On accepte une unité optionnelle
}

export const InputField: React.FC<InputFieldProps> = ({ 
  placeholder, 
  unit, 
  style, 
  ...props 
}) => {
  
  // On sépare le style pour l'appliquer au conteneur (fond, bordure) 
  // et non au texte directement, pour que l'unité soit aussi dans la bulle.
  const flatStyle = StyleSheet.flatten(style);
  
  const containerStyle: ViewStyle = {
    backgroundColor: flatStyle?.backgroundColor || '#F5F9FA',
    borderRadius: flatStyle?.borderRadius || 16,
    paddingVertical: flatStyle?.paddingVertical || 20,
    paddingHorizontal: 20,
    // Flexbox pour aligner input et unité
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...((flatStyle as any) || {}) // On garde les autres styles (marges etc)
  };

  const textInputStyle: TextStyle = {
    flex: 1, // Prend toute la place disponible
    fontSize: flatStyle?.fontSize || 18,
    fontWeight: flatStyle?.fontWeight || '600',
    color: flatStyle?.color || Colors.black,
    textAlign: 'center', // On centre le texte tapé
  };

  return (
    <View style={containerStyle}>
      <TextInput
        style={textInputStyle}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {/* Si une unité est fournie, on l'affiche à droite */}
      {unit && (
        <Text style={styles.unitText}>{unit}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8', // Gris un peu discret
    marginLeft: 8,    // Petit espace entre le chiffre et l'unité
    position: 'absolute', // Astuce : on le fixe à droite pour ne pas décaler le centrage
    right: 20,
  },
});