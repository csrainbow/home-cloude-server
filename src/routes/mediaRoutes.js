const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Membuat sub-folder dinamis berbasis waktu menit saat upload (Contoh: /admin/20260714-1200)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        const timeFolder = `${year}${month}${day}-${hour}${minute}`;
        
        // Jalur penyimpanan akhir di harddisk: /induk_harddisk/nama_user/waktu_upload/
        const targetDir = path.join(process.env.UPLOAD_DIR || './data', req.user.username, timeFolder);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        // SAMA PERSIS: Mempertahankan nama berkas asli 100% tanpa tambahan karakter apa pun
        cb(null, file.originalname);
    }
});


const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } 
});

// Seluruh rute media wajib melewati authMiddleware terlebih dahulu
router.post('/upload', authMiddleware, upload.single('media'), mediaController.uploadFile);
router.get('/download/:filename', authMiddleware, mediaController.downloadFile);
router.get('/list', authMiddleware, mediaController.listFiles);
router.delete('/:filename', authMiddleware, mediaController.deleteFile);
router.get('/storage-space', authMiddleware, mediaController.getStorageSpace);

module.exports = router;
