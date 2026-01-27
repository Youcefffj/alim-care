import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface MenuItemProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode; // Optionnel si tu veux ajouter une icône à gauche plus tard
  isDestructive?: boolean; // Pour le bouton déconnexion (texte rouge)
}

export const MenuItemCompte: React.FC<MenuItemProps> = ({ label, onPress, icon, isDestructive = false }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.label, isDestructive && styles.destructiveLabel]}>
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color={Colors.grayMedium || '#94A3B8'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15, // Espace entre les cartes
    // Ombres douces comme sur le screenshot
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.contrastMainII || '#0D253F',
  },
  destructiveLabel: {
    color: '#EF4444', // Rouge
  },
});