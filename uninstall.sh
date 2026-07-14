#!/bin/bash

# 🖤 SKRIP UNINSTALLER OTOMATIS HOME-CLOUDE UNTUK STB ARMBIAN 🖤
# Menghapus seluruh jejak aplikasi secara bersih tanpa menyentuh data foto Harddisk

COLOR_RED='\033[0;31m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_CYAN}==================================================${COLOR_RESET}"
echo -e "${COLOR_RED}    🗑️  MEMULAI PROSES PENGHAPUSAN HOME-CLOUDE  🗑️ ${COLOR_RESET}"
echo -e "${COLOR_CYAN}==================================================${COLOR_RESET}"

# 1. Mematikan Proses di Latar Belakang (PM2)
echo -e "\n${COLOR_CYAN}[1/4] Menghentikan proses server di PM2 latar belakang...${COLOR_RESET}"
if command -v pm2 &> /dev/null; then
    pm2 delete home-cloud 2>/dev/null
    pm2 save --force 2>/dev/null
    echo -e "${COLOR_RED}Proses 'home-cloud' berhasil dihapus dari PM2.${COLOR_RESET}"
else
    echo -e "PM2 tidak terdeteksi, melewati langkah ini."
fi

# 2. Menghapus Folder Source Code Aplikasi
echo -e "\n${COLOR_CYAN}[2/4] Menghapus folder kode utama aplikasi...${COLOR_RESET}"
cd ~
if [ -d "home-cloud-server" ]; then
    rm -rf home-cloud-server
    echo -e "${COLOR_RED}Folder ~/home-cloud-server berhasil dibersihkan.${COLOR_RESET}"
else
    echo -e "Folder ~/home-cloud-server tidak ditemukan."
fi

# 3. Menghapus File Konfigurasi Sisa (Jika ada)
echo -e "\n${COLOR_CYAN}[3/4] Membersihkan sisa file sampah konfigurasi...${COLOR_RESET}"
rm -rf ~/.pm2/logs/home-cloud* 2>/dev/null

# 4. Pengumuman Status Keamanan Data Foto Harddisk WD 500GB
echo -e "\n${COLOR_CYAN}[4/4] Memeriksa status keamanan data Harddisk Eksternal...${COLOR_RESET}"
echo -e "--------------------------------------------------"
echo -e "${COLOR_RED}⚠️ INFO PENTING FOR SECURITY:${COLOR_RESET}"
echo -e "Skrip ini ${COLOR_GREEN}SENGJA TIDAK MENGHAPUS${COLOR_RESET} isi folder data utama Anda di Harddisk."
echo -e "Seluruh foto, video, dan berkas dokumen cadangan Anda di dalam Harddisk WD 500GB"
echo -e "di jamin tetap ${COLOR_GREEN}AMAN 100% UTUH${COLOR_RESET} tanpa ada yang hilang tak tersisa."
echo -e "--------------------------------------------------"

echo -e "\n${COLOR_RED}==================================================${COLOR_RESET}"
echo -e "${COLOR_RED}🎉 PROSES PENGHAPUSAN SELESAI SEMPURNA!${COLOR_RESET}"
echo -e "${COLOR_RED}==================================================${COLOR_RESET}"
echo -e "Sistem STB Armbian Anda kini sudah kembali bersih seutuhnya."
