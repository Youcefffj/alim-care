import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface OnboardingFooterProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
}

const OnboardingFooter = ({ 
  onBack, 
  onNext, 
  backLabel = "Retour", 
  nextLabel = "Suivant" 
}: OnboardingFooterProps) => {
  return (
    <View style={styles.container}>
      {/* Bouton Retour (Secondaire) */}
      <TouchableOpacity style={styles.buttonSecondary} onPress={onBack}>
        <Text style={styles.textSecondary}>{backLabel}</Text>
      </TouchableOpacity>

      {/* Bouton Suivant (Primaire) */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={onNext}>
        <Text style={styles.textPrimary}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24, // Espace interne au composant
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Gris moyen
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  textSecondary: {
    color: '#4A5568',
    fontWeight: 'bold', // Plus gras
    fontSize: 18, // Augmenté
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    // Ombre légère
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  textPrimary: {
    color: 'white',
    fontWeight: 'bold', // Plus gras
    fontSize: 18, // Augmenté
  },
});

export default OnboardingFooter;