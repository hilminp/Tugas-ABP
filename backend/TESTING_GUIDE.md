# Testing Role & Verification System

## Setup Awal

1. Jalankan migration:
```bash
php artisan migrate
```

2. Pastikan storage link sudah dibuat:
```bash
php artisan storage:link
```

3. Start server:
```bash
php artisan serve
```

## Test Case 1: Register sebagai Psikolog

### Langkah:
1. Buka browser ke `http://localhost:8000/register`
2. Klik card **"Psikolog"**
3. Isi form:
   - Email: `psikolog@test.com`
   - Username: `psikolog1`
   - Password: `password123`
   - Konfirmasi Password: `password123`
   - Upload STR Psikolog: pilih file PDF/JPG/PNG
   - Upload Ijazah: pilih file PDF/JPG/PNG
4. Klik **"Daftar Psikolog"**

### Expected Result:
- Redirect ke halaman login
- Muncul pesan sukses: "Registrasi berhasil! Akun Anda menunggu verifikasi admin..."

### Test Login (Belum Verified):
1. Login dengan `psikolog@test.com` / `password123`
2. **Expected**: Error muncul - "Akun Anda belum diverifikasi oleh admin. Silakan tunggu konfirmasi."

### Verifikasi Manual (Simulasi Admin):
```bash
php artisan tinker
```

Dalam tinker:
```php
$user = User::where('email', 'psikolog@test.com')->first();
$user->is_verified = true;
$user->save();
exit
```

### Test Login (Sudah Verified):
1. Login dengan `psikolog@test.com` / `password123`
2. **Expected**: Berhasil masuk ke home page
3. Tidak ada notifikasi pembatasan posting

---

## Test Case 2: Register sebagai Anonim

### Langkah:
1. Buka browser ke `http://localhost:8000/register`
2. Klik card **"Anonim"**
3. Isi form:
   - Email: `anonim@test.com`
   - Username: `anonim1`
   - Password: `password123`
   - Konfirmasi Password: `password123`
4. Klik **"Daftar Anonim"**

### Expected Result:
- Redirect ke halaman login
- Muncul pesan sukses: "Registrasi berhasil! Silakan login."

### Test Login:
1. Login dengan `anonim@test.com` / `password123`
2. **Expected**: Berhasil masuk LANGSUNG (tanpa verifikasi)

### Test Pembatasan di Home:
1. Setelah login sebagai anonim
2. **Expected**: 
   - Muncul box kuning dengan info: "Sebagai pengguna anonim, Anda tidak dapat membuat posting..."
   - Masih bisa lihat feed dari user lain
   - Masih bisa search user dan kirim message

---

## Test Case 3: Validasi Form

### Test 1: Email Duplikat
1. Coba register dengan email yang sudah ada
2. **Expected**: Error - "The email has already been taken"

### Test 2: Password Tidak Match
1. Password: `password123`
2. Konfirmasi: `password456`
3. **Expected**: Error - "The password confirmation does not match"

### Test 3: File Upload (Psikolog)
1. Coba submit tanpa upload STR atau Ijazah
2. **Expected**: Error - "The str file field is required"

### Test 4: Format File Salah
1. Upload file .txt atau .exe
2. **Expected**: Error - "The str file must be a file of type: pdf, jpg, jpeg, png"

---

## Verifikasi Database

Cek data di database:

```sql
-- Lihat semua user dengan role dan status verifikasi
SELECT id, username, email, role, is_verified, str_file, ijazah_file 
FROM users;

-- Verifikasi psikolog
UPDATE users 
SET is_verified = 1 
WHERE email = 'psikolog@test.com' AND role = 'psikolog';

-- Lihat file yang diupload
SELECT str_file, ijazah_file 
FROM users 
WHERE role = 'psikolog';
```

---

## File Locations

Uploaded files tersimpan di:
- `storage/app/public/str_files/`
- `storage/app/public/ijazah_files/`

Bisa diakses via:
- `http://localhost:8000/storage/str_files/filename.pdf`
- `http://localhost:8000/storage/ijazah_files/filename.pdf`

---

## Troubleshooting

### Error: "Class 'DB' not found"
Pastikan di `routes/web.php` ada:
```php
use Illuminate\Support\Facades\DB;
```

### Error: "Storage link not found"
Jalankan:
```bash
php artisan storage:link
```

### Error: "Column 'role' doesn't exist"
Jalankan migration:
```bash
php artisan migrate
```

### File upload tidak tersimpan
1. Cek permission folder `storage/`
2. Pastikan `storage/app/public/` ada
3. Jalankan `php artisan storage:link`

---

## Summary

✅ **Psikolog**: 
- Upload STR + Ijazah
- Harus diverifikasi admin
- Bisa posting setelah verified

✅ **Anonim**: 
- Form standar
- Langsung bisa login
- Tidak bisa posting (hanya lihat & message)

✅ **Login**: 
- Check verifikasi untuk psikolog
- Session simpan role user

✅ **Home Page**: 
- Notifikasi untuk user anonim
- Pembatasan fitur posting
