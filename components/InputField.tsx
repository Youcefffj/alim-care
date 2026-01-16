// components/InputField.tsx
import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';

// On définit les propriétés que notre champ peut accepter
interface InputFieldProps extends TextInputProps {
  placeholder: string;
  isPassword?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ placeholder, isPassword = false, ...props }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray}
        secureTextEntry={isPassword} // Si c'est un mot de passe, on cache le texte
        {...props} // On passe les autres props standard (onChangeText, value, etc.)
      />
      {/* Bonus: On pourrait ajouter l'icône "œil" pour le mot de passe ici plus tard */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    backgroundColor: Colors.inputBackground, // fond gris clair
    borderRadius: 12, // bords arrondis
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.textDark,
  },
});