import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Validation de l'email
  const isValidEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  // 👇 NOUVEAU : Fonction de validation du mot de passe
  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    // Liste des caractères spéciaux acceptés
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\].\/]/.test(pwd);

    if (pwd.length < minLength) return "Le mot de passe doit faire au moins 8 caractères.";
    if (!hasUpperCase) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!hasLowerCase) return "Le mot de passe doit contenir au moins une minuscule.";
    if (!hasNumber) return "Le mot de passe doit contenir au moins un chiffre.";
    if (!hasSpecialChar) return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>_+-=[]/).";

    return null; // Tout est bon
  };

  const handleSignUp = async () => {
    // 1. Vérification champs vides
    if (!name || !email || !password) { 
        Alert.alert("Erreur", "Champs manquants"); 
        return; 
    }

    // 2. Vérification format email
    if (!isValidEmail(email)) { 
        Alert.alert("Erreur", "Email invalide"); 
        return; 
    }

    // 3. 👇 Vérification format mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) {
        Alert.alert("Mot de passe invalide", passwordError);
        return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 4. Récupérer la "base de données" actuelle
      const existingDbJson = await AsyncStorage.getItem('simulated_user_db');
      let userDb = existingDbJson ? JSON.parse(existingDbJson) : {};

      // 5. Vérifier si l'email existe déjà
      if (userDb[cleanEmail]) {
        Alert.alert("Erreur", "Cet email est déjà utilisé.");
        return;
      }

      // 6. Ajouter le nouvel utilisateur
      userDb[cleanEmail] = {
        name: name,
        email: cleanEmail,
        password: password
      };

      // 7. Sauvegarder la base mise à jour
      await AsyncStorage.setItem('simulated_user_db', JSON.stringify(userDb));
      
      // 8. Connecter l'utilisateur (Session en cours)
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
            <View>
                <InputField 
                placeholder="Mot de passe" 
                secureTextEntry={true} 
                value={password}
                onChangeText={setPassword}
                />
                {/* Petit texte d'aide pour l'utilisateur */}
                <Text style={styles.passwordHint}>
                    8 car. min, 1 Maj, 1 min, 1 chiffre, 1 car. spécial
                </Text>
            </View>
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
    gap: 20, 
  },
  passwordHint: {
    fontSize: 11,
    color: Colors.grayMedium,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
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