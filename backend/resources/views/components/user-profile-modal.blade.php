<!-- User Profile Modal Component -->
<div id="userProfileModal" class="user-profile-modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
        <button class="modal-close" onclick="closeUserProfile()">&times;</button>
        
        <div class="profile-header">
            <h2>Edit Profil</h2>
        </div>

        <form id="profileForm" enctype="multipart/form-data">
            @csrf
            
            <div class="profile-photo-section">
                <div class="photo-container">
                    <img id="profilePhotoPreview" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile Photo">
                    <label for="profilePhotoInput" class="photo-upload-btn">
                        <span>📷</span>
                    </label>
                    <input type="file" id="profilePhotoInput" name="profile_image" accept="image/*" hidden>
                </div>
                <p style="text-align:center; color:#999; font-size:13px; margin-top:8px;">Klik kamera untuk ubah foto</p>
            </div>

            <div class="form-group">
                <label for="usernameInput">Username</label>
                <input type="text" id="usernameInput" name="username" placeholder="Masukkan username" value="">
            </div>

            <div class="form-group">
                <label for="emailDisplay">Email (tidak bisa diubah)</label>
                <input type="email" id="emailDisplay" disabled placeholder="email" value="">
            </div>

            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeUserProfile()">Batal</button>
                <button type="submit" class="btn-save">Simpan Perubahan</button>
            </div>

            <div id="profileMessage" class="message" style="display:none; margin-top:16px;"></div>
        </form>
    </div>
</div>

<style>
    /* User Profile Modal */
    .user-profile-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
    }

    .user-profile-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }

    .modal-content {
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        padding: 40px;
        max-width: 500px;
        width: 90%;
        animation: slideDown 0.4s ease-out;
        position: relative;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-100px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #999;
        transition: color 0.2s;
    }

    .modal-close:hover {
        color: #BE5985;
    }

    .profile-header {
        margin-bottom: 24px;
    }

    .profile-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
    }

    .profile-photo-section {
        text-align: center;
        margin-bottom: 32px;
    }

    .photo-container {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 12px;
    }

    .photo-container img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #FFE4F0;
    }

    .photo-upload-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36px;
        height: 36px;
        background: #FF6FA3;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
        font-size: 18px;
    }

    .photo-upload-btn:hover {
        background: #BE5985;
        transform: scale(1.1);
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-weight: 600;
        font-size: 14px;
    }

    .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #E8E8E8;
        border-radius: 10px;
        font-size: 14px;
        font-family: 'Poppins', sans-serif;
        transition: border-color 0.2s;
        box-sizing: border-box;
    }

    .form-group input:focus {
        outline: none;
        border-color: #FF6FA3;
        background: #FFF9FB;
    }

    .form-group input:disabled {
        background: #F5F5F5;
        color: #999;
    }

    .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 28px;
    }

    .btn-cancel,
    .btn-save {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Poppins', sans-serif;
    }

    .btn-cancel {
        background: #F0F0F0;
        color: #666;
    }

    .btn-cancel:hover {
        background: #E0E0E0;
    }

    .btn-save {
        background: #FF6FA3;
        color: #fff;
    }

    .btn-save:hover {
        background: #BE5985;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 111, 163, 0.3);
    }

    .btn-save:active {
        transform: translateY(0);
    }

    .message {
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        text-align: center;
    }

    .message.success {
        background: #D4EDDA;
        color: #155724;
        border: 1px solid #C3E6CB;
    }

    .message.error {
        background: #F8D7DA;
        color: #721C24;
        border: 1px solid #F5C6CB;
    }

    /* Responsive */
    @media (max-width: 600px) {
        .modal-content {
            padding: 24px;
            width: 95%;
        }

        .profile-header h2 {
            font-size: 20px;
        }
    }
</style>

<script>
    // Load user profile saat modal dibuka
    function loadUserProfile() {
        fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            document.getElementById('usernameInput').value = data.username || '';
            document.getElementById('emailDisplay').value = data.email || '';
            
            // Load profile photo jika ada
            // Load profile photo jika ada - dengan cache busting
            if (data.profile_image) {
                const timestamp = new Date().getTime();
                const photoUrl = `/storage/${data.profile_image}?t=${timestamp}`;
                document.getElementById('profilePhotoPreview').src = photoUrl;
                
                // Update sidebar photo juga
                if (document.getElementById('sidebarUserPhoto')) {
                    document.getElementById('sidebarUserPhoto').src = photoUrl;
                }
            } else {
                // Fallback ke default image jika tidak ada foto
                document.getElementById('profilePhotoPreview').src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            const messageEl = document.getElementById('profileMessage');
            messageEl.className = 'message error';
            messageEl.textContent = error.message || 'Gagal memuat profil';
            messageEl.style.display = 'block';
        });
    }

    function openUserProfile() {
        loadUserProfile();
        document.getElementById('userProfileModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeUserProfile() {
        document.getElementById('userProfileModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Handle foto preview
    document.getElementById('profilePhotoInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profilePhotoPreview').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submit
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            const result = await response.json();
            const messageEl = document.getElementById('profileMessage');

            if (result.success) {
                messageEl.className = 'message success';
                messageEl.textContent = result.message;
                messageEl.style.display = 'block';
                
                // Update photo preview jika ada foto baru
                if (result.user.profile_image) {
                    const timestamp = new Date().getTime();
                    document.getElementById('profilePhotoPreview').src = `/storage/${result.user.profile_image}?t=${timestamp}`;
                    if (document.getElementById('sidebarUserPhoto')) {
                        document.getElementById('sidebarUserPhoto').src = `/storage/${result.user.profile_image}?t=${timestamp}`;
                    }
                }
                
                setTimeout(() => {
                    closeUserProfile();
                    location.reload();
                }, 1500);
            } else {
                messageEl.className = 'message error';
                messageEl.textContent = result.error || 'Gagal memperbarui profil';
                messageEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Error:', error);
            const messageEl = document.getElementById('profileMessage');
            messageEl.className = 'message error';
            messageEl.textContent = 'Terjadi kesalahan saat memperbarui profil: ' + error.message;
            messageEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Close modal when clicking overlay
    document.querySelector('.modal-overlay').addEventListener('click', closeUserProfile);

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUserProfile();
        }
    });
</script>
