import React, { useRef } from 'react';
import { 
  TouchableWithoutFeedback, // Pour gérer l'appui manuellement
  StyleSheet, 
  Image, 
  Animated, 
  View 
} from 'react-native';
import { Colors } from '../constants/Colors';

interface BackButtonProps {
  onPress: () => void;
}

const BackButton = ({ onPress }: BackButtonProps) => {
  // Valeur animée (position X) initialisée à 0
  const translateX = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    // La flèche recule de 5 pixels vers la gauche quand on appuie
    Animated.spring(translateX, {
      toValue: -5,
      useNativeDriver: true,
      speed: 50, // Vitesse
    }).start();
  };

  const handlePressOut = () => {
    // La flèche revient à sa place quand on relâche
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 50,
    }).start();
    
    // On déclenche l'action de navigation
    onPress();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <View style={styles.container}>
        {/* On enveloppe l'image dans une Animated.View */}
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Image 
            source={require('../assets/arrow-back.png')} 
            style={styles.iconImage} 
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Ombres...
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: 'white',
  }
});

export default BackButton;