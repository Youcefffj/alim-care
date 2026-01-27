import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';

import { Colors } from '../constants/Colors';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;

    const cleanEmail = email.trim().toLowerCase();

    try {
      const savedUserJson = await AsyncStorage.getItem('simulated_user_db');
      const userDb = savedUserJson ? JSON.parse(savedUserJson) : {};

      // On cherche l'utilisateur par son email dans l'objet
      const user = userDb[cleanEmail];

      if (user && user.password === password) {
        // SUCCÈS : On enregistre l'email de la session en cours
        await AsyncStorage.setItem('current_user_email', cleanEmail);
        router.replace('/dashboard'); 
      } else {
        Alert.alert("Erreur", "Identifiants incorrects.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={Colors.contrastMainII} size={24} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Heureux de vous revoir !</Text>

          <View style={styles.formContainer}>
            <InputField 
              placeholder="Email" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <InputField 
              placeholder="Mot de passe" 
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <PrimaryButton title="Se connecter" onPress={handleLogin} />
            
            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.signupLink}>S'inscrire</Text>
                </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grayMedium,
    marginBottom: 40,
  },
  formContainer: {
    gap: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signupText: {
    color: Colors.grayMedium,
  },
  signupLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});