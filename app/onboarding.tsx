import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Alert, 
  KeyboardAvoidingView, // <--- 1. Import
  Platform,             // <--- 2. Import pour détecter iOS
  TouchableWithoutFeedback, // <--- 3. Import pour le clic fond
  Keyboard              // <--- 4. Import pour fermer clavier
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Questions } from '../constants/questions';

import ProgressBar from '../components/ProgressBar';
import SelectionButton from '../components/SelectionButton';
import CircularBackButton from '../components/BackButton';
import NavigationFooter from '../components/OnboardingFooter';
import { InputField } from '../components/InputField';

export default function QuestionnaireScreen() {
  const router = useRouter();
  
  const [history, setHistory] = useState<number[]>([0]); 
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentIndex = history[history.length - 1];
  const currentQuestion = Questions[currentIndex];
  const selectedValue = answers[currentQuestion.id];

  // --- Logique de saisie sécurisée ---
  const handleNumericInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    handleOptionSelect(numericValue);
  };

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    // 1. Validation basique
    if (!selectedValue) {
      Alert.alert("Action requise", "Veuillez sélectionner une option ou remplir le champ.");
      return;
    }

    // 2. Validation Min/Max pour les Inputs
    if (currentQuestion.type === 'input') {
      const valueInt = parseInt(selectedValue, 10);
      if (currentQuestion.min !== undefined && valueInt < currentQuestion.min) {
        Alert.alert("Valeur incorrecte", `Minimum requis : ${currentQuestion.min} ${currentQuestion.suffix || ''}.`);
        return;
      }
      if (currentQuestion.max !== undefined && valueInt > currentQuestion.max) {
        Alert.alert("Valeur incorrecte", `Maximum autorisé : ${currentQuestion.max} ${currentQuestion.suffix || ''}.`);
        return;
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
        [{ text: "OK", onPress: () => router.push('/dashboard') }]
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

  // --- Rendu ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* SOLUTIONS CLAVIER :
         1. KeyboardAvoidingView : Pousse le contenu vers le haut.
         2. TouchableWithoutFeedback : Ferme le clavier si on clique ailleurs.
      */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} // Ajustement fin si besoin
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          
          <View style={styles.container}>
            
            {/* Header */}
            <View style={styles.header}>
              <CircularBackButton onPress={() => router.back()} />
            </View>

            {/* Contenu */}
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
                    {currentQuestion.options?.map((option) => (
                      <SelectionButton 
                        key={option.value}
                        label={option.label}
                        style={option.isFullWidth ? styles.fullWidth : styles.halfWidth}
                        isSelected={selectedValue === option.value}
                        onPress={() => handleOptionSelect(option.value)}
                      />
                    ))}
                  </View>
                )}

                {/* CAS 2 : Input */}
                {currentQuestion.type === 'input' && (
                  <InputField 
                    value={selectedValue || ''} 
                    onChangeText={handleNumericInput}
                    placeholder={currentQuestion.placeholder || "Votre réponse..."}
                    keyboardType='numeric'
                    maxLength={currentQuestion.id === 'age' ? 3 : 5}
                    style={{
                      textAlign: 'center',       
                      backgroundColor: '#F5F9FA',
                      borderRadius: 16,          
                      paddingVertical: 20,       
                      fontSize: 18,              
                      fontWeight: '600',         
                      color: Colors.black
                    }}
                  />
                )}
              </View>
            </View>

            {/* Footer */}
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