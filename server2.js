// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server'); // <-- Ajout pour fusionner la BDD

const app = express();
// Le Cloud (Render) imposera son propre port via process.env.PORT. Sinon, on utilise 3000.
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- 1. CONFIGURATION DU DOSSIER PUBLIC ---
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- 2. CONFIGURATION MULTER (Identique à la vôtre) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'recipe-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// --- 3. ROUTES EXPRESS ---

// A. Route pour l'upload d'images
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier reçu');
  }

  // On crée une URL dynamique qui s'adaptera au Cloud automatiquement
  const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
  console.log(`📸 Image reçue ! Accessible ici : ${fileUrl}`);
  res.json({ url: fileUrl });
});

// B. Route pour la base de données (db.json)
// Toutes les requêtes vers /api iront interroger votre db.json !
app.use('/api', jsonServer.defaults());
app.use('/api', jsonServer.router('data/db.json'));

// --- 4. DÉMARRAGE DU SERVEUR ---
app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`🚀 Serveur Unifié (Images + BDD) lancé !`);
  console.log(`👉 Port actif : ${PORT}`);
  console.log(`--------------------------------------------------`);
});