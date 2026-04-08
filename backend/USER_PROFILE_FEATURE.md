# User Profile Feature Documentation

## Deskripsi Fitur
Fitur user profile memungkinkan psikolog untuk mengubah profil mereka dengan animasi yang menarik. Ketika cursor diarahkan ke bagian user di sidebar, akan muncul animasi. Ketika diklik, akan tampil modal yang berisi form untuk edit nama dan upload foto profil.

## Komponen yang Ditambahkan

### 1. **ProfileController** (`app/Http/Controllers/ProfileController.php`)
Controller yang menangani:
- `show()`: Mengambil data profil user saat ini (API endpoint)
- `update()`: Memperbarui nama dan foto profil user

**Routes:**
- `GET /api/profile` - Mengambil data profil user
- `POST /api/profile/update` - Memperbarui profil user

### 2. **User Profile Modal Component** (`resources/views/components/user-profile-modal.blade.php`)
Komponen view yang berisi:
- Modal dengan animasi slide down dari atas
- Form untuk edit nama lengkap
- Upload foto profil dengan preview
- Menampilkan username, email, dan role (read-only)
- Tombol Batal dan Simpan

**Fitur animasi:**
- Slide down animation saat modal muncul
- Hover effect pada foto profil
- Smooth transitions pada semua elemen

### 3. **Updated Home View** (`resources/views/home.blade.php`)
Pembaruan pada sidebar user section:
- User section dengan hover animation
- Skala dan efek visual saat hover
- Icon edit (✏️) muncul saat hover
- Menggunakan class `.user-section` untuk styling

### 4. **Updated User Model** (`app/Models/User.php`)
Menambahkan `profile_photo` ke dalam `$fillable` array untuk mass assignment

### 5. **Database Migration** (`database/migrations/2025_12_16_000000_add_profile_photo_to_users.php`)
Menambahkan kolom `profile_photo` ke tabel `users`

## Cara Penggunaan

### Untuk Psikolog:
1. **Hover pada user section** di sidebar - akan melihat animasi scale dan efek visual
2. **Klik user section** - modal akan muncul dengan animasi slide down
3. **Edit nama** - ubah nama lengkap di form
4. **Upload foto** - klik icon kamera untuk memilih foto dari perangkat
5. **Simpan** - klik tombol "Simpan Perubahan"
6. **Tutup modal** - klik tombol "Batal", icon X, atau Escape key

### Untuk Developers:
```php
// Mengambil profil user
GET /api/profile

// Memperbarui profil user
POST /api/profile/update
- name: string (optional)
- profile_photo: file (optional, image max 2MB)
```

## Styling & Animasi

### Hover Animation pada User Section:
- Scale: 1.08x
- Brightness: +5%
- Border pada foto berubah menjadi pink (#FF6FA3)
- Foto di-scale 1.12x
- Icon edit (✏️) muncul dengan animasi

### Modal Animation:
- Slide down dari atas dengan duration 0.4s
- Opacity fade in
- Overlay dengan background dark semi-transparent

### Form Transitions:
- Border color change on focus: #E8E8E8 → #FF6FA3
- Background color change on focus: #fff → #FFF9FB
- Button hover effects

## Validasi

### Server-side (Controller):
- `name`: string, max 255 characters
- `profile_photo`: image file (jpeg, png, jpg, gif), max 2MB

### Client-side (JavaScript):
- File preview sebelum upload
- Error handling untuk server responses
- Success message dengan auto-redirect setelah 1.5 detik

## Storage

Foto profil disimpan di:
`storage/app/public/profile-photos/`

Akses foto via:
`/storage/profile-photos/{filename}`

## Catatan Penting

✓ Fitur ini khusus untuk psikolog (dapat diakses oleh semua authenticated users)
✓ Menggunakan CSRF token untuk keamanan
✓ File lama akan dihapus otomatis saat upload foto baru
✓ Modal responsive untuk mobile devices
✓ Validasi input baik client-side maupun server-side

## Troubleshooting

Jika foto tidak muncul:
1. Jalankan: `php artisan storage:link`
2. Pastikan folder `storage/app/public` accessible

Jika update tidak bekerja:
1. Clear cache: `php artisan config:clear && php artisan cache:clear`
2. Check permissions: `chmod -R 755 storage/`
