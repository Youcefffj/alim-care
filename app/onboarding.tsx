import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
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

export default function QuestionnaireScreen() {
  const router = useRouter();
  
  // États
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([0]); 
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true); 

  // --- LOGIQUE DE SAUVEGARDE (PERSISTANCE LIÉE À L'EMAIL) ---

  // A. CHARGEMENT INITIAL
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // 1. Qui est connecté ?
        const email = await AsyncStorage.getItem('current_user_email');
        
        if (!email) {
            // Personne ? Retour au login par sécurité
            router.replace('/login');
            return;
        }
        setCurrentUserEmail(email);

        // 2. On génère les clés dynamiques spécifiques à cet utilisateur
        const answersKey = `user_onboarding_answers_${email}`;
        const historyKey = `user_onboarding_history_${email}`;

        // 3. On récupère les données
        const savedAnswers = await AsyncStorage.getItem(answersKey);
        const savedHistory = await AsyncStorage.getItem(historyKey);

        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.log("Erreur de chargement", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // B. SAUVEGARDE AUTOMATIQUE
  useEffect(() => {
    const saveProgress = async () => {
      try {
        // On ne sauvegarde que si on a un utilisateur et que le chargement est fini
        if (!isLoading && currentUserEmail) {
          const answersKey = `user_onboarding_answers_${currentUserEmail}`;
          const historyKey = `user_onboarding_history_${currentUserEmail}`;

          await AsyncStorage.setItem(answersKey, JSON.stringify(answers));
          await AsyncStorage.setItem(historyKey, JSON.stringify(history));
        }
      } catch (error) {
        console.log("Erreur de sauvegarde", error);
      }
    };

    saveProgress();
  }, [answers, history, isLoading, currentUserEmail]);


  // --- Variables calculées ---
  // Si history est vide (bug rare), on remet [0]
  const safeHistory = history.length > 0 ? history : [0];
  const currentIndex = safeHistory[safeHistory.length - 1];
  const currentQuestion = Questions[currentIndex];
  const selectedValue = answers[currentQuestion?.id]; // Le '?' protège si index hors limite

  // --- Reset DEV (Spécifique à l'utilisateur) ---
  const clearStorage = async () => {
    if (!currentUserEmail) return;
    
    const answersKey = `user_onboarding_answers_${currentUserEmail}`;
    const historyKey = `user_onboarding_history_${currentUserEmail}`;
    
    await AsyncStorage.removeItem(answersKey);
    await AsyncStorage.removeItem(historyKey);
    
    setAnswers({});
    setHistory([0]);
    Alert.alert("Reset", "Mémoire de cet utilisateur effacée.");
  };

  // --- Gestion du Double Input (Nom / Prénom) ---
  const handleDoubleInput = (key: string, text: string) => {
    if (!currentQuestion) return;
    const currentAnswerObj = (answers[currentQuestion.id] as Record<string, string>) || {};
    const newAnswerObj = { ...currentAnswerObj, [key]: text };
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswerObj }));
  };

  // --- Logique de saisie sécurisée ---
  const handleNumericInput = (text: string) => {
    const numericValue = text.replace(/[^0-9.,]/g, '');
    handleOptionSelect(numericValue);
  };

  const handleOptionSelect = (value: string) => {
    if (!currentQuestion) return;

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

  const handleNext = async () => {
    if (!currentQuestion) return;

    // 1. Validation basique
    if (!selectedValue) {
      Alert.alert("Action requise", "Veuillez sélectionner une option ou remplir le champ.");
      return;
    }
    if (currentQuestion.type === 'double_input' && currentQuestion.inputs) {
      const currentVal = selectedValue as Record<string, string> | undefined;
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
      // Fin du questionnaire -> Dashboard
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    } else {
      // Si on est au tout début, on peut proposer de se déconnecter ou juste faire un back classique
      router.back();
    }
  };

  // --- Rendu conditionnel pendant le chargement ---
  if (isLoading || !currentQuestion) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white}}>
        <ActivityIndicator size="large" color={Colors.primary || '#000'} />
      </View>
    );
  }

  // --- Rendu Principal ---
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
              <CircularBackButton onPress={handleBack} />
              {/* Le bouton Reset n'est affiché que pour le debug */}
              <Button title="Reset (Debug)" onPress={clearStorage} color="red" />
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
                      const valObject = (selectedValue as Record<string, string>) || {};
                      const fieldValue = valObject[field.key] || '';

                      return (
                        <View key={field.key}>
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
                            keyboardType='default'
                            autoCapitalize='words'
                            style={{
                              backgroundColor: '#F5F9FA',
                              borderRadius: 16,
                              paddingVertical: 18,
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pour espacer Back et Reset
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