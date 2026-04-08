<!DOCTYPE html>
<html lang="id">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Curhatin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; font-family: 'Poppins', sans-serif; background: #FFF8EE; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .card { width: 980px; max-width: 100%; background: #FFF; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
        .left { background: #FFF; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .logo-box { width: 320px; height: 320px; background: #FFF; border-radius: 32px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
        .logo-shape { width: 280px; height: 240px; display: flex; align-items: center; justify-content: center; }
        .logo-shape img { width: 100%; height: 100%; object-fit: contain; }
        .right { background: #FDF9F0; padding: 40px 48px; display: flex; align-items: center; }
        .form { width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; background: #FFF; border-radius: 16px; box-shadow: 0 0 10px rgba(0,0,0,0.08); padding: 28px; }
        .title { font-weight: 700; font-size: 28px; color: #BE5985; text-align: center; margin-bottom: 16px; }
        .label { font-size: 14px; color: #222; margin-top: 12px; margin-bottom: 6px; }
        .input { width: 100%; border: none; border-bottom: 2px solid #222; padding: 10px 0; font-size: 15px; outline: none; background: transparent; }
        .button { width: 100%; margin-top: 18px; background: #FF6FA3; color: #FFF; border: none; border-radius: 24px; padding: 12px 16px; font-weight: 700; cursor: pointer; transition: transform .2s ease, opacity .2s ease; }
        .button:hover { transform: scale(1.02); opacity: 0.95; }
        .back { display: block; text-align: center; margin-top: 14px; color: #BE5985; text-decoration: none; font-weight: 500; }
        @media (max-width: 900px) { .card { grid-template-columns: 1fr; } .left { padding: 24px; } .logo-box { width: 260px; height: 260px; } }
    </style>
    </head>
    <body>
        <div class="page">
            <div class="card">
                <div class="left">
                    <div class="logo-box">
                        <div class="logo-shape">
                            <img src="/images/pasted-image.png" alt="Curhatin Logo">
                        </div>
                    </div>
                </div>
                <div class="right">
                    <form class="form" method="post" action="{{ route('login.post') }}">
                        @csrf
                        <div class="title">Login</div>
                        
                        @if(session('success'))
                            <div style="background: #e6ffe6; padding: 12px; border-radius: 8px; margin-bottom: 12px; color: #006600; font-size: 14px;">
                                {{ session('success') }}
                            </div>
                        @endif
                        
                        @if($errors->any())
                            <div style="background: #ffebee; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                @foreach($errors->all() as $error)
                                    <div style="color: #c62828; font-size: 13px; margin-bottom: 4px;">{{ $error }}</div>
                                @endforeach
                            </div>
                        @endif
                        
                        <div class="label">Email</div>
                        <input class="input" type="email" name="email" placeholder="email" autocomplete="email" value="{{ old('email') }}">
                        <div class="label">Password</div>
                        <input class="input" type="password" name="password" placeholder="password" autocomplete="current-password">
                        <button type="submit" class="button">Login</button>
                        <a href="{{ route('register') }}" class="back">Belum punya akun? Daftar</a>
                        <a href="{{ url('/') }}" class="back">Kembali</a>
                    </form>
                </div>
            </div>
        </div>
    </body>
</html>