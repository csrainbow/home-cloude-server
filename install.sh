#!/bin/bash

# 🖤 SKRIP INSTALLER ONE-CLICK HOME-CLOUDE UNTUK STB ARMBIAN 🖤
# Dioptimalkan penuh untuk akun csrainbow - Universal deployment

COLOR_GREEN='\033[0;32m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_CYAN}==================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}    ☁️  MEMULAI INSTALASI OTOMATIS HOME-CLOUDE  ☁️ ${COLOR_RESET}"
echo -e "${COLOR_CYAN}==================================================${COLOR_RESET}"

# 1. Pembaruan Paket Sistem Linux
echo -e "\n${COLOR_CYAN}[1/6] Memperbarui paket sistem repository...${COLOR_RESET}"
sudo apt update -y && sudo apt upgrade -y

# 2. Instalasi Node.js (Versi 18 LTS) & Git
echo -e "\n${COLOR_CYAN}[2/6] Memasang Node.js, NPM, dan Git...${COLOR_RESET}"
sudo apt install -y curl git
curl -fsSL https://nodesource.com | sudo -E bash -
sudo apt install -y nodejs

# 3. Pemasangan Pengendali Latar Belakang PM2 secara Global
echo -e "\n${COLOR_CYAN}[3/6] Memasang PM2 Process Manager...${COLOR_RESET}"
sudo npm install -y pm2 -g

# 4. Penarikan Source Code dari GitHub csrainbow
echo -e "\n${COLOR_CYAN}[4/6] Mengunduh source code HOME-CLOUDE dari GitHub...${COLOR_RESET}"
cd ~
rm -rf home-cloud-server 
git clone https://github.com home-cloud-server

# 5. Instalasi Seluruh Modul Dependensi Node.js
echo -e "\n${COLOR_CYAN}[5/6] Memasang modul Node.js dan pustaka pendukung...${COLOR_RESET}"
cd ~/home-cloud-server
npm install
npm install jszip
mkdir -p public
cp node_modules/jszip/dist/jszip.min.js public/

# 6. Konfigurasi Otomatis Jalur Harddisk Eksternal
echo -e "\n${COLOR_CYAN}[6/6] Melakukan konfigurasi gembok folder keamanan...${COLOR_RESET}"
read -p "Masukkan jalur mount-point Harddisk Anda (Contoh: /media/devmon/sda1): " HD_PATH

if [ -z "$HD_PATH" ]; then
    HD_PATH="./data"
fi

# Membuat berkas rahasia .env otomatis
cat << EOF > .env
PORT=3000
JWT_SECRET=HomeCloudSecureSuperSecretKey2026
UPLOAD_DIR=$HD_PATH
EOF

mkdir -p $HD_PATH
chmod -R 777 $HD_PATH

# 7. Menghidupkan Server Cloud via PM2
echo -e "\n${COLOR_GREEN}==================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}🎉 INSTALASI SELESAI! MENYALAKAN SERVER...${COLOR_RESET}"
echo -e "${COLOR_GREEN}==================================================${COLOR_RESET}"

pm2 start src/server.js --name "home-cloud"
pm2 startup
pm2 save

echo -e "\n${COLOR_CYAN}Aplikasi Cloud Anda kini aktif mengudara di jaringan lokal rumah!${COLOR_RESET}"
echo -e "Buka browser Anda dan akses ke alamat: ${COLOR_GREEN}http://IP_STB_ANDA:3000${COLOR_RESET}"
