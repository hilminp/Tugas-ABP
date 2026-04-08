<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Psikolog - Curhatin</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; font-family: 'Poppins', sans-serif; background: #FFF8EE; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .card { width: 980px; max-width: 100%; background: #FFF; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
        .left { background: #FDF9F0; padding: 40px 48px; display: flex; align-items: center; }
        .right { background: #FFF; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .logo-box { width: 320px; height: 320px; background: #FFF; border-radius: 32px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
        .logo-shape { width: 280px; height: 240px; display: flex; align-items: center; justify-content: center; }
        .logo-shape img { width: 100%; height: 100%; object-fit: contain; }
        .form { width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; background: #FFF; border-radius: 16px; box-shadow: 0 0 10px rgba(0,0,0,0.08); padding: 28px; max-height: 85vh; overflow-y: auto; }
        .title { font-weight: 700; font-size: 28px; color: #BE5985; text-align: center; margin-bottom: 8px; }
        .subtitle { font-size: 13px; color: #666; text-align: center; margin-bottom: 16px; }
        .label { font-size: 14px; color: #222; margin-top: 12px; margin-bottom: 6px; }
        .input { width: 100%; border: none; border-radius: 18px; padding: 12px 14px; font-size: 15px; outline: none; background: #D9D9D9; }
        .file-input { width: 100%; border: 2px dashed #BE5985; border-radius: 12px; padding: 12px; font-size: 14px; background: #FDF9F0; cursor: pointer; }
        .button { width: 100%; margin-top: 18px; background: #FF0B55; color: #FFF; border: none; border-radius: 24px; padding: 12px 16px; font-weight: 700; cursor: pointer; transition: transform .2s ease, opacity .2s ease; }
        .button:hover { transform: scale(1.02); opacity: 0.95; }
        .back { display: block; text-align: center; margin-top: 14px; color: #BE5985; text-decoration: none; font-weight: 500; }
        .error { color: red; font-size: 12px; margin-top: 4px; }
        @media (max-width: 900px) { .card { grid-template-columns: 1fr; } .right { padding: 24px; } .logo-box { width: 260px; height: 260px; } }
    </style>
</head>
<body>
    <div class="page">
        <div class="card">
            <div class="left">
                <form class="form" method="POST" action="{{ route('register.psikolog.post') }}" enctype="multipart/form-data">
                    @csrf
                    <div class="title">Register Psikolog</div>
                    <div class="subtitle">Daftar sebagai psikolog profesional</div>
                    
                    @if($errors->any())
                        <div style="background: #ffebee; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                            @foreach($errors->all() as $error)
                                <div class="error">{{ $error }}</div>
                            @endforeach
                        </div>
                    @endif
                    
                    <div class="label">Email</div>
                    <input class="input" type="email" name="email" placeholder="email@contoh.com" value="{{ old('email') }}" required>
                    
                    <div class="label">Username</div>
                    <input class="input" type="text" name="username" placeholder="username" value="{{ old('username') }}" required>
                    
                    <div class="label">Password</div>
                    <input class="input" type="password" name="password" placeholder="password" required>
                    
                    <div class="label">Konfirmasi Password</div>
                    <input class="input" type="password" name="password_confirmation" placeholder="konfirmasi password" required>
                    
                    <div class="label">STR Psikolog (PDF/JPG/PNG)</div>
                    <input class="file-input" type="file" name="str_file" accept=".pdf,.jpg,.jpeg,.png" required>
                    
                    <div class="label">Ijazah (PDF/JPG/PNG)</div>
                    <input class="file-input" type="file" name="ijazah_file" accept=".pdf,.jpg,.jpeg,.png" required>
                    
                    <button type="submit" class="button">Daftar Psikolog</button>
                    <a href="{{ route('register') }}" class="back">← Pilih Role Lain</a>
                </form>
            </div>
            <div class="right">
                <div class="logo-box">
                    <div class="logo-shape">
                        <img src="/images/pasted-image.png" alt="Curhatin Logo">
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
