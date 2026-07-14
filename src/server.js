const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const mediaRoutes = require('./routes/mediaRoutes');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 🔄 PERBAIKAN TOTAL: Menggunakan req.originalUrl murni, 100% bebas dari PathError versi baru
app.use('/stream/:username', (req, res, next) => {
    const username = req.params.username;
    
    // Memotong string URL untuk mengambil sisa sub-folder dan nama file asli dibelakangnya
    // Contoh: /stream/admin/20260714-1200/foto.jpg -> menjadi: 20260714-1200/foto.jpg
    const searchPrefix = `/stream/${username}/`;
    const relativePath = decodeURIComponent(req.originalUrl.substring(req.originalUrl.indexOf(searchPrefix) + searchPrefix.length));

    // Jika user mengakses folder induk kosong tanpa nama file
    if (!relativePath || relativePath === '/') {
        return res.status(400).send('Jalur file tidak spesifik.');
    }

    const baseUploadDir = path.resolve(process.env.UPLOAD_DIR || './data');
    const fullFilePath = path.join(baseUploadDir, username, relativePath);

    // 1. Jalur Utama: Jika file langsung ditemukan di dalam sub-folder harddisk, langsung tayangkan
    if (fs.existsSync(fullFilePath) && !fs.statSync(fullFilePath).isDirectory()) {
        return res.sendFile(fullFilePath);
    }

    // 2. JALUR CADANGAN (FALLBACK): Jika jalur struktur meleset, cari mendalam berdasarkan nama file murni
    const userRootDir = path.join(baseUploadDir, username);
    if (fs.existsSync(userRootDir)) {
        const fileName = path.basename(relativePath);
        
        const findFileRecursive = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const itemPath = path.join(dir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    const found = findFileRecursive(itemPath);
                    if (found) return found;
                } else if (item === fileName) {
                    return itemPath;
                }
            }
            return null;
        };

        const foundPath = findFileRecursive(userRootDir);
        if (foundPath) return res.sendFile(foundPath);
    }

    res.status(404).send('Berkas media tidak ditemukan di harddisk eksternal.');
});


// API Endpoint untuk Auth Login & Daftar
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// API Endpoint untuk Media (Foto/Video)
app.use('/api/media', mediaRoutes);

app.listen(PORT, () => {
    console.log(`Server Home Cloud Secure berjalan di http://localhost:${PORT}`);
});
