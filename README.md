# 🥗 Elya — Application Mobile Santé & Nutrition

**Elya** est une application mobile de **santé et nutrition personnalisée** conçue pour accompagner les personnes atteintes de diabète dans leur quotidien. L'application propose un suivi glycémique, des recettes adaptées, des défis sportifs et une communauté de partage.

Le projet est construit avec **React Native + Expo** et utilise **Expo Router** pour la navigation (file-based routing).

---

## 📌 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Démarrage rapide](#-démarrage-rapide)
- [Scripts](#-scripts)
- [Structure du projet](#-structure-du-projet)
- [Navigation](#-navigation)
- [API & Serveurs](#-api--serveurs)
- [Dépannage](#-dépannage)

---

## ✅ Fonctionnalités

### Authentification
- **Inscription** avec validation du mot de passe (8 caractères min, majuscule, minuscule, chiffre, caractère spécial)
- **Connexion** avec base utilisateur locale simulée
- Gestion de session via `AsyncStorage`

### Onboarding
- Questionnaire multi-étapes pour créer un profil santé personnalisé
- Sauvegarde automatique de la progression
- Composants réutilisables (ProgressBar, SelectionButton, InputField)

### Dashboard
- Message de bienvenue personnalisé
- **Défi sportif du jour** (chargé aléatoirement depuis `challenges.json`)
- **Recettes recommandées** avec aperçu rapide
- **Suivi glycémique** avec cercles de progression interactifs (avant/après repas)

### Recettes
- Catalogue de recettes adaptées aux diabétiques
- **Recherche** par texte
- **Filtres avancés** : durée, type de repas, style de cuisine, régime alimentaire
- Système de **favoris** persistant
- Détails complets : ingrédients, instructions étape par étape, informations nutritionnelles

### Santé
- **Historique glycémique** avec graphiques interactifs
- Visualisation **quotidienne** et **hebdomadaire**
- Ajout de nouvelles mesures (matin/soir, avant/après repas)
- Bibliothèque `react-native-gifted-charts` pour les graphiques

### Communauté
- **Flux de recettes** partagées par la communauté
- **Classement** des recettes les plus populaires (par likes)
- **Ajout de recettes** avec :
  - Upload d'image
  - Ingrédients dynamiques
  - Instructions par étapes
  - Catégorie (Sucré/Salé)
- Détail de recette communautaire

### Compte
- Gestion du profil utilisateur
- **Changement d'avatar** avec upload vers serveur
- Accès rapide aux favoris
- Paramètres de l'application
- Déconnexion sécurisée

---

## 🧰 Stack technique

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Expo** | `~54` | Framework de développement React Native |
| **React Native** | `0.81.x` | Framework mobile (New Architecture activée) |
| **React** | `19.1` | Bibliothèque UI |
| **Expo Router** | `~6` | Navigation file-based |
| **TypeScript** | `~5.9` | Typage statique |

### Stockage & API
| Technologie | Usage |
|-------------|-------|
| **AsyncStorage** | Stockage local (profil, favoris, glycémie) |
| **JSON-Server** | API REST pour les recettes communautaires |
| **Express + Multer** | Serveur d'upload d'images |

### UI & Graphiques
| Technologie | Usage |
|-------------|-------|
| **Lucide React Native** | Icônes |
| **react-native-gifted-charts** | Graphiques (LineChart) |
| **expo-linear-gradient** | Dégradés |
| **expo-image-picker** | Sélection d'images |

---

## 🏗 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        APPLICATION                          │
├─────────────────────────────────────────────────────────────┤
│  Expo Router (Navigation)                                   │
│  ├── / (Landing)                                            │
│  ├── /login, /register (Auth)                               │
│  ├── /onboarding (Questionnaire)                            │
│  └── (tabs)/ (Navigation principale)                        │
│       ├── dashboard                                         │
│       ├── recettes                                          │
│       ├── sante                                             │
│       ├── communaute                                        │
│       └── compte                                            │
├─────────────────────────────────────────────────────────────┤
│  Données                                                    │
│  ├── AsyncStorage (local)                                   │
│  │    ├── simulated_user_db (utilisateurs)                  │
│  │    ├── user_glycemic_history (glycémie)                  │
│  │    ├── user_recipe_favorites (favoris)                   │
│  │    └── user_profile_data_{email} (profil)                │
│  └── JSON-Server (API REST)                                 │
│       └── data/db.json (recettes communautaires)            │
├─────────────────────────────────────────────────────────────┤
│  Serveurs locaux                                            │
│  ├── :3000 → JSON-Server (API recettes)                     │
│  └── :3001 → Express (Upload images)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** (LTS recommandé, >= 18)
- **npm** (ou yarn/pnpm)
- **Expo Go** (iOS/Android) pour tester sur mobile
- (Optionnel) Android Studio / Xcode pour émulateurs

### Installation

```bash
git clone <repo-url>
cd alim-care
npm install
```

### Lancer l'application

#### Mode développement complet (recommandé)

Lance simultanément l'app Expo, le JSON-Server et le serveur d'images :

```bash
npm run dev
```

#### Lancement manuel

```bash
# Terminal 1 : API recettes communautaires
npm run server:db

# Terminal 2 : Serveur d'upload d'images
npm run server:img

# Terminal 3 : Application Expo
npm run start
```

#### Autres commandes

```bash
# Démarrage propre (clear cache)
npm run app:clear

# QR code via tunnel (si problème réseau)
npx expo start --tunnel

# Vérifier la cohérence des dépendances
npx expo doctor
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Lance le serveur Expo |
| `npm run dev` | Lance tous les serveurs (Expo + API + Images) |
| `npm run server:db` | JSON-Server sur le port 3000 |
| `npm run server:img` | Serveur d'upload sur le port 3001 |
| `npm run app:clear` | Expo avec cache vidé |
| `npm run android` | Lance sur Android |
| `npm run ios` | Lance sur iOS |
| `npm run web` | Lance en mode web |

---

## 📂 Structure du projet

```text
alim-care/
├── app/                          # Routes (Expo Router)
│   ├── _layout.tsx               # Layout racine (Stack)
│   ├── index.tsx                 # Landing page (/)
│   ├── login.tsx                 # Connexion
│   ├── register.tsx              # Inscription
│   ├── onboarding.tsx            # Questionnaire santé
│   ├── (tabs)/                   # Navigation principale (TabBar)
│   │   ├── _layout.tsx           # Configuration des tabs
│   │   ├── dashboard.tsx         # Accueil utilisateur
│   │   ├── recettes.tsx          # Catalogue de recettes
│   │   ├── sante.tsx             # Suivi glycémique
│   │   ├── communaute.tsx        # Recettes communautaires
│   │   └── compte.tsx            # Profil utilisateur
│   ├── (communaute)/             # Routes communauté
│   │   └── add-recipe.tsx        # Formulaire ajout recette
│   ├── (account)/                # Routes compte
│   │   └── settings.tsx          # Paramètres
│   ├── recette/[id].tsx          # Détail recette (catalogue)
│   └── community-recipe/[id].tsx # Détail recette communautaire
│
├── components/                   # Composants réutilisables
│   ├── CustomTabBar.tsx          # Barre de navigation personnalisée
│   ├── GlycemicCircle.tsx        # Cercle de progression glycémie
│   ├── InputField.tsx            # Champ de saisie stylisé
│   ├── PrimaryButton.tsx         # Bouton principal
│   ├── SelectionButton.tsx       # Bouton de sélection (onboarding)
│   ├── ProgressBar.tsx           # Barre de progression
│   ├── BackButton.tsx            # Bouton retour circulaire
│   ├── OnboardingFooter.tsx      # Footer de navigation onboarding
│   └── MenuItemCompte.tsx        # Item de menu (compte)
│
├── constants/                    # Configuration
│   ├── Colors.ts                 # Palette de couleurs
│   ├── Config.ts                 # URLs API dynamiques
│   └── questions.ts              # Questions de l'onboarding
│
├── data/                         # Données statiques/mock
│   ├── recipes.json              # Recettes du catalogue
│   ├── challenges.json           # Défis sportifs
│   └── db.json                   # Base recettes communautaires
│
├── assets/                       # Ressources (images, fonts)
├── server.js                     # Serveur Express (upload images)
├── app.json                      # Configuration Expo
├── tsconfig.json                 # Configuration TypeScript
└── package.json                  # Dépendances & scripts
```

---

## 🧭 Navigation

L'application utilise **Expo Router** avec une architecture hybride :

### Routes publiques (Stack)
- `/` → Landing page
- `/login` → Connexion
- `/register` → Inscription
- `/onboarding` → Questionnaire

### Routes authentifiées (Tabs)
- `/dashboard` → Accueil
- `/recettes` → Catalogue recettes
- `/sante` → Suivi santé
- `/communaute` → Communauté
- `/compte` → Mon compte

### Routes dynamiques
- `/recette/[id]` → Détail recette catalogue
- `/community-recipe/[id]` → Détail recette communautaire

---

## 🔌 API & Serveurs

### Configuration automatique

L'application détecte automatiquement l'IP locale via `expo-constants` pour se connecter aux serveurs de développement :

```typescript
// constants/Config.ts
export const API_URL = `http://${localhost}:3000`;     // JSON-Server
export const UPLOAD_URL = `http://${localhost}:3001`;  // Serveur images
```

### JSON-Server (Port 3000)

API REST pour les recettes communautaires :

```
GET    /recipes       # Liste des recettes
GET    /recipes/:id   # Détail d'une recette
POST   /recipes       # Créer une recette
PATCH  /recipes/:id   # Modifier une recette (likes)
```

### Serveur d'upload (Port 3001)

Endpoint pour l'upload d'images :

```
POST /upload  # Upload d'image, retourne l'URL publique
```

---

## 🧯 Dépannage

### Problèmes courants

#### "Router not configured"
- Vérifier `"main": "expo-router/entry"` dans `package.json`
- Vérifier `plugins: ["expo-router"]` dans `app.json`

#### Erreurs de connexion API
- S'assurer que les serveurs sont lancés (`npm run dev`)
- Vérifier que le téléphone est sur le même réseau Wi-Fi

#### Images non affichées (communauté)
- Vérifier que le serveur d'images est lancé sur le port 3001
- Les images sont servies depuis `uploads/` à la racine

#### Erreurs Metro / bundling

```bash
npm install
npx expo start -c
```

#### Réinitialiser les données locales

Dans l'app, aller dans **Compte > Paramètres** ou vider le cache de l'app.

---

## 📱 Captures d'écran

*À venir*

---

## 👥 Équipe

Projet de fin d'études (PFE) — AlimCare / Elya

---

## 📄 Licence

Projet privé — Tous droits réservés
