# 🥗 Alim Care — MVP Mobile App

Alim Care est une application **santé & nutrition personnalisée** (MVP). Le projet est construit avec **React Native + Expo** et la navigation **Expo Router** (file-based routing).

L’objectif court terme est de collecter un profil santé via un **onboarding multi-étapes** et de le sauvegarder en **local (AsyncStorage)**, avant une migration future vers **Supabase**.

---

## 📌 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Démarrage rapide](#-démarrage-rapide)
- [Scripts](#-scripts)
- [Structure du projet](#-structure-du-projet)
- [Navigation (Expo Router)](#-navigation-expo-router)
- [Stockage local (AsyncStorage)](#-stockage-local-asyncstorage)
- [Roadmap](#-roadmap)
- [Dépannage](#-dépannage)

---

## ✅ Fonctionnalités

- **Home / Landing** (`/`) avec UI de base (boutons “Créer un compte” / “Se connecter”).
- **Routes créées** (`/login`, `/register`, `/onboarding`, `/dashboard`) — pages actuellement “en construction”.
- **Projet Expo Router** configuré (`main: "expo-router/entry"`).

---

## 🧰 Stack technique

- **Expo** `~54`
- **React Native** `0.81.x` (New Architecture activée dans `app.json`)
- **React** `19`
- **Expo Router** `~6`
- **AsyncStorage** `@react-native-async-storage/async-storage`
- **UI/Icons**: `lucide-react-native`
- **Web**: `react-native-web`, `react-dom`, `@expo/metro-runtime`

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** (LTS recommandé)
- **npm** (ou yarn/pnpm si vous adaptez les commandes)
- **Expo Go** (pour tester sur téléphone iOS/Android)
- (Optionnel) Android Studio / Xcode pour émulateurs

### Installation

```bash
cd alim-care
npm install
```

### Lancer l’application

```bash
# Dev server (QR code)
npm run start

# Android (émulateur ou device)
npm run android

# iOS (macOS requis)
npm run ios

# Web
npm run web
```

### Démarrage “propre” (cache)

Si Metro/Expo fait des erreurs bizarres au démarrage :

```bash
npx expo start -c
```

---

## 🧾 Scripts

Définis dans `package.json` :

- **`npm run start`**: `expo start`
- **`npm run android`**: `expo start --android`
- **`npm run ios`**: `expo start --ios`
- **`npm run web`**: `expo start --web`

---

## 📂 Structure du projet

```text
alim-care/
  app/                 # Routes (Expo Router)
    _layout.tsx        # Layout global (Stack)
    index.tsx          # Home (/)
    login.tsx          # /login (en construction)
    register.tsx       # /register (en construction)
    onboarding.tsx     # /onboarding (en construction)
    dashboard.tsx      # /dashboard (en construction)
  assets/              # Icônes & splash
  components/          # UI réutilisable (vide pour l’instant)
  constants/           # Thème / couleurs (vide pour l’instant)
  hooks/               # Logique métier (vide pour l’instant)
  app.json             # Config Expo (newArchEnabled, etc.)
  tsconfig.json        # TypeScript (strict)
```

---

## 🧭 Navigation (Expo Router)

Expo Router utilise le **routing par fichiers** : chaque fichier dans `app/` devient une route.

Exemple (dans `app/index.tsx`) :

- `router.push('/register')`
- `router.push('/login')`

Le layout global est dans `app/_layout.tsx` avec un `Stack` (headers masqués).

---

## 💾 Stockage local (AsyncStorage)

La prochaine étape du MVP est de stocker les réponses de l’onboarding en local, par exemple :

- `alimcare.profile` → profil utilisateur (régime, pathologies, mensurations, activité)

Recommandation MVP : créer un hook dédié dans `hooks/` (ex: `useProfileStorage.ts`) qui :

- sérialise/désérialise en JSON (`JSON.stringify` / `JSON.parse`)
- gère une valeur par défaut si rien n’est stocké
- encapsule les clés AsyncStorage (évite les strings “magiques” partout)

---

## 🗺 Roadmap

- [x] Setup Expo Router + routes
- [x] Home UI de base
- [ ] **Onboarding multi-étapes** (régimes, pathologies, poids/taille, activité)
- [ ] **Sauvegarde locale** (AsyncStorage) + rechargement au démarrage
- [ ] **Connexion / Inscription** (MVP) + redirection vers `/dashboard`
- [ ] **Dashboard** (résumé profil + actions)
- [ ] **Backend Supabase** (Auth + tables profil) en remplacement du stockage local

---

## 🧯 Dépannage

### “Router not configured” / routes non prises en compte

- Vérifier dans `package.json` :
  - `"main": "expo-router/entry"`
- Vérifier dans `app.json` :
  - `plugins: ["expo-router"]`

### Web: erreurs Metro / bundling

- Installer les dépendances puis relancer avec cache clean :

```bash
npm install
npx expo start -c
```

### Emulateur Android ne se lance pas

- Démarrer l’émulateur dans Android Studio, puis relancer :

```bash
npm run android
```

---

## 🤝 Contribuer

PR bienvenues. Pour les gros changements, ouvrir une issue/tâche avec :

- le besoin (user story)
- le comportement attendu
- des captures si UI

