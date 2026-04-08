# Panduan Sistem Notifikasi Admin untuk Verifikasi Psikolog

## Fitur Baru yang Ditambahkan

### 1. **Admin Dashboard dengan Notifikasi** 📊
- Dashboard khusus admin dengan statistik lengkap
- Notifikasi badge merah di sidebar menunjukkan jumlah psikolog pending
- Alert box warning jika ada psikolog menunggu verifikasi
- Statistik: Total User, Total Psikolog, Total Anonim, Pending Verifikasi

### 2. **Halaman Verifikasi Psikolog** ✅
- Daftar psikolog menunggu verifikasi dengan detail lengkap
- Tombol lihat dokumen (STR & Ijazah) dengan preview
- Tombol Verifikasi (hijau) dan Tolak (merah)
- Daftar psikolog yang sudah terverifikasi

### 3. **Halaman Kelola User** 👥
- Daftar semua user dengan role dan status verifikasi
- Badge notifikasi di menu jika ada pending verification
- Filter dan sorting user

### 4. **Login Redirect untuk Admin**
- Admin otomatis diarahkan ke `/admin/dashboard` setelah login
- User biasa tetap ke `/home`

---

## Routes Admin

```
GET  /admin/dashboard        # Dashboard admin
GET  /admin/verifications    # Halaman verifikasi psikolog
POST /admin/verify/{id}      # Approve psikolog
POST /admin/reject/{id}      # Reject & hapus akun psikolog
GET  /admin/users            # Kelola semua user
```

---

## Cara Testing

### Step 1: Buat User Admin

Jalankan command berikut untuk membuat admin atau update user existing jadi admin:

```bash
php artisan tinker
```

**Opsi A: Buat user admin baru**
```php
$admin = User::create([
    'name' => 'Admin',
    'username' => 'admin',
    'email' => 'admin@curhatin.com',
    'password' => Hash::make('admin123'),
    'role' => 'anonim',
    'is_verified' => true,
    'is_admin' => true
]);
exit
```

**Opsi B: Update user existing jadi admin**
```php
$user = User::where('email', 'EMAIL_USER_ANDA')->first();
$user->is_admin = true;
$user->save();
exit
```

### Step 2: Buat Psikolog Pending (untuk Testing Notifikasi)

1. Buka browser ke `http://localhost:8000/register`
2. Pilih **"Psikolog"**
3. Isi form dan upload file STR & Ijazah
4. Submit

### Step 3: Login sebagai Admin

1. Buka `http://localhost:8000/login`
2. Login dengan:
   - Email: `admin@curhatin.com`
   - Password: `admin123`
3. Anda akan **otomatis diarahkan** ke Admin Dashboard

### Step 4: Lihat Notifikasi

Di Admin Dashboard, Anda akan melihat:

✅ **Alert Box Kuning** (jika ada pending):
```
⚠️ Perhatian! Ada 1 psikolog menunggu verifikasi. Lihat sekarang
```

✅ **Badge Merah di Sidebar**:
```
✅ Verifikasi Psikolog [1]
```

✅ **Statistik Card**:
```
⏳ Menunggu Verifikasi
1
```

### Step 5: Verifikasi Psikolog

1. Klik **"Lihat sekarang"** di alert atau klik menu **"Verifikasi Psikolog"**
2. Lihat daftar psikolog pending
3. Klik tombol **"📄 STR"** atau **"📄 Ijazah"** untuk preview dokumen
4. Klik **"✓ Verifikasi"** untuk approve
5. Atau klik **"✗ Tolak"** untuk reject (akan menghapus akun)

### Step 6: Cek Notifikasi Hilang

- Badge di sidebar akan hilang/update
- Alert box akan hilang
- Counter di statistik berubah

---

## Screenshot Fitur

### 1. Admin Dashboard
```
📊 Dashboard Admin
------------------------------------------
⚠️ Ada 2 psikolog menunggu verifikasi

[👥 100]    [👨‍⚕️ 15]    [🙋 85]    [⏳ 2]
Total User   Psikolog    Anonim    Pending

📋 Psikolog Terbaru Menunggu Verifikasi
------------------------------------------
Nama      Email             Status      Aksi
Dr. John  john@test.com     [Menunggu]  [Lihat Detail]
Dr. Jane  jane@test.com     [Menunggu]  [Lihat Detail]
```

### 2. Sidebar dengan Notifikasi
```
🛡️ Admin Panel
admin@curhatin.com

📊 Dashboard
✅ Verifikasi Psikolog  [2] ← Badge merah
👥 Kelola User
🏠 Lihat sebagai User
```

### 3. Halaman Verifikasi
```
Verifikasi Psikolog
------------------------------------------
📋 Daftar Psikolog Menunggu Verifikasi

Nama      Email             Dokumen           Aksi
Dr. John  john@test.com    [📄 STR] [📄 Ijazah]  [✓ Verifikasi] [✗ Tolak]
```

---

## Session Variables

Setelah admin login:
```php
session('user_id')     // ID admin
session('user_name')   // Nama admin
session('user_role')   // 'anonim' atau 'psikolog'
session('is_admin')    // true
```

---

## Security

✅ **Protection di setiap route admin:**
```php
if (!session('user_id') || !session('is_admin')) {
    return redirect('/login');
}
```

✅ **Auto-redirect di login:**
- Admin → `/admin/dashboard`
- User biasa → `/home`

---

## Database Query untuk Notifikasi

```php
// Hitung pending
$pendingCount = User::where('role', 'psikolog')
                   ->where('is_verified', false)
                   ->count();

// Get pending list
$pendingPsikolog = User::where('role', 'psikolog')
                      ->where('is_verified', false)
                      ->latest()
                      ->get();
```

---

## Flow Lengkap

```
1. Psikolog Register + Upload Dokumen
   ↓
2. is_verified = false (pending)
   ↓
3. Admin Login → Auto ke Dashboard
   ↓
4. Dashboard menampilkan notifikasi:
   - Badge [2] di sidebar
   - Alert box warning
   - Statistik counter
   ↓
5. Admin klik "Verifikasi Psikolog"
   ↓
6. Lihat daftar pending + preview dokumen
   ↓
7. Admin klik "✓ Verifikasi"
   ↓
8. is_verified = true
   ↓
9. Notifikasi hilang/update
   ↓
10. Psikolog bisa login
```

---

## Troubleshooting

### Notifikasi tidak muncul?
Pastikan:
1. User admin sudah set `is_admin = true`
2. Ada psikolog dengan `is_verified = false`
3. Admin sudah login dan di `/admin/dashboard`

### File dokumen tidak bisa dibuka?
```bash
php artisan storage:link
```

### Admin tidak redirect ke dashboard?
Cek di routes `/login` POST:
```php
session(['is_admin' => $user->is_admin]);

if ($user->is_admin) {
    return redirect('/admin/dashboard');
}
```

---

## Keamanan File Upload

File STR dan Ijazah tersimpan di:
- `storage/app/public/str_files/`
- `storage/app/public/ijazah_files/`

Akses via:
- `http://localhost:8000/storage/str_files/filename.pdf`
- `http://localhost:8000/storage/ijazah_files/filename.pdf`

---

## Summary

✅ Admin Dashboard dengan notifikasi real-time
✅ Badge counter di sidebar
✅ Alert box warning untuk pending verification
✅ Halaman verifikasi lengkap dengan preview dokumen
✅ Approve/Reject psikolog
✅ Auto redirect admin setelah login
✅ Security protection di semua route admin

Sistem notifikasi admin sudah lengkap dan siap digunakan! 🚀
