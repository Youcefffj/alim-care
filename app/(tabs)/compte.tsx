import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Camera, Edit2 } from 'lucide-react-native'; 
import { Colors } from '../../constants/Colors';
import { MenuItemCompte } from '../../components/MenuItemCompte'; 
// 👇 Import de l'URL d'upload
import { UPLOAD_URL } from '../../constants/Config';

export default function CompteScreen() {
  const router = useRouter();
  
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [pseudo, setPseudo] = useState("Utilisateur");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Pour le chargement

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const email = await AsyncStorage.getItem('current_user_email');
      if (!email) {
        router.replace('/login'); 
        return;
      }
      setCurrentUserEmail(email);

      const profileKey = `user_profile_data_${email}`;
      const savedProfile = await AsyncStorage.getItem(profileKey);
      
      if (savedProfile) {
        const { name, image } = JSON.parse(savedProfile);
        if (name) setPseudo(name);
        if (image) setAvatarUri(image);
      } else {
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
      // On met à jour l'état local aussi
      setPseudo(name);
      if (image) setAvatarUri(image);
    } catch (e) { console.error(e); }
  };

  // --- FONCTION D'UPLOAD (La même que pour les recettes) ---
  const uploadImageToServer = async (localUri: string) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      
      const fileName = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const photoConfig = {
        uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
        name: fileName,
        type: type,
      } as any;

      formData.append('photo', photoConfig);

      const uploadResponse = await fetch(`${UPLOAD_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        return result.url; // Retourne l'URL publique (http://192...)
      } else {
        Alert.alert("Erreur", "L'upload vers le serveur a échoué.");
        return null;
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de joindre le serveur d'images.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      
      // 1. On affiche immédiatement l'image locale pour la réactivité
      setAvatarUri(localUri);

      // 2. On l'envoie au serveur pour avoir une URL publique
      const serverUrl = await uploadImageToServer(localUri);

      // 3. Si l'upload a marché, on sauvegarde l'URL DU SERVEUR
      if (serverUrl) {
        console.log("Avatar sauvegardé sur serveur :", serverUrl);
        saveProfileData(pseudo, serverUrl);
      } else {
        // Sinon, on garde l'image locale en secours (visible que par soi-même)
        saveProfileData(pseudo, localUri);
      }
    }
  };

  const handleRename = () => {
    if (isEditingName) saveProfileData(pseudo, avatarUri);
    setIsEditingName(!isEditingName);
  };

  // ... (Fonctions Reset et Logout inchangées) ...
  const handleResetMyData = async () => { /* ... code existant ... */ };
  const handleResetAllAccounts = async () => { /* ... code existant ... */ };
  const handleLogout = async () => {
      await AsyncStorage.removeItem('current_user_email');
      if (router.canGoBack()) { router.dismissAll(); }
      router.replace('/');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Compte</Text>
            <Text style={{fontSize: 10, color: 'gray'}}>{currentUserEmail}</Text>
        </View>

        {/* PROFIL CARD */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} disabled={isUploading}>
              {isUploading ? (
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEE' }]}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
              ) : avatarUri ? (
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

        {/* MENU (Reste inchangé) */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <MenuItemCompte label="Modifier mes données (Settings)" onPress={() => router.push('/settings')} />
          <MenuItemCompte label="Mes recettes favorites" onPress={() => router.push({ pathname: '/recettes', params: { tab: 'favoris' } })} />
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, {color: 'red'}]}>Zone de Reset (Debug)</Text>
          <MenuItemCompte label="Réinitialiser MES données" onPress={handleResetMyData} isDestructive />
          <MenuItemCompte label="Réinitialiser TOUS les comptes" onPress={handleResetAllAccounts} isDestructive />
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