<!DOCTYPE html>
<html lang="id">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Curhatin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; font-family: 'Poppins', sans-serif; background: #FFF8EE; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .card { width: 980px; max-width: 100%; background: #FFF; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
        .left { background: #FDF9F0; padding: 40px 48px; display: flex; align-items: center; }
        .right { background: #FFF; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .logo-box { width: 320px; height: 320px; background: #FFF; border-radius: 32px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
        .logo-shape { width: 200px; height: 160px; background: radial-gradient(closest-side, #FF9CC0 0%, #FF6FA3 60%, #FF6FA3 100%); border-radius: 120px 120px 80px 80px; transform: rotate(-20deg); position: relative; }
        .logo-shape::after { content: ""; position: absolute; width: 200px; height: 160px; background: radial-gradient(closest-side, #FF9CC0 0%, #FF6FA3 60%, #FF6FA3 100%); border-radius: 120px 120px 80px 80px; transform: rotate(40deg); left: 0; top: 0; opacity: 0.9; }
        .form { width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; background: #FFF; border-radius: 16px; box-shadow: 0 0 10px rgba(0,0,0,0.08); padding: 28px; }
        .title { font-weight: 700; font-size: 28px; color: #BE5985; text-align: center; margin-bottom: 16px; }
        .label { font-size: 14px; color: #222; margin-top: 12px; margin-bottom: 6px; }
        .input { width: 100%; border: none; border-radius: 18px; padding: 12px 14px; font-size: 15px; outline: none; background: #D9D9D9; }
        .button { width: 100%; margin-top: 18px; background: #FF0B55; color: #FFF; border: none; border-radius: 24px; padding: 12px 16px; font-weight: 700; cursor: pointer; transition: transform .2s ease, opacity .2s ease; }
        .button:hover { transform: scale(1.02); opacity: 0.95; }
        .back { display: block; text-align: center; margin-top: 14px; color: #BE5985; text-decoration: none; font-weight: 500; }
        @media (max-width: 900px) { .card { grid-template-columns: 1fr; } .right { padding: 24px; } .logo-box { width: 260px; height: 260px; } }
    </style>
    </head>
    <body>
        <div class="page">
            <div class="card">
                <div class="left">
                    <form class="form" method="post" action="{{ route('register.post') }}">
                        @csrf
                        <div class="title">Register</div>
                        <div class="label">Email</div>
                        <input class="input" type="email" name="email" placeholder="email" autocomplete="email">
                        <div class="label">Username</div>
                        <input class="input" type="text" name="username" placeholder="username" autocomplete="username">
                        <div class="label">Password</div>
                        <input class="input" type="password" name="password" placeholder="password" autocomplete="new-password">
                        <button type="submit" class="button">Create Account</button>
                        <a href="{{ url('/') }}" class="back">Kembali</a>
                    </form>
                </div>
                <div class="right">
                    <div class="logo-box">
                        <div class="logo-shape"></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>