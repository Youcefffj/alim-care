// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dgram = require('dgram'); // Module natif pour faire le test de connexion

const app = express();
const PORT = 3001;

app.use(cors());

// --- 1. CONFIGURATION DU DOSSIER PUBLIC ---
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- 2. CONFIGURATION MULTER ---
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

// --- 3. FONCTION MAGIQUE (La méthode Expo) ---
function startServerWithRealIp() {
  // On crée un socket (comme une tentative de connexion)
  const socket = dgram.createSocket('udp4');
  
  // On fait semblant de se connecter à Google DNS (8.8.8.8)
  // Cela force Windows à choisir la VRAIE carte réseau (Wi-Fi)
  socket.connect(80, '8.8.8.8', () => {
    // On récupère l'adresse choisie par Windows
    const realIp = socket.address().address;
    socket.close();
    
    // Une fois qu'on a l'IP, on lance le serveur
    launchExpress(realIp);
  });

  // Si jamais on est hors ligne (pas d'internet), on fallback sur localhost
  socket.on('error', () => {
    socket.close();
    launchExpress('localhost');
  });
}

function launchExpress(myIp) {
  // --- ROUTES ---
  app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Aucun fichier reçu');
    }

    const fileUrl = `http://${myIp}:${PORT}/public/uploads/${req.file.filename}`;
    console.log(`Image reçue ! Accessible ici : ${fileUrl}`);
    res.json({ url: fileUrl });
  });

  app.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`📸 Serveur d'images lancé !`);
    console.log(`👉 IP détectée (Méthode Connect) : ${myIp}`);
    console.log(`👉 Adresse : http://${myIp}:${PORT}`);
    console.log(`--------------------------------------------------`);
  });
}

// --- DÉMARRAGE ---
startServerWithRealIp();