// app/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native'; // Icône de retour

import { Colors } from '../constants/Colors';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';

export default function RegisterScreen() {
  const router = useRouter();
  
  // États pour stocker les valeurs des champs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Pour l'instant, on affiche juste dans la console
    console.log('Inscription:', { name, email, password });
    // Plus tard, ici on connectera Supabase ou on ira vers l'onboarding
    // router.push('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header avec bouton retour */}
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
            isPassword={true}
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
    justifyContent: 'space-between', // Pousse le footer vers le bas
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
    flex: 1, // Prend l'espace disponible
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: Colors.grayMedium,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});