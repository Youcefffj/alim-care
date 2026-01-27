import AsyncStorage from '@react-native-async-storage/async-storage';

// app/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Colors } from '../constants/Colors';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (emailStr: string) => {
    // Cette formule vérifie : du texte + @ + du texte + . + du texte
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) { Alert.alert("Erreur", "Champs manquants"); return; }
    if (!isValidEmail(email)) { Alert.alert("Erreur", "Email invalide"); return; }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Récupérer la "base de données" actuelle
      const existingDbJson = await AsyncStorage.getItem('simulated_user_db');
      let userDb = existingDbJson ? JSON.parse(existingDbJson) : {};

      // 2. Vérifier si l'email existe déjà
      if (userDb[cleanEmail]) {
        Alert.alert("Erreur", "Cet email est déjà utilisé.");
        return;
      }

      // 3. Ajouter le nouvel utilisateur
      userDb[cleanEmail] = {
        name: name,
        email: cleanEmail,
        password: password
      };

      // 4. Sauvegarder la base mise à jour
      await AsyncStorage.setItem('simulated_user_db', JSON.stringify(userDb));
      
      // 5. Connecter l'utilisateur (Session en cours)
      await AsyncStorage.setItem('current_user_email', cleanEmail);

      Alert.alert("Succès", "Compte créé !", [
        { text: "Continuer", onPress: () => router.replace('/onboarding') }
      ]);

    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Problème de sauvegarde");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView permet de remonter l'écran quand le clavier sort */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={Colors.contrastMainII} size={24} />
            </TouchableOpacity>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Création de compte</Text>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <InputField 
              placeholder="Nom" 
              value={name}
              onChangeText={setName}
            />
            <InputField 
              placeholder="Email" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <InputField 
              placeholder="Mot de passe" 
              // 👇 CORRECTION : Utilisation de la prop standard React Native
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.legalText}>
              En vous inscrivant, vous acceptez les Termes et Conditions de l'application
            </Text>
            <PrimaryButton title="S'inscrire" onPress={handleSignUp} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 10,
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
    // 👇 AJOUT : Espacement entre les champs Input
    gap: 20, 
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    // Petit padding en bas pour éviter que le bouton colle trop au bord sur certains écrans
    paddingBottom: 20, 
  },
  legalText: {
    fontSize: 12,
    color: Colors.grayMedium,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});