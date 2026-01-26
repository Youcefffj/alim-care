// constants/questions.ts

// 1. On définit les types de questions possibles
export type QuestionType = 'selection' | 'dropdown' | 'input' | 'double_input';

export interface Option {
  label: string;
  value: string;
  isFullWidth?: boolean; 
  nextId?: string; 
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  question: string;
  progress: number;
  options?: Option[]; 
  placeholder?: string;
  min?: number;
  max?: number;
  suffix?: string;
  isMultiSelect?: boolean;
  
  // 👇 NOUVEAU : Pour définir les 2 champs du double input
  inputs?: { 
    key: string;       // ex: 'firstname'
    label: string;     // ex: 'Prénom'
    placeholder: string; 
  }[];
}

export const Questions: Question[] = [
  
  // ----- Identité -----
  {
    id: 'identity',
    type: 'double_input',
    title: "Bienvenue",
    question: "Comment vous appelez-vous ?",
    progress: 0,
    inputs: [
      { key: 'firstname', label: 'Prénom', placeholder: "Ex: Camille" },
      { key: 'lastname', label: 'Nom', placeholder: "Ex: Dupont" }
    ]
  },
  /// ----- Informations Personnelles -----    
  {
    id: 'genre',
    type: 'selection',
    title: "Pour mieux vous connaître",
    question: "Quel est votre genre ?",
    progress: 0.05,
    options: [
      { label: "Femme", value: "Femme" },
      { label: "Homme", value: "Homme" },
      { label: "Autre / Je préfère ne pas répondre", value: "Autre", isFullWidth: true }
    ]
  },

  {
    id: 'age',
    type: 'input',
    title: "Pour mieux vous connaître",
    question: "Quel est votre âge ?",
    progress: 0.125,
    placeholder: "Ex: 35",
    // BLINDAGE : Entre 18 et 120 ans
    min: 18,
    max: 120,
    suffix: "ans"
  },

  {
    id: 'taille',
    type: 'input',
    title: "Pour mieux vous connaître",
    question: "Quelle est votre taille ?",
    progress: 0.25,
    placeholder: "Ex: 175",
    // BLINDAGE : Entre 50cm et 250cm
    min: 50,
    max: 250,
    suffix: "cm"
  },

  {
    id: 'poids',
    type: 'selection',
    title: "Pour mieux vous connaître",
    question: "Quel est votre poids actuel ?",
    progress: 0.375,
    options: [
      { label: " Moins de 60 kg", value: "-60" },
      { label: "60 - 70 kg", value: "60-70" },
      { label: "70 - 80 kg", value: "70-80" },
      { label: "80 - 90 kg", value: "80-90" },
      { label: "90 - 100 kg", value: "90-100" },
      { label: "Plus de 100 kg", value: "+100" }
    ]
  },


  /// ----- Glycémie -----
  {
    id: 'glycemieMoyenne',
    type: 'input',
    title: "Votre situation glycémique", 
    question: "Quel est votre taux de glycémie moyen ?",
    progress: 0.5,
    placeholder: "Ex: 19.5", // Exemple adapté aux décimales
    min: 20,   
    max: 1000,
    suffix: "mg/dL"
  },
  {
    id: 'glycemieObjective',
    type: 'selection',
    title: "Votre situation glycémique",
    question: "Avez-vous un objectif glycémique à ne pas dépasser ?",
    progress: 0.625,
    options: [
        { label: "Oui", value: "Oui" }, 
        // 👇 Si NON, on saute la question de la cible pour aller directement aux pathologies
        { label: "Non", value: "Non", nextId: 'AutresPathologies' } 
    ]
  },
  {
    id: 'glycemieCible',
    type: 'input',
    title: "Votre situation glycémique",
    question: "Quel est-il ?",
    progress: 0.625,
    placeholder: "Ex: 7.0", // Exemple adapté aux décimales
    min: 70, 
    max: 250,
    suffix: "mg/dL"
  },


    /// ----- Enjeux de santé associés -----
  {
    id: 'AutresPathologies',
    type: 'selection',
    title: "Enjeux de santé associés",
    question: "Votre diabète est-il associé à d'autres pathologies ?",
    progress: 0.75,
    options: [
        { label: "Oui", value: "Oui" },
        // 👇 Si NON, on saute les détails pour aller directement à l'activité physique
        { label: "Non", value: "Non", nextId: 'activitePhysique' } 
    ]
  },
  {
    id: 'detailsPathologies',
    type: 'selection',
    isMultiSelect: true,
    title: "Enjeux de santé associés",
    question: "Lesquelles ?",
    progress: 0.75,
    options: [
        { label: "Hypertension", value: "Hypertension" },
        { label: "Cholestérol", value: "Cholestérol" },
        { label: "Autres", value: "Autres" },
        { label: "Je préfère ne pas préciser", value: "Non"}
    ]
  },

  /// ----- Activité physique -----
  {
    id: 'activitePhysique',
    type: 'selection',
    title: "Activité physique",
    question: "Dans votre quotidien, quelle place occupe l'activité physique ?",
    progress: 0.875,
    options: [
        { label: "Je bouge peu au quotidien", value: "Faible" },
        { label: "Je fais du sport de façon régulière", value: "Intense" },
        { label: "Je bouge un peu, surtout à travers des activités comme la marche", value: "Moyen", isFullWidth: true }
    ]
  },

  /// ----- Régime alimentaire -----
  {
    id: 'regimeAlimentaire',
    type: 'selection',
    isMultiSelect: true,
    title: "Régime alimentaire",
    question: "Suivez-vous un régime alimentaire particulier ?",
    progress: 0.975,
    options: [
        { label: "Non", value: "Non" },
        { label: "Vegetarien", value: "Vegetarien" },
        { label: "Vegan", value: "Vegan" },
        { label: "Coeliaque", value: "Coeliaque" },
        { label: "Sans porc", value: "Sans porc" },
        { label: "Sans produits laitiers", value: "Sans produits laitiers" }
    ]
  }
];