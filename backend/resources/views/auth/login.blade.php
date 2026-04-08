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
        html, body { width: 100%; height: 100%; font-family: 'Poppins', sans-serif; background: linear-gradient(180deg, #FFB7DA 0%, #FF8CBF 40%, #FF74AD 65%, #FF5E99 100%); }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }
        .card { width: 980px; max-width: 100%; background: #FFFFFF; border-radius: 24px; box-shadow: 0 22px 60px rgba(255, 90, 150, 0.32); display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
        .left { background: radial-gradient(circle at 40% 30%, rgba(255, 220, 236, 0.25), transparent 50%), #FFFFFF; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .logo-box { width: 400px; height: 400px; background: #FFFFFF; border-radius: 40px; box-shadow: 0 36px 80px rgba(255, 90, 150, 0.25), inset 0 0 0 1px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; }
        .logo-shape { width: 260px; height: 200px; display: flex; align-items: center; justify-content: center; }
        .logo-shape img { width: 100%; height: 100%; object-fit: contain; }
        .right { background: #FFFFFF; padding: 40px 48px; display: flex; align-items: center; border-left: 2px solid rgba(255, 90, 150, 0.16); }
        .form { width: 100%; max-width: 420px; margin-left: auto; margin-right: auto; background: #FFFFFF; border-radius: 16px; box-shadow: 0 14px 32px rgba(255, 90, 150, 0.16); padding: 28px; border: 1px solid rgba(255, 90, 150, 0.08); }
        .title { font-weight: 700; font-size: 28px; color: #F07EAB; text-align: center; margin-bottom: 16px; }
        .label { font-size: 14px; color: #3A2C32; margin-top: 14px; margin-bottom: 8px; }
        .input-wrap { display: flex; align-items: center; gap: 10px; border-bottom: 1.5px solid #E8D6CF; padding: 6px 0 8px; }
        .input-wrap:focus-within { border-bottom-color: #F07EAB; }
        .input-wrap.error { border-bottom-color: #E74C3C; }
        .input-icon { width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; color: #F0679F; }
        .input { width: 100%; border: none; padding: 8px 0 6px; font-size: 15px; outline: none; background: transparent; color: #3A2C32; }
        .input:focus { border: none; }
        .error-text { color: #E74C3C; font-size: 12px; margin-top: 4px; }
        .button { width: 100%; margin-top: 22px; background: linear-gradient(135deg, #F78BB8 0%, #F0679F 100%); color: #FFF; border: none; border-radius: 24px; padding: 12px 16px; font-weight: 700; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; box-shadow: 0 8px 18px rgba(240, 103, 159, 0.2); }
        .button:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(240, 103, 159, 0.24); }
        .back { display: block; text-align: center; margin-top: 14px; color: #F0679F; text-decoration: none; font-weight: 500; }
        .error-box { background: #FDE8E8; border-left: 4px solid #E74C3C; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
        .error-title { color: #C0392B; font-weight: 600; margin-bottom: 6px; }
        .error-msg { color: #A93226; font-size: 14px; line-height: 1.5; }
        .error-reason { background: #fff; padding: 8px; border-radius: 4px; margin-top: 8px; font-style: italic; border-left: 2px solid #E74C3C; padding-left: 12px; }
        @media (max-width: 900px) {
            .card { grid-template-columns: 1fr; }
            .left { padding: 24px; }
            .logo-box { width: 320px; height: 320px; }
            .logo-shape { width: 220px; height: 170px; }
            .right { border-left: none; border-top: 1px solid rgba(255, 90, 150, 0.16); padding-top: 28px; }
        }
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
                    <form class="form" id="login-form" method="POST" action="{{ url('/login') }}">
                        @csrf
                        <div class="title">Login</div>
                        @if(session('success'))
                            <div style="background:#E8F8F5;border-left:4px solid #27AE60;padding:12px;border-radius:6px;margin-bottom:16px;color:#196F3D;font-weight:600;">✓ {{ session('success') }}</div>
                        @endif
                        @if ($errors->any())
                            <div class="error-box">
                                @foreach ($errors->all() as $error)
                                    @if(strpos($error, 'disuspend') !== false || strpos($error, 'suspended') !== false)
                                        <div class="error-title">⚠️ Akun Anda Disuspend</div>
                                        <div class="error-msg">{{ $error }}</div>
                                    @else
                                        <div class="error-msg">{{ $error }}</div>
                                    @endif
                                @endforeach
                            </div>
                        @endif
                        <div class="label">Email</div>
                        <div class="input-wrap" id="email-wrap">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 6C3.44772 6 3 6.44772 3 7V17C3 17.5523 3.44772 18 4 18H20C20.5523 18 21 17.5523 21 17V7C21 6.44772 20.5523 6 20 6H4ZM19.2 7L12 11.4L4.8 7H19.2ZM5 8.2L12 12.6L19 8.2V16.5H5V8.2Z"/>
                                </svg>
                            </span>
                            <input class="input" id="email" type="email" name="email" placeholder="email" autocomplete="email" required aria-describedby="email-error">
                        </div>
                        <div class="error-text" id="email-error" aria-live="polite"></div>
                        <div class="label">Password</div>
                        <div class="input-wrap" id="password-wrap">
                            <span class="input-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10H18C18.5523 10 19 10.4477 19 11V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V11C5 10.4477 5.44772 10 6 10H7ZM9 10H15V7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V10ZM7 12V19H17V12H7ZM12 14C12.5523 14 13 14.4477 13 15V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V15C11 14.4477 11.4477 14 12 14Z"/>
                                </svg>
                            </span>
                            <input class="input" id="password" type="password" name="password" placeholder="password" autocomplete="current-password" required aria-describedby="password-error">
                        </div>
                        <div class="error-text" id="password-error" aria-live="polite"></div>
                        <button type="submit" class="button">Login</button>
                        <a href="{{ url('/register') }}" class="back">Belum punya akun? Register</a>
                    </form>
                </div>
            </div>
        </div>

        <script>
        (function() {
            const form = document.getElementById('login-form');
            if (!form) return;
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-error');
            const emailWrap = document.getElementById('email-wrap');
            const passwordWrap = document.getElementById('password-wrap');

            function clearError(elWrap, elError) {
                if (elWrap) elWrap.classList.remove('error');
                if (elError) elError.textContent = '';
            }

            function setError(elWrap, elError, message) {
                if (elWrap) elWrap.classList.add('error');
                if (elError) elError.textContent = message;
            }

            form.addEventListener('submit', function(e) {
                let hasError = false;
                clearError(emailWrap, emailError);
                clearError(passwordWrap, passwordError);

                if (emailInput && !emailInput.value.trim()) {
                    hasError = true;
                    setError(emailWrap, emailError, 'Email wajib diisi.');
                }
                if (passwordInput && !passwordInput.value.trim()) {
                    hasError = true;
                    setError(passwordWrap, passwordError, 'Password wajib diisi.');
                }

                if (hasError) {
                    e.preventDefault();
                }
            });

            if (emailInput) {
                emailInput.addEventListener('input', () => clearError(emailWrap, emailError));
            }
            if (passwordInput) {
                passwordInput.addEventListener('input', () => clearError(passwordWrap, passwordError));
            }
        })();
        </script>
    </body>
</html>