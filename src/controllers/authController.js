const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersFile = path.join(__dirname, '../../users.json');

// Membaca daftar user dari file json
const getUsers = () => {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
};

// Menyimpan daftar user ke file json
const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// LOGIKA DAFTAR AKUN BARU
exports.register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Data tidak lengkap.' });

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    saveUsers(users);

    // Otomatis buatkan folder terisolasi di harddisk untuk user baru ini
    const userFolder = path.join(process.env.UPLOAD_DIR || './data', username);
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
        fs.chmodSync(userFolder, 0o777);
    }

    res.status(201).json({ message: 'Registrasi berhasil!' });
};

// LOGIKA LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Username atau password salah.' });
    }

    // Membuat token sesi berlaku selama 30 hari
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, username });
};
