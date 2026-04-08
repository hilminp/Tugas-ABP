<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pilih Role - Curhatin</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; font-family: 'Poppins', sans-serif; background: #FFF8EE; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .container { width: 100%; max-width: 900px; text-align: center; }
        .title { font-size: 36px; font-weight: 700; color: #BE5985; margin-bottom: 16px; }
        .subtitle { font-size: 18px; color: #555; margin-bottom: 48px; }
        .role-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .role-card { background: #FFF; border-radius: 24px; padding: 48px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; text-decoration: none; color: inherit; display: block; }
        .role-card:hover { transform: translateY(-8px); box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
        .role-icon { font-size: 72px; margin-bottom: 24px; }
        .role-name { font-size: 28px; font-weight: 700; color: #BE5985; margin-bottom: 12px; }
        .role-desc { font-size: 15px; color: #666; line-height: 1.6; }
        .back { display: inline-block; margin-top: 32px; color: #BE5985; text-decoration: none; font-weight: 600; font-size: 16px; }
        @media (max-width: 768px) { .role-cards { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <h1 class="title">Pilih Jenis Akun Anda</h1>
            <p class="subtitle">Silakan pilih apakah Anda ingin mendaftar sebagai Psikolog atau pengguna Anonim</p>
            
            <div class="role-cards">
                <a href="{{ route('register.psikolog') }}" class="role-card">
                    <div class="role-icon">👨‍⚕️</div>
                    <div class="role-name">Psikolog</div>
                    <div class="role-desc">
                        Daftar sebagai psikolog profesional. Anda perlu mengunggah STR Psikolog dan Ijazah untuk verifikasi.
                    </div>
                </a>
                
                <a href="{{ route('register.anonim') }}" class="role-card">
                    <div class="role-icon">🙋</div>
                    <div class="role-name">Anonim</div>
                    <div class="role-desc">
                        Daftar sebagai pengguna anonim untuk berbagi cerita dan mendapat dukungan dari komunitas.
                    </div>
                </a>
            </div>
            
            <a href="{{ url('/') }}" class="back">← Kembali ke Beranda</a>
        </div>
    </div>
</body>
</html>
