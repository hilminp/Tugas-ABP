# Sistem Role dan Verifikasi User

## Fitur yang Ditambahkan

### 1. Pilihan Role saat Register
- Setelah klik register, user memilih antara **Psikolog** atau **Anonim**
- Route: `/register`

### 2. Register Psikolog
- Form register dengan tambahan upload file:
  - Email
  - Username
  - Password
  - Konfirmasi Password
  - **STR Psikolog** (PDF/JPG/PNG)
  - **Ijazah** (PDF/JPG/PNG)
- Setelah register, status `is_verified` = false
- Harus menunggu verifikasi admin sebelum bisa login
- Route: `/register/psikolog`

### 3. Register Anonim
- Form register standar (email, username, password, konfirmasi password)
- Setelah register, langsung `is_verified` = true
- Bisa langsung login
- Route: `/register/anonim`

### 4. Login dengan Verifikasi
- Psikolog yang belum diverifikasi tidak bisa login
- Akan muncul error: "Akun Anda belum diverifikasi oleh admin. Silakan tunggu konfirmasi."
- Anonim dan Psikolog terverifikasi bisa login normal

### 5. Pembatasan di Home
- User **Anonim**: Tidak ada fitur posting (hanya melihat feed dan kirim pesan)
- User **Psikolog**: Bisa posting dan semua fitur
- Muncul notifikasi info untuk user anonim di halaman home

## Database Schema

### Migration: `add_role_and_verification_to_users_table`

Kolom baru di tabel `users`:
- `role` - ENUM('anonim', 'psikolog') DEFAULT 'anonim'
- `is_verified` - BOOLEAN DEFAULT false
- `str_file` - VARCHAR nullable (path file STR Psikolog)
- `ijazah_file` - VARCHAR nullable (path file Ijazah)

## Cara Verifikasi Psikolog (untuk Admin)

Untuk verifikasi psikolog secara manual via database:

```sql
UPDATE users SET is_verified = 1 WHERE id = [ID_PSIKOLOG] AND role = 'psikolog';
```

Atau via tinker:
```php
php artisan tinker
$user = User::find(ID);
$user->is_verified = true;
$user->save();
```

## File Upload

File STR dan Ijazah disimpan di:
- `storage/app/public/str_files/`
- `storage/app/public/ijazah_files/`

Pastikan storage link sudah dibuat:
```bash
php artisan storage:link
```

## Testing

1. **Test Register Psikolog:**
   - Kunjungi `/register`
   - Pilih "Psikolog"
   - Isi form dan upload file
   - Coba login → harus gagal dengan pesan "belum diverifikasi"
   - Verifikasi via database
   - Login lagi → berhasil

2. **Test Register Anonim:**
   - Kunjungi `/register`
   - Pilih "Anonim"
   - Isi form
   - Login → berhasil langsung
   - Di home page → muncul notifikasi tidak bisa posting

## Routes

```php
GET  /register                    # Pilih role
GET  /register/psikolog           # Form register psikolog
POST /register/psikolog           # Submit register psikolog
GET  /register/anonim             # Form register anonim
POST /register/anonim             # Submit register anonim
POST /login                       # Login (dengan verifikasi check)
GET  /home                        # Home (dengan pembatasan anonim)
```

## Session Variables

Setelah login berhasil:
- `user_id` - ID user
- `user_name` - Nama user
- `user_role` - Role user ('anonim' atau 'psikolog')
