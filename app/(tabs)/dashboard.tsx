import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PersonStanding, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { GlycemicCircle } from '../../components/GlycemicCircle';
import challenges from '../../data/challenges.json';
import recipes from '../../data/recipes.json';

const STORAGE_KEY_ANSWERS = 'user_onboarding_answers';
const STORAGE_KEY_GLYCEMIC = 'user_glycemic_values';

interface GlycemicValues {
  beforeMeal: number;
  afterMeal: number;
  max: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [dailyChallenge, setDailyChallenge] = useState(challenges[0]);
  const [userName, setUserName] = useState('');
  
  // États pour les valeurs glycémiques
  const [glycemicValues, setGlycemicValues] = useState<GlycemicValues>({
    beforeMeal: 78,
    afterMeal: 105,
    max: 130,
  });
  
  // État pour le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<'beforeMeal' | 'afterMeal' | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    // Sélection d'un défi aléatoire
    const randomIdx = Math.floor(Math.random() * challenges.length);
    setDailyChallenge(challenges[randomIdx]);

    // Récupération du nom depuis AsyncStorage
    const loadUserName = async () => {
      try {
        const savedAnswers = await AsyncStorage.getItem(STORAGE_KEY_ANSWERS);
        if (savedAnswers) {
          const answers = JSON.parse(savedAnswers);
          const identity = answers.identity as { firstname?: string; lastname?: string } | undefined;
          if (identity?.firstname) {
            setUserName(identity.firstname);
          }
        }
      } catch (error) {
        console.log('Erreur de chargement du nom:', error);
      }
    };

    // Récupération des valeurs glycémiques
    const loadGlycemicValues = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_GLYCEMIC);
        if (saved) {
          setGlycemicValues(JSON.parse(saved));
        }
      } catch (error) {
        console.log('Erreur de chargement glycémie:', error);
      }
    };

    loadUserName();
    loadGlycemicValues();
  }, []);

  // Ouvrir le modal pour éditer une valeur
  const openEditModal = (field: 'beforeMeal' | 'afterMeal') => {
    setEditingField(field);
    setTempValue(glycemicValues[field].toString());
    setModalVisible(true);
  };

  // Sauvegarder la nouvelle valeur
  const saveGlycemicValue = async () => {
    if (!editingField) return;
    
    const newValue = parseInt(tempValue) || 0;
    if (newValue < 0 || newValue > 300) return;

    const newValues = {
      ...glycemicValues,
      [editingField]: newValue,
    };
    
    setGlycemicValues(newValues);
    setModalVisible(false);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GLYCEMIC, JSON.stringify(newValues));
    } catch (error) {
      console.log('Erreur de sauvegarde glycémie:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>☀️ Bonjour,</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>

        {/* Section Défi */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Défi sportif du jour !</Text>
          <TouchableOpacity onPress={() => router.push('/sante')}>
            <Text style={styles.viewMore}>Voir plus</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.challengeContainer} activeOpacity={0.8} onPress={() => router.push('/sante')}>
          <View style={styles.challengeIconWrapper}>
            <PersonStanding color={Colors.secondary} size={40} strokeWidth={2.5} />
          </View>
          <View style={styles.speechBubble}>
            <View style={styles.speechBubbleArrow} />
            <Text style={styles.challengeText}>{dailyChallenge.description}</Text>
          </View>
        </TouchableOpacity>

        {/* Section Recommandées */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommandées</Text>
          <TouchableOpacity onPress={() => router.push('/recettes')}>
            <Text style={styles.viewMore}>Voir tout</Text>
            </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeList}>
          {recipes.slice(0, 5).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recipeCard}
              onPress={() => router.push(`/recette/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.recipeImage} />
              <View style={styles.recipeDetails}>
                <Text style={styles.recipeName} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.recipeMeta}>Glucides ~{item.carbs}  •  🕒 {item.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Indice Glycémique */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Indice glycémique</Text>
          <TouchableOpacity onPress={() => router.push('/sante')}>
            <Text style={styles.viewMore}>Voir plus</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.glycemicCard}>
          <GlycemicCircle 
            label="Prise avant repas" 
            value={glycemicValues.beforeMeal} 
            max={glycemicValues.max}
            onPress={() => openEditModal('beforeMeal')}
          />
          <GlycemicCircle 
            label="Prise après Repas" 
            value={glycemicValues.afterMeal} 
            max={glycemicValues.max}
            onPress={() => openEditModal('afterMeal')}
          />
        </View>
      </ScrollView>

      {/* Modal pour éditer les valeurs */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <X color={Colors.grayDark} size={24} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {editingField === 'beforeMeal' ? 'Avant repas' : 'Après repas'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Entrez votre taux de glycémie
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                value={tempValue}
                onChangeText={setTempValue}
                keyboardType="numeric"
                maxLength={3}
                autoFocus
              />
              <Text style={styles.inputUnit}>mg/dL</Text>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveGlycemicValue}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { padding: 20 },
  header: { marginBottom: 30 },
  greeting: { fontSize: 16, color: Colors.contrastMainII },
  name: { fontSize: 28, fontWeight: 'bold', color: Colors.contrastMainII },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.contrastMainII },
  viewMore: { color: Colors.primary, fontWeight: '600' },
  // Challenge Section - Speech Bubble Style
  challengeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  challengeIconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: Colors.gris,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  speechBubbleArrow: {
    position: 'absolute',
    left: -10,
    top: '50%',
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.gris,
  },
  challengeText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.contrastMainII,
    fontWeight: '500',
  },
  recipeList: { marginBottom: 30 },
  recipeCard: { width: 200, marginRight: 20, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 3, shadowOpacity: 0.1 },
  recipeImage: { width: '100%', height: 130 },
  recipeDetails: { padding: 12 },
  recipeName: { fontSize: 14, fontWeight: 'bold', color: Colors.contrastMainII },
  recipeMeta: { fontSize: 10, color: Colors.grayDark, marginTop: 5 },
  glycemicCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    backgroundColor: '#FFF', 
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 25, 
    borderWidth: 1,
    borderColor: Colors.gris,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  editHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.grayMedium,
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.grayMedium,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalInput: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
    paddingVertical: 10,
  },
  inputUnit: {
    fontSize: 18,
    color: Colors.grayDark,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
