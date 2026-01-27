import Constants from 'expo-constants';

// On récupère l'adresse du "Packager" Expo (ex: 192.168.1.18:8081)
const debuggerHost = Constants.expoConfig?.hostUri;

// On extrait juste l'IP (ex: 192.168.1.18)
// Si jamais on ne la trouve pas (ex: build prod), on met localhost par sécurité
const localhost = debuggerHost?.split(':')[0] || 'localhost';

// On construit les URLs dynamiquement
export const API_URL = `http://${localhost}:3000`;     // Pour JSON-Server
export const UPLOAD_URL = `http://${localhost}:3001`;  // Pour le serveur d'images

// Petit log pour vérifier au lancement
console.log('🔗 Connection aux serveurs sur :', localhost);