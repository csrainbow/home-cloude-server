const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 🔄 PINTAR: Mencari token di header utama, JIKA tidak ada (seperti kasus download langsung), cek di parameter URL (?token=...)
    const authHeader = req.headers['authorization'];
    let pureToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        pureToken = authHeader.split(' ')[1];
    } else if (req.query.token) {
        pureToken = req.query.token; // Tangkap token otomatis dari link download massal
    }

    // Jika di kedua tempat tersebut tidak ditemukan token sama sekali, blokir akses
    if (!pureToken) {
        return res.status(403).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    try {
        // Verifikasi keaslian kunci token menggunakan JWT_SECRET server STB Anda
        const decoded = jwt.verify(pureToken, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user terverifikasi ke dalam request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Sesi habis atau token tidak valid.' });
    }
};
