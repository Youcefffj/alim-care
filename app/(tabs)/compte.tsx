import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Camera, Edit2 } from 'lucide-react-native'; 
import { Colors } from '../../constants/Colors';
import { MenuItemCompte } from '../../components/MenuItemCompte'; 

export default function CompteScreen() {
  const router = useRouter();
  
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [pseudo, setPseudo] = useState("Utilisateur");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // 1. Qui est connecté ?
      const email = await AsyncStorage.getItem('current_user_email');
      if (!email) {
        router.replace('/login'); // Personne connecté ? Retour login
        return;
      }
      setCurrentUserEmail(email);

      // 2. On charge le profil spécifique à cet email
      const profileKey = `user_profile_data_${email}`;
      const savedProfile = await AsyncStorage.getItem(profileKey);
      
      if (savedProfile) {
        const { name, image } = JSON.parse(savedProfile);
        if (name) setPseudo(name);
        if (image) setAvatarUri(image);
      } else {
        // Fallback sur la DB globale pour récupérer le nom d'inscription
        const dbJson = await AsyncStorage.getItem('simulated_user_db');
        if (dbJson) {
            const db = JSON.parse(dbJson);
            if (db[email]) setPseudo(db[email].name);
        }
      }
    } catch (e) { console.log(e); }
  };

  const saveProfileData = async (name: string, image: string | null) => {
    if (!currentUserEmail) return;
    try {
      const profileKey = `user_profile_data_${currentUserEmail}`;
      await AsyncStorage.setItem(profileKey, JSON.stringify({ name, image }));
    } catch (e) { console.error(e); }
  };

  // --- LOGIQUE DE RESET 1 : MES DONNÉES ---
  const handleResetMyData = async () => {
    if (!currentUserEmail) return;
    Alert.alert("Attention", "Cela effacera vos réponses au questionnaire et vos paramètres. Votre compte sera conservé.", [
      { text: "Annuler", style: "cancel" },
      { text: "Effacer", style: 'destructive', onPress: async () => {
          // On supprime les clés spécifiques à l'utilisateur
          await AsyncStorage.removeItem(`user_onboarding_answers_${currentUserEmail}`);
          await AsyncStorage.removeItem(`user_app_settings_${currentUserEmail}`);
          // On pourrait aussi supprimer `user_profile_data_...` si voulu
          Alert.alert("Effectué", "Vos données ont été remises à zéro.");
      }}
    ]);
  };

  // --- LOGIQUE DE RESET 2 : TOUS LES COMPTES (Sauf Test) ---
  const handleResetAllAccounts = async () => {
    Alert.alert("Zone Admin", "Voulez-vous supprimer TOUS les comptes utilisateurs (sauf test@test.fr) ?", [
      { text: "Annuler", style: "cancel" },
      { text: "TOUT EFFACER", style: 'destructive', onPress: async () => {
          try {
            // 1. On recrée l'objet DB avec uniquement l'utilisateur test
            const adminDb = {
                "test@test.fr": { 
                    name: "Admin Test", 
                    email: "test@test.fr", 
                    password: "test" 
                }
            };
            
            // 2. On écrase la DB existante
            await AsyncStorage.setItem('simulated_user_db', JSON.stringify(adminDb));
            
            // 3. On nettoie tout le reste (optionnel : clear radical)
            // Pour faire propre, on devrait itérer sur les clés, mais AsyncStorage ne permet pas de delete par wildcard.
            // Le plus simple ici est de déconnecter l'utilisateur courant s'il n'est pas "test"
            
            if (currentUserEmail !== "test@test.fr") {
                await AsyncStorage.removeItem('current_user_email');
                router.replace('/login');
            }
            Alert.alert("Reset Admin", "Base de données réinitialisée. Seul le compte test existe.");
          } catch(e) { console.error(e); }
      }}
    ]);
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Se déconnecter", 
        style: 'destructive',
        onPress: async () => {
          // 1. On supprime la session
          await AsyncStorage.removeItem('current_user_email');
          
          // 2. 👇 LA CORRECTION EST ICI
          // On ferme toutes les modales ou écrans empilés
          if (router.canGoBack()) {
            router.dismissAll();
          }
          
          // 3. On remplace tout par la Landing Page (racine '/')
          // Cela réinitialise l'historique : impossible de faire "retour" vers le compte
          router.replace('/'); 
        }
      }
    ]);
  };

  // ... (Code pickImage et handleRename identique à avant) ...
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      saveProfileData(pseudo, result.assets[0].uri);
    }
  };

  const handleRename = () => {
    if (isEditingName) saveProfileData(pseudo, avatarUri);
    setIsEditingName(!isEditingName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Compte</Text>
            {/* Petit indicateur de l'email connecté pour débugger */}
            <Text style={{fontSize: 10, color: 'gray'}}>{currentUserEmail}</Text>
        </View>

        {/* PROFIL CARD */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Camera size={30} color={Colors.grayMedium || '#ccc'} />
                </View>
              )}
              <View style={styles.editIconBadge}><Edit2 size={12} color="white" /></View>
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              {isEditingName ? (
                <TextInput 
                  style={styles.nameInput}
                  value={pseudo}
                  onChangeText={setPseudo}
                  autoFocus
                  onBlur={handleRename}
                />
              ) : (
                <Text style={styles.profileName}>{pseudo}</Text>
              )}
              <TouchableOpacity onPress={handleRename} style={styles.renameButton}>
                <Text style={styles.renameText}>{isEditingName ? "OK" : "Modifier"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <MenuItemCompte label="Modifier mes données" onPress={() => router.push('/settings')} />
          <MenuItemCompte label="Mes recettes favorites" onPress={() => router.push({ pathname: '/recettes', params: { tab: 'favoris' } })} />
        </View>

        {/* ZONE DE DANGER / DEBUG */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, {color: 'red'}]}>Zone de Reset (Debug)</Text>
          
          <MenuItemCompte 
            label="Réinitialiser MES données" 
            onPress={handleResetMyData} 
            isDestructive 
          />
          
          <MenuItemCompte 
            label="Réinitialiser TOUS les comptes" 
            onPress={handleResetAllAccounts} 
            isDestructive 
          />
        </View>

        <View style={styles.menuSection}>
           <MenuItemCompte label="Déconnexion" onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { padding: 24 },
  headerTitleContainer: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.contrastMainII },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.contrastMainII, marginBottom: 15, marginTop: 10 },
  profileSection: { marginBottom: 30 },
  profileCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
  nameContainer: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.contrastMainII, marginBottom: 5 },
  nameInput: { fontSize: 20, fontWeight: '700', color: Colors.contrastMainII, borderBottomWidth: 1, borderBottomColor: Colors.primary, marginBottom: 5, paddingVertical: 0 },
  renameButton: { alignSelf: 'flex-start' },
  renameText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  menuSection: { marginBottom: 20 },
});