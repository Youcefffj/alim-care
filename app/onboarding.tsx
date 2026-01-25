import React, { useState, useEffect } from 'react'; // <--- N'oublie pas d'importer useEffect
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,            
  TouchableWithoutFeedback, 
  Keyboard,
  Button,
  ActivityIndicator // <--- Pour afficher un petit chargement au début
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '../constants/Colors';
import { Questions } from '../constants/questions';

import ProgressBar from '../components/ProgressBar';
import SelectionButton from '../components/SelectionButton';
import CircularBackButton from '../components/BackButton';
import NavigationFooter from '../components/OnboardingFooter';
import { InputField } from '../components/InputField';

// Clés pour le stockage (pour ne pas se tromper de nom)
const STORAGE_KEY_ANSWERS = 'user_onboarding_answers';
const STORAGE_KEY_HISTORY = 'user_onboarding_history';

export default function QuestionnaireScreen() {
  const router = useRouter();
  
  // États
  const [history, setHistory] = useState<number[]>([0]); 
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({});

  // On met true par défaut pour ne pas afficher la Q1 le temps de charger la sauvegarde
  const [isLoading, setIsLoading] = useState(true); 

  // --- LOGIQUE DE SAUVEGARDE (PERSISTANCE) ---

  // A. CHARGEMENT INITIAL (S'exécute une seule fois au lancement)
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // On récupère les deux morceaux de données
        const savedAnswers = await AsyncStorage.getItem(STORAGE_KEY_ANSWERS);
        const savedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);

        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.log("Erreur de chargement", error);
      } finally {
        // Quoi qu'il arrive, on arrête le chargement pour afficher l'interface
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // B. SAUVEGARDE AUTOMATIQUE (S'exécute à chaque changement de réponse ou de page)
  useEffect(() => {
    const saveProgress = async () => {
      try {
        // On ne sauvegarde que si on a fini de charger (pour ne pas écraser la sauvegarde avec des données vides)
        if (!isLoading) {
          await AsyncStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
          await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        }
      } catch (error) {
        console.log("Erreur de sauvegarde", error);
      }
    };

    saveProgress();
  }, [answers, history, isLoading]); // Déclenche la sauvegarde si answers ou history change


  // --- Variables calculées ---
  const currentIndex = history[history.length - 1];
  const currentQuestion = Questions[currentIndex];
  const selectedValue = answers[currentQuestion.id];

  const clearStorage = async () => {
    await AsyncStorage.clear();
    setAnswers({});
    setHistory([0]);
    Alert.alert("Reset", "Mémoire effacée, retour au début.");
};

// --- Gestion du Double Input (Nom / Prénom) ---
  const handleDoubleInput = (key: string, text: string) => {
    // 1. On récupère l'objet actuel (ou vide s'il n'existe pas encore)
    // On force le type "as Record..." pour que TS comprenne
    const currentAnswerObj = (answers[currentQuestion.id] as Record<string, string>) || {};

    // 2. On met à jour uniquement la clé modifiée (ex: 'firstname')
    const newAnswerObj = {
      ...currentAnswerObj,
      [key]: text
    };

    // 3. On sauvegarde
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswerObj }));
  };

  // --- Logique de saisie sécurisée ---
  const handleNumericInput = (text: string) => {
    const numericValue = text.replace(/[^0-9.,]/g, '');
    handleOptionSelect(numericValue);
  };

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.isMultiSelect) {
      const currentList = (answers[currentQuestion.id] as string[]) || [];
      let newList: string[];

      if (value === "Aucune" || value === "Non") {
        newList = [value];
      } 
      else {
        let tempBooking = currentList.filter(item => item !== "Aucune" && item !== "Non");
        if (tempBooking.includes(value)) {
          newList = tempBooking.filter((item) => item !== value);
        } else {
          newList = [...tempBooking, value];
        }
      }
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newList }));
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleNext = async () => { // Note le 'async' ici, utile si on veut faire des await
    // 1. Validation basique
    if (!selectedValue) {
      Alert.alert("Action requise", "Veuillez sélectionner une option ou remplir le champ.");
      return;
    }
    if (currentQuestion.type === 'double_input' && currentQuestion.inputs) {
      const currentVal = selectedValue as Record<string, string> | undefined;
      
      // On vérifie si l'objet existe ET si les 2 clés sont remplies
      // On boucle sur les champs requis (inputs) définie dans data
      const isMissingField = currentQuestion.inputs.some(field => 
        !currentVal || !currentVal[field.key] || currentVal[field.key].trim() === ''
      );

      if (isMissingField) {
        Alert.alert("Action requise", "Veuillez remplir votre prénom et votre nom.");
        return;
      }
    }

    // 2. Validation Min/Max pour les Inputs
    if (currentQuestion.type === 'input') {
      const isEmptyArray = Array.isArray(selectedValue) && selectedValue.length === 0;
      if (!selectedValue || isEmptyArray) {
        Alert.alert("Action requise", "Veuillez sélectionner au moins une option.");
        return;
      }
      if (typeof selectedValue === 'string') {
        const normalizedValue = selectedValue.replace(',', '.');
        const valueFloat = parseFloat(normalizedValue);
        
        if (isNaN(valueFloat)) {
             Alert.alert("Valeur incorrecte", "Veuillez entrer un nombre valide.");
             return;
        }
        if (currentQuestion.min !== undefined && valueFloat < currentQuestion.min) {
          Alert.alert("Valeur incorrecte", `Minimum requis : ${currentQuestion.min} ${currentQuestion.suffix || ''}.`);
          return;
        }
        if (currentQuestion.max !== undefined && valueFloat > currentQuestion.max) {
          Alert.alert("Valeur incorrecte", `Maximum autorisé : ${currentQuestion.max} ${currentQuestion.suffix || ''}.`);
          return;
        }
      }
    }

    // 3. Calcul navigation
    let nextIndex = currentIndex + 1; 

    if (currentQuestion.type === 'selection' && currentQuestion.options) {
      const selectedOption = currentQuestion.options.find(opt => opt.value === selectedValue);
      if (selectedOption?.nextId) {
        const targetIndex = Questions.findIndex(q => q.id === selectedOption.nextId);
        if (targetIndex !== -1) nextIndex = targetIndex;
      }
    }

    if (nextIndex < Questions.length) {
      setHistory([...history, nextIndex]);
    } else {
      console.log("Fin :", answers);

      Alert.alert("Validation", JSON.stringify(answers, null, 2), 
        [{ text: "OK", onPress: () => router.push('/(tabs)/dashboard') }]
      );
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    } else {
      router.back();
    }
  };

  // --- Rendu conditionnel pendant le chargement ---
  // Si on est en train de chercher la sauvegarde, on affiche un rond qui tourne
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white}}>
        <ActivityIndicator size="large" color={Colors.primary || '#000'} />
      </View>
    );
  }

  // --- Rendu Principal (Inchangé) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} 
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            
            <View style={styles.header}>
              <CircularBackButton onPress={() => router.back()} />
  
              {/* Bouton temporaire de DEV pour vider le cache */}
              <Button title="Reset DEV" onPress={clearStorage} color="red" />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>{currentQuestion.title}</Text>
              
              <View style={styles.progressWrapper}>
                 <ProgressBar progress={currentQuestion.progress} />
              </View>

              <Text style={styles.question}>{currentQuestion.question}</Text>
              
              <View style={styles.optionsContainer}>
                {/* CAS 1 : Boutons */}
                {currentQuestion.type === 'selection' && (
                  <View style={styles.rowWrapper}> 
                    {currentQuestion.options?.map((option) => {
                      const isSelected = Array.isArray(selectedValue)
                        ? selectedValue.includes(option.value)
                        : selectedValue === option.value;

                      return (
                        <SelectionButton 
                          key={option.value}
                          label={option.label}
                          style={option.isFullWidth ? styles.fullWidth : styles.halfWidth}
                          isSelected={isSelected}
                          onPress={() => handleOptionSelect(option.value)}
                        />
                      );
                    })}
                  </View>
                )}

                {/* CAS 2 : Input */}
                {currentQuestion.type === 'input' && (
                  <InputField 
                    value={typeof selectedValue === 'string' ? selectedValue : ''}
                    onChangeText={handleNumericInput}
                    placeholder={currentQuestion.placeholder || "Ex: 5.5"} 
                    unit={currentQuestion.suffix} 
                    keyboardType='numeric'
                    maxLength={currentQuestion.id === 'age' ? 3 : 5}
                    style={{
                      backgroundColor: '#F5F9FA',
                      borderRadius: 16,          
                      paddingVertical: 20,       
                      fontSize: 18,              
                      fontWeight: '600',         
                      color: Colors.black
                    }}
                  />
                )}

                {/* CAS 3 : Double Input (Nom / Prénom) */}
                {currentQuestion.type === 'double_input' && currentQuestion.inputs && (
                  <View style={{ gap: 15 }}> 
                    {currentQuestion.inputs.map((field) => {
                      
                      // On récupère la valeur actuelle de ce champ précis
                      // (selectedValue est l'objet global {firstname:..., lastname:...})
                      const valObject = (selectedValue as Record<string, string>) || {};
                      const fieldValue = valObject[field.key] || '';

                      return (
                        <View key={field.key}>
                          {/* Petit label au dessus pour savoir ce qu'on tape */}
                          <Text style={{ 
                            marginLeft: 10, 
                            marginBottom: 5, 
                            fontWeight: '600', 
                            color: Colors.grayMedium || '#64748B' 
                          }}>
                            {field.label}
                          </Text>
                          
                          <InputField 
                            value={fieldValue}
                            onChangeText={(text) => handleDoubleInput(field.key, text)}
                            placeholder={field.placeholder}
                            // On désactive le clavier numérique ici
                            keyboardType='default'
                            // Auto-capitalisation pour les noms propres
                            autoCapitalize='words'
                            style={{
                              backgroundColor: '#F5F9FA',
                              borderRadius: 16,
                              paddingVertical: 18,
                              // On aligne à gauche pour les noms, c'est souvent plus joli
                              textAlign: 'left', 
                              paddingHorizontal: 20,
                              fontSize: 18,
                              fontWeight: '600',
                              color: Colors.black
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            <NavigationFooter 
              onBack={handleBack}
              onNext={handleNext}
              nextLabel={currentIndex >= Questions.length - 1 ? "Terminer" : "Suivant"}
            />
            
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Tes styles restent inchangés ...
const styles = StyleSheet.create({
  // ... (Garde tes styles actuels)
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', 
  },
  // ... etc
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  contentContainer: {
    paddingHorizontal: 24,
    flex: 1, 
    justifyContent: 'center', 
  },
  title: {
    fontSize: 36,
    fontWeight: '800', 
    color: Colors.black, 
    marginBottom: 30,
    lineHeight: 44, 
  },
  progressWrapper: {
    marginBottom: 40,
  },
  question: {
    fontSize: 22, 
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 15,
  },
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 15,
    justifyContent: 'space-between'
  },
  halfWidth: {
    width: '47%', 
  },
  fullWidth: {
    width: '100%', 
  },
});