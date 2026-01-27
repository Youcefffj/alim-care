import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, 
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Camera, Upload } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // 👇 Import important

import { Colors } from '../../constants/Colors';
import { API_URL, UPLOAD_URL } from '../../constants/Config';

// Interface pour structurer une étape
interface InstructionStep {
  step: number;
  title: string;
  text: string;
}

export default function AddRecipeScreen() {
  const router = useRouter();
  
  // Champs généraux
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [time, setTime] = useState('');
  const [carbs, setCarbs] = useState('');
  const [category, setCategory] = useState<'Salé' | 'Sucré'>('Salé');
  
  // Image
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Ingrédients
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  // Instructions (Étapes)
  const [steps, setSteps] = useState<InstructionStep[]>([]);
  const [stepTitle, setStepTitle] = useState('');
  const [stepText, setStepText] = useState('');

  // --- GESTION IMAGE ---
  const pickImage = async () => {
    // Demander la permission (automatique sur les versions récentes d'Expo, mais bonne pratique)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // On réduit la qualité pour ne pas surcharger le JSON-Server
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- GESTION INGRÉDIENTS ---
  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient]);
      setCurrentIngredient('');
    }
  };

  // --- GESTION ÉTAPES ---
  const addStep = () => {
    if (stepTitle.trim() && stepText.trim()) {
      const newStep: InstructionStep = {
        step: steps.length + 1, // Numéro automatique
        title: stepTitle,
        text: stepText
      };
      setSteps([...steps, newStep]);
      // Reset des champs
      setStepTitle('');
      setStepText('');
    } else {
      Alert.alert("Information", "Veuillez remplir le titre et la description de l'étape.");
    }
  };

  const removeStep = (indexToRemove: number) => {
    // On retire l'étape et on recalcule les numéros (step 1, 2, 3...)
    const newSteps = steps
      .filter((_, index) => index !== indexToRemove)
      .map((step, index) => ({ ...step, step: index + 1 }));
    setSteps(newSteps);
  };

  // --- SOUMISSION ---
  const handleSubmit = async () => {
    if (!title || !time || !imageUri) {
      Alert.alert("Erreur", "Titre, temps et photo requis");
      return;
    }

    try {
      let finalImageUrl = imageUri; // Par défaut, l'uri locale (au cas où l'upload échoue)

      // --- ÉTAPE 1 : UPLOAD DE L'IMAGE ---
      // On prépare le fichier pour l'envoi
      const formData = new FormData();
      
      // Il est CRUCIAL de bien définir name, type et uri pour React Native
      const fileName = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('photo', {
        uri: imageUri,
        name: fileName,
        type: type,
      } as any); // 'as any' pour éviter une erreur TypeScript stricte sur FormData

      console.log("Envoi de l'image en cours...");
      
      const uploadResponse = await fetch(`${UPLOAD_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data', // Indique qu'on envoie un fichier
        },
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.url; // On récupère l'URL http://192....
        console.log("Image uploadée avec succès :", finalImageUrl);
      } else {
        console.log("Échec upload image, utilisation locale (ne sera pas visible par les autres)");
      }

      // --- ÉTAPE 2 : CRÉATION DE LA RECETTE ---
      const email = await AsyncStorage.getItem('current_user_email');
      const profileData = await AsyncStorage.getItem(`user_profile_data_${email}`);
      const userProfile = profileData ? JSON.parse(profileData) : { name: "Moi", image: null };

      const newRecipe = {
        title,
        image: finalImageUrl, // 👈 On utilise l'URL du serveur ici !
        time: time + " Min",
        servings: 2,
        description: desc,
        carbs: carbs + "g",
        ingredients,
        instructions: steps,
        tips: [],
        category,
        likes: 0,
        comments: [],
        author: {
          name: userProfile.name || "Utilisateur",
          avatar: userProfile.image
        }
      };

      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe)
      });

      if (response.ok) {
        Alert.alert("Bravo", "Votre recette est en ligne et visible par tous !", [
          { text: "Génial", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Oups", "Le serveur n'a pas répondu correctement.");
      }

    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de joindre l'ordinateur");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft color="#000" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une recette</Text>
        <View style={{width: 24}}/>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* SÉLECTEUR PHOTO */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Camera size={40} color={Colors.primary} />
                <Text style={styles.placeholderText}>Ajouter une photo de couverture</Text>
              </View>
            )}
            {/* Petit bouton pour changer l'image si déjà présente */}
            {imageUri && (
              <View style={styles.editImageBadge}>
                <Upload size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Titre de la recette</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Tarte aux légumes" />

          {/* Catégorie */}
          <View style={styles.catRow}>
            {['Salé', 'Sucré'].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat as any)}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Temps (min)</Text>
                <TextInput style={styles.input} value={time} onChangeText={setTime} keyboardType="numeric" placeholder="30" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Glucides (g)</Text>
                <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="40" />
            </View>
          </View>

          <Text style={styles.label}>Description courte</Text>
          <TextInput style={[styles.input, {height: 80}]} multiline value={desc} onChangeText={setDesc} textAlignVertical="top" placeholder="Donnez envie en quelques mots..." />

          {/* --- SECTION INGRÉDIENTS --- */}
          <Text style={styles.sectionHeader}>Ingrédients</Text>
          <View style={styles.addRow}>
            <TextInput 
                style={[styles.input, {flex: 1, marginBottom: 0}]} 
                value={currentIngredient} 
                onChangeText={setCurrentIngredient} 
                placeholder="Ex: 200g de farine" 
            />
            <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
                <Plus color="#FFF" />
            </TouchableOpacity>
          </View>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.listItem}>
                <Text style={styles.listText}>• {ing}</Text>
                <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, i) => i !== index))}>
                    <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
          ))}

          {/* --- SECTION ÉTAPES (NOUVEAU) --- */}
          <Text style={styles.sectionHeader}>Étapes de préparation</Text>
          
          <View style={styles.stepInputContainer}>
            <TextInput 
              style={[styles.input, {fontWeight: 'bold'}]} 
              value={stepTitle} 
              onChangeText={setStepTitle} 
              placeholder="Titre (ex: Préparation de la pâte)" 
            />
            <TextInput 
              style={[styles.input, {height: 60}]} 
              multiline 
              textAlignVertical="top"
              value={stepText} 
              onChangeText={setStepText} 
              placeholder="Détails (ex: Mélanger la farine et les oeufs...)" 
            />
            <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
               <Text style={styles.addStepText}>Ajouter l'étape {steps.length + 1}</Text>
            </TouchableOpacity>
          </View>

          {/* Liste des étapes ajoutées */}
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{step.step}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.stepItemTitle}>{step.title}</Text>
                <Text style={styles.stepItemText}>{step.text}</Text>
              </View>
              <TouchableOpacity onPress={() => removeStep(index)} style={{marginLeft: 10}}>
                 <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Publier la recette</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 50 },
  
  // Styles Image Picker
  imagePicker: { height: 200, backgroundColor: '#F1F5F9', borderRadius: 16, marginBottom: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  placeholderText: { color: Colors.grayMedium, marginTop: 10, fontWeight: '500' },
  editImageBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },

  label: { fontSize: 14, fontWeight: '600', color: Colors.contrastMainII, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  
  row: { flexDirection: 'row' },
  catRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  catBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary },
  catBtnActive: { backgroundColor: Colors.primary },
  catText: { color: Colors.primary },
  catTextActive: { color: '#FFF', fontWeight: 'bold' },

  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#0D253F', marginTop: 25, marginBottom: 15 },
  
  // Styles Ajout Ingrédients
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  addBtn: { backgroundColor: Colors.primary, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listText: { fontSize: 16, color: '#334155' },

  // Styles Ajout Étapes
  stepInputContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  addStepBtn: { backgroundColor: '#0D253F', padding: 12, borderRadius: 10, alignItems: 'center' },
  addStepText: { color: '#FFF', fontWeight: 'bold' },
  
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: "#000", shadowOffset: {width:0, height:1}, shadowOpacity:0.05, shadowRadius:2, elevation:1 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  stepNumber: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  stepItemTitle: { fontWeight: '700', color: '#0D253F', marginBottom: 4 },
  stepItemText: { color: '#64748B', fontSize: 14, lineHeight: 20 },

  submitBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30, shadowColor: Colors.primary, shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:5 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});