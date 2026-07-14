const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const getAllFiles = (dirPath, username, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, username, arrayOfFiles);
        } else {
            const relativePath = path.relative(path.join(process.env.UPLOAD_DIR || './data', username), fullPath);
            const fileStat = fs.statSync(fullPath); // Ambil info stats berkas
            
            arrayOfFiles.push({
                name: file,
                relativePath: relativePath,
                url: `/stream/${username}/${relativePath.replace(/\\/g, '/')}`,
                birthtime: fileStat.birthtimeMs,
                size: fileStat.size // 📌 TAMBAHKAN BARIS INI: Mengambil kapasitas ukuran byte murni berkas
            });
        }
    });

    return arrayOfFiles;
};


exports.uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file di-upload.' });
    }
    // Mengambil path relatif dari folder tujuan multer
    const relativePath = path.relative(path.join(process.env.UPLOAD_DIR || './data', req.user.username), req.file.path);
    
    res.status(200).json({
        message: 'File disimpan dengan nama asli!',
        fileName: req.file.filename,
        url: `/stream/${req.user.username}/${relativePath.replace(/\\/g, '/')}`
    });
};

exports.listFiles = (req, res) => {
    const userRootPath = path.join(process.env.UPLOAD_DIR || './data', req.user.username);

    if (!fs.existsSync(userRootPath)) {
        return res.status(200).json([]);
    }

    try {
        const fileList = getAllFiles(userRootPath, req.user.username);
        res.status(200).json(fileList);
    } catch (err) {
        res.status(500).json({ message: 'Gagal membaca isi harddisk.' });
    }
};

exports.deleteFile = (req, res) => {
    // Karena nama file dikirim bersama jalur sub-foldernya via param/query, kita bersihkan jalurnya
    const relativeFilePath = req.query.path || req.params.filename; 
    const filePath = path.join(process.env.UPLOAD_DIR || './data', req.user.username, relativeFilePath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Berkas tidak ditemukan di harddisk.' });
    }

    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ message: 'Gagal menghapus file fisik.' });
        
        // Opsional: Hapus sub-folder jika kondisinya sudah kosong agar harddisk tidak penuh folder kosong
        const dirPath = path.dirname(filePath);
        try {
            if (fs.readdirSync(dirPath).length === 0) {
                fs.rmdirSync(dirPath);
            }
        } catch (e) { console.error(e); }

        res.status(200).json({ message: 'File asli berhasil dihapus!' });
    });
};

// 📌 MASUKKAN KEMBALI: JALUR API DOWNLOAD FILE ASLI PARALEL TANPA ZIP
exports.downloadFile = (req, res) => {
    const relativeFilePath = req.query.path || req.params.filename; 
    const filePath = path.join(process.env.UPLOAD_DIR || './data', req.user.username, relativeFilePath);

    // Validasi keberadaan file fisik di harddisk eksternal
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        return res.status(404).json({ message: 'Berkas tidak ditemukan di dalam harddisk.' });
    }

    // Mengirim file fisik murni dan memaksa browser mengunduh dengan nama aslinya
    res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
            console.error("Gagal mentransmisikan unduhan berkas:", err);
        }
    });
};

exports.getStorageSpace = (req, res) => {
    const targetDir = process.env.UPLOAD_DIR || './data';
    exec(`df -Pk "${targetDir}" | tail -n 1 | awk '{print $2" "$3" "$5}'`, (err, stdout, stderr) => {
        if (err || !stdout) return res.status(500).json({ message: 'Gagal mengecek kapasitas.' });
        const dataParts = stdout.trim().split(' ');
        const totalKB = parseInt(dataParts[0]);
        const usedKB = parseInt(dataParts[1]);
        const percentText = dataParts[2] ? dataParts[2].replace('%', '') : '0';
        
        if (isNaN(totalKB) || isNaN(usedKB)) {
            return res.status(500).json({ message: 'Gagal memproses data kapasitas.' });
        }
        const totalGB = (totalKB / (1024 * 1024)).toFixed(1);
        const usedGB = (usedKB / (1024 * 1024)).toFixed(1);
        const percentage = parseInt(percentText);

        res.status(200).json({ used: usedGB, total: totalGB, percent: percentage });
    });
};
