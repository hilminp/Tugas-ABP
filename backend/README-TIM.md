# 🚀 Laravel Project - Panduan untuk Tim

## Cara Menjalankan Project Ini

### ⚡ Quick Setup (Windows)
```bash
# 1. Clone repository
git clone [url-repository]
cd [nama-folder]

# 2. Jalankan setup otomatis (PowerShell)
copy .env.example .env
php artisan key:generate
type NUL > database\database.sqlite
php artisan migrate
npm install
npm run build
php artisan serve
```

### 📋 Setup Manual (Detail)
Lihat file `SETUP.md` untuk panduan lengkap.

## 🔐 Informasi Keamanan

### File Penting yang TIDAK di-upload ke Git:
- `.env` - File konfigurasi (rahasia)
- `database/database.sqlite` - Database lokal
- `vendor/` - Dependencies PHP
- `node_modules/` - Dependencies JavaScript

### File yang BISA di-upload ke Git:
- `.env.example` - Template konfigurasi (aman)
- Semua file kode di folder `app/`, `resources/`, `routes/`, dll
- File migration di `database/migrations/`

## 📝 Catatan untuk Developer Baru

1. **Copy `.env.example` menjadi `.env`**
2. **Generate app key** dengan `php artisan key:generate`
3. **Setup database** sesuai kebutuhan
4. **Jalankan migrasi** dengan `php artisan migrate`

## 🛠️ Perintah Penting

```bash
# Development
php artisan serve          # Jalankan server
npm run dev               # Watch assets
npm run build             # Build production assets

# Database
php artisan migrate        # Jalankan migrasi
php artisan migrate:refresh  # Reset & migrate ulang
php artisan db:seed       # Seed database

# Cache
php artisan config:clear  # Clear config cache
php artisan cache:clear   # Clear application cache
php artisan view:clear    # Clear view cache
```

## 🆘 Troubleshooting

Jika menemui error:
1. Clear cache: `php artisan config:clear`
2. Re-install dependencies: `composer install && npm install`
3. Check file `.env` sudah benar
4. Pastikan database file ada (untuk SQLite)

## 📞 Butuh Bantuan?
- Check dokumentasi: [Laravel Docs](https://laravel.com/docs)
- Tanya di grup developer
- Buat issue di repository

---
**Happy coding!** 🎉