import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';

import { Colors } from '../../constants/Colors';
import CircularBackButton from '../../components/BackButton'; 

const STORAGE_KEY_ONBOARDING = 'user_onboarding_answers';
//const STORAGE_KEY_SETTINGS = 'user_app_settings';

const LISTE_PATHOLOGIES = [
  "Hypertension",
  "Cholestérol",
  "Problèmes cardiaques",
  "Intolérance au gluten",
  "Intolérance au lactose",
  "Autres"
];

const LISTE_REGIMES = [
  "Végétarien",
  "Végétalien",
  "Coeliaque",
  "Sans produits laitiers",
  "Sans porc"
];

const OPTIONS_POIDS = [
  { label: "Moins de 60 kg", value: "-60" },
  { label: "60 - 70 kg", value: "60-70" },
  { label: "70 - 80 kg", value: "70-80" },
  { label: "80 - 90 kg", value: "80-90" },
  { label: "90 - 100 kg", value: "90-100" },
  { label: "Plus de 100 kg", value: "+100" }
];

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // --- ÉTATS ---

  const [currentUserEmail, setCurrentUserEmail] = useState(''); // Pour stocker l'email

  // Poids
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [weight, setWeight] = useState('');

  // Diabète (Nouveau state pour l'accordéon)
  const [isDiabetesOpen, setIsDiabetesOpen] = useState(false);
  const [glycemieHigh, setGlycemieHigh] = useState('');
  const [glycemieLow, setGlycemieLow] = useState('');
  
  // Pathologies
  const [isPathologyOpen, setIsPathologyOpen] = useState(false);
  const [selectedPathologies, setSelectedPathologies] = useState<string[]>([]);

  // Régimes
  const [isDietOpen, setIsDietOpen] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  // Activité
  const [hasStepGoal, setHasStepGoal] = useState(false);
  const [stepGoal, setStepGoal] = useState('8000');
  const [hasReminders, setHasReminders] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 1. D'abord, on cherche QUI est connecté
      const email = await AsyncStorage.getItem('current_user_email');
      if (!email) return; // Sécurité
      setCurrentUserEmail(email);

      // 2. On génère les clés dynamiques
      const settingsKey = `user_app_settings_${email}`;
      const onboardingKey = `user_onboarding_answers_${email}`;

      // 3. On charge les données
      const settingsData = await AsyncStorage.getItem(settingsKey);
      let settings = settingsData ? JSON.parse(settingsData) : {};

      const onboardingData = await AsyncStorage.getItem(onboardingKey);
      let onboarding = onboardingData ? JSON.parse(onboardingData) : {};;

      // 1. Poids
      if (settings.weight) {
        setWeight(settings.weight);
      } else if (onboarding.poids) {
        setWeight(onboarding.poids);
      }

      // 2. Glycémie
      if (settings.glycemieHigh) setGlycemieHigh(settings.glycemieHigh);
      else if (onboarding.glycemieCible) setGlycemieHigh(onboarding.glycemieCible);
      
      if (settings.glycemieLow) setGlycemieLow(settings.glycemieLow);

      // 3. Pathologies
      if (settings.pathologies) {
        setSelectedPathologies(settings.pathologies);
      } else if (onboarding.detailsPathologies) {
        const rawPathos = onboarding.detailsPathologies;
        if (Array.isArray(rawPathos)) {
            const cleanPathos = rawPathos.filter((p: string) => p !== "Aucune" && p !== "Non");
            setSelectedPathologies(cleanPathos);
        } else if (typeof rawPathos === 'string' && rawPathos !== "Aucune") {
            setSelectedPathologies([rawPathos]);
        }
      }

      // 4. Régimes
      if (settings.diets) {
        setSelectedDiets(settings.diets);
      } else if (onboarding.regimeAlimentaire) {
        const rawDiet = onboarding.regimeAlimentaire;
        if (Array.isArray(rawDiet)) {
            const cleanDiet = rawDiet.filter((d: string) => d !== "Aucun" && d !== "Non");
            setSelectedDiets(cleanDiet);
        } else if (typeof rawDiet === 'string' && rawDiet !== "Aucun" && rawDiet !== "Non") {
            setSelectedDiets([rawDiet]);
        }
      }

      // 5. Activité
      setHasStepGoal(settings.hasStepGoal ?? false);
      if (settings.stepGoal) setStepGoal(settings.stepGoal);
      setHasReminders(settings.hasReminders ?? false);

    } catch (e) {
      console.error("Erreur chargement settings", e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const newSettings = {
        weight,
        glycemieHigh,
        glycemieLow,
        pathologies: selectedPathologies,
        diets: selectedDiets,
        hasStepGoal,
        stepGoal,
        hasReminders
      };
      
      // Sauvegarde avec la clé liée à l'email
      const settingsKey = `user_app_settings_${currentUserEmail}`;
      await AsyncStorage.setItem(settingsKey, JSON.stringify(newSettings));
      
      Alert.alert("Succès", "Sauvegardé !");
    } catch (e) { Alert.alert("Erreur"); }
  };

  const togglePathology = (pathology: string) => {
    if (selectedPathologies.includes(pathology)) {
      setSelectedPathologies(prev => prev.filter(p => p !== pathology));
    } else {
      setSelectedPathologies(prev => [...prev, pathology]);
    }
  };

  const toggleDiet = (diet: string) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(prev => prev.filter(d => d !== diet));
    } else {
      setSelectedDiets(prev => [...prev, diet]);
    }
  };

  const CustomCheckbox = ({ label, value, onChange }: { label: string, value: boolean, onChange: () => void }) => (
    <TouchableOpacity 
      style={styles.checkboxRow} 
      activeOpacity={0.8}
      onPress={onChange}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Check size={14} color="#FFF" strokeWidth={3} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <CircularBackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Mes données - Santé</Text>

        {/* ACCORDÉON POIDS */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.accordionHeader} 
            onPress={() => setIsWeightOpen(!isWeightOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Informations physiques</Text>
            {isWeightOpen ? <ChevronUp size={20} color={Colors.black} /> : <ChevronDown size={20} color={Colors.black} />}
          </TouchableOpacity>
          
          {isWeightOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.infoText}>Sélectionnez votre poids actuel :</Text>
              <View style={{ marginTop: 10 }}>
                {OPTIONS_POIDS.map((item) => (
                  <CustomCheckbox
                    key={item.value}
                    label={item.label}
                    value={weight === item.value}
                    onChange={() => setWeight(item.value)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* 👇 ACCORDÉON DIABÈTE (MODIFIÉ) */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.accordionHeader} 
            onPress={() => setIsDiabetesOpen(!isDiabetesOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Diabète</Text>
            {isDiabetesOpen ? <ChevronUp size={20} color={Colors.black} /> : <ChevronDown size={20} color={Colors.black} />}
          </TouchableOpacity>

          {isDiabetesOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.label}>Limite glycémique haute (mg/dL) :</Text>
              <TextInput
                style={styles.input}
                value={glycemieHigh}
                onChangeText={setGlycemieHigh}
                placeholder="Ex: 180"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Limite glycémique basse (mg/dL) :</Text>
              <TextInput
                style={styles.input}
                value={glycemieLow}
                onChangeText={setGlycemieLow}
                placeholder="Ex: 70"
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {/* ACCORDÉON PATHOLOGIES */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.accordionHeader} 
            onPress={() => setIsPathologyOpen(!isPathologyOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Autres pathologies</Text>
            {isPathologyOpen ? <ChevronUp size={20} color={Colors.black} /> : <ChevronDown size={20} color={Colors.black} />}
          </TouchableOpacity>
          
          {isPathologyOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.infoText}>Sélectionnez vos pathologies :</Text>
              <View style={{ marginTop: 10 }}>
                {LISTE_PATHOLOGIES.map((item) => (
                  <CustomCheckbox
                    key={item}
                    label={item}
                    value={selectedPathologies.includes(item)}
                    onChange={() => togglePathology(item)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ACCORDÉON RÉGIMES */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.accordionHeader} 
            onPress={() => setIsDietOpen(!isDietOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionTitle}>Régime alimentaire</Text>
            {isDietOpen ? <ChevronUp size={20} color={Colors.black} /> : <ChevronDown size={20} color={Colors.black} />}
          </TouchableOpacity>
          
          {isDietOpen && (
            <View style={styles.accordionContent}>
              <Text style={styles.infoText}>Sélectionnez votre régime :</Text>
              <View style={{ marginTop: 10 }}>
                {LISTE_REGIMES.map((item) => (
                  <CustomCheckbox
                    key={item}
                    label={item}
                    value={selectedDiets.includes(item)}
                    onChange={() => toggleDiet(item)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Mes données - Activité Sportive</Text>

        {/* CARTE SPORT */}
        <View style={styles.card}>
          <CustomCheckbox 
            label="Je souhaite avoir un objectif de pas quotidien"
            value={hasStepGoal}
            onChange={() => setHasStepGoal(!hasStepGoal)}
          />

          {hasStepGoal && (
            <View style={styles.subInputContainer}>
              <Text style={styles.label}>Objectif de pas quotidien :</Text>
              <TextInput
                style={styles.input}
                value={stepGoal}
                onChangeText={setStepGoal}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={{ marginTop: 15 }}>
            <CustomCheckbox 
              label="Je souhaite avoir des rappels"
              value={hasReminders}
              onChange={() => setHasReminders(!hasReminders)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.contrastMainII || '#0D253F',
  },
  content: {
    padding: 24,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.contrastMainII || '#0D253F',
    marginTop: 20,
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.contrastMainII,
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#E8ECF0', 
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.contrastMainII,
    marginBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accordionContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoText: {
    color: Colors.grayMedium || '#64748B',
    fontSize: 14,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.grayMedium || '#94A3B8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, 
  },
  checkboxChecked: {
    backgroundColor: Colors.primary || '#5ABCB9',
    borderColor: Colors.primary || '#5ABCB9',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.contrastMainII,
    lineHeight: 22,
  },
  subInputContainer: {
    marginLeft: 34, 
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: Colors.primary || '#5ABCB9',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: Colors.primary || '#5ABCB9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});