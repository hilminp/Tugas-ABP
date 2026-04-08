# 🔧 Setup MySQL untuk Laravel

## Option 1: XAMPP (Recommended)

### 1. Download & Install XAMPP
- Download: https://www.apachefriends.org/
- Install di `C:\xampp`

### 2. Start MySQL
- Buka XAMPP Control Panel
- Klik "Start" pada MySQL
- MySQL akan berjalan di port 3306

### 3. Buat Database
- Buka browser: http://localhost/phpmyadmin
- Klik "New" di sidebar kiri
- Nama database: `laravel_app`
- Klik "Create"

### 4. Update .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_app
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Test Koneksi
```bash
php artisan migrate
```

---

## Option 2: MySQL Installer (Official)

### 1. Download MySQL Installer
- Download: https://dev.mysql.com/downloads/installer/
- Pilih "MySQL Installer for Windows"

### 2. Install MySQL Server
- Pilih "Server only" atau "Developer Default"
- Setup password untuk root user
- Ingat password yang dibuat!

### 3. Buat Database
```sql
-- Buka MySQL Command Line Client
CREATE DATABASE laravel_app;
```

### 4. Update .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_app
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

---

## Option 3: Laragon (Alternatif Ringan)

### 1. Download Laragon
- Download: https://laragon.org/
- Install dan jalankan

### 2. Start MySQL
- Klik "Start All" di Laragon
- MySQL otomatis berjalan

### 3. Buat Database
- Klik "Database" di Laragon
- Buat database `laravel_app`

---

## 🔍 Troubleshooting

### Error: "No connection could be made"
**Solusi:**
1. Pastikan MySQL service berjalan
2. Cek port 3306 tidak dipakai aplikasi lain
3. Cek firewall tidak memblokir port 3306

### Error: "Access denied for user"
**Solusi:**
1. Cek username & password di .env
2. Pastikan user punya akses ke database
3. Coba reset password MySQL root

### Error: "Database not found"
**Solusi:**
1. Buat database dulu di phpMyAdmin
2. Pastikan nama database sesuai di .env

## ✅ Verifikasi Koneksi

Setelah setup, test dengan:
```bash
php artisan migrate
php artisan tinker
>>> DB::connection()->getPdo();
```

Jika berhasil, tidak akan ada error! 🎉