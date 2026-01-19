// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/Background_landing_page2.png')}
      resizeMode="cover"
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      
      <SafeAreaView style={styles.safeArea}>
        
        {/* Bouton "Plus tard" en haut à droite */}
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => router.replace('/dashboard')} // On suppose que ça mène au dashboard
        >
          <Text style={styles.skipText}>Plus tard</Text>
        </TouchableOpacity>

        {/* Contenu principal poussé vers le bas */}
        <View style={styles.contentContainer}>
          {/* Titre Principal */}
          <Text style={styles.title}>
            Des choix simples,{'\n'}chaque jour.
          </Text>

          {/* Bouton Se connecter (Foncé) */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Lien Créer un compte */}
          <TouchableOpacity 
            style={styles.registerLink} 
            onPress={() => router.push('/register')}
            activeOpacity={0.6}
          >
            <Text style={styles.registerLinkText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // fallback si l'image tarde à charger (web/dev)
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between', // Permet d'espacer le haut du bas
  },
  skipButton: {
    alignSelf: 'flex-end', // Pousse à droite
    padding: 24,
    marginTop: 10, // Ajustement pour la barre de statut
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 50, // Espace en bas de l'écran
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 36,
    fontWeight: '800', // Très gras
    color: 'white',
    marginBottom: 40,
    lineHeight: 44, // Pour l'espacement entre les deux lignes
  },
  loginButton: {
    // Utilisation de la couleur foncée de ta palette pour ce bouton spécifique
    backgroundColor: Colors.contrastMainII,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
    padding: 10,
  },
  registerLinkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});