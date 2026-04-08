# 🚀 Setup Project Laravel untuk Tim

## Langkah-langkah Setup

### 1. Clone Repository
```bash
git clone [url-repository]
cd [nama-folder]
```

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Setup Environment
```bash
# Copy dari template
cp .env.example .env

# Generate app key
php artisan key:generate
```

### 4. Setup Database

#### Untuk SQLite (Default):
```bash
# Buat file database (untuk SQLite)
touch database/database.sqlite

# Jalankan migrasi
php artisan migrate
```

#### Untuk MySQL:
```bash
# Pastikan MySQL sudah berjalan
# Buat database 'laravel_app' di MySQL
# Update .env dengan konfigurasi MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel_app
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrasi
php artisan migrate
```

### 5. Build Assets
```bash
npm run build
# atau untuk development
npm run dev
```

### 6. Jalankan Server
```bash
php artisan serve
```

## 🔐 Informasi Penting untuk Tim

### Environment Variables Wajib
Pastikan `.env` berisi:
- `APP_KEY=` (akan digenerate otomatis)
- `DB_CONNECTION=sqlite` (atau sesuai kebutuhan)
- `SESSION_DRIVER=file` (untuk development)

### File yang Tidak Di-track di Git
- `.env` (file rahasia)
- `vendor/` (dependencies PHP)
- `node_modules/` (dependencies JS)
- `storage/logs/*` (log files)
- `database/database.sqlite` (database lokal)

### Troubleshooting
Jika ada error:
1. Clear cache: `php artisan config:clear`
2. Clear compiled: `php artisan clear-compiled`
3. Re-autoload: `composer dump-autoload`

## 📋 Checklist untuk Developer Baru
- [ ] PHP 8.2+ terinstall
- [ ] Composer terinstall
- [ ] Node.js 18+ terinstall
- [ ] Git terinstall
- [ ] Database setup (SQLite/MySQL/PostgreSQL)