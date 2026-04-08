<!DOCTYPE html>
<html lang="id">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curhatin - Curhat Online Sekarang</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: 'Poppins', sans-serif;
            overflow-x: hidden;
        }
        
        .homepage {
            position: relative;
            width: 100%;
            min-height: 100vh;
            background: #FFFFFF;
        }
        
        /* Header */
        .header {
            position: relative;
            width: 100%;
            height: 125px;
            background: #FFB5E6;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 80px;
            z-index: 10;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .logo-circle {
            width: 71px;
            height: 61px;
            background: linear-gradient(0deg, rgba(255, 193, 218, 0.34), rgba(255, 193, 218, 0.34)), rgba(255, 144, 187, 0.97);
            border-radius: 50%;
        }
        
        .logo-text {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 500;
            font-size: 35px;
            line-height: 42px;
            color: #000000;
        }
        
        .header-center {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Open Sans';
            font-style: normal;
            font-weight: 400;
            font-size: 23px;
            line-height: 38px;
            text-align: center;
            color: #BE5985;
        }
        
        /* Main Content */
        .main-content-wrapper {
            position: relative;
            width: 100%;
            min-height: calc(100vh - 125px);
            background: #FF87AD;
            padding: 67px 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .main-content {
            position: relative;
            width: 1229px;
            max-width: calc(100% - 200px);
            min-height: 338px;
        }
        
        .content-card {
            position: relative;
            background: #FFFFFF;
            box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.4);
            border-radius: 10px;
            padding: 60px;
            display: flex;
            align-items: center;
            gap: 60px;
            min-height: 338px;
        }
        
        .heading-section {
            flex: 1;
            padding-right: 60px;
            border-right: 2px solid rgba(0, 0, 0, 0.1);
        }
        
        .heading-text {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 700;
            font-size: 52px;
            line-height: 73px;
            color: rgba(255, 11, 85, 0.97);
            width: 611.73px;
            max-width: 100%;
        }
        
        .auth-section {
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: flex-end;
            flex-shrink: 0;
            min-width: 300px;
            padding-left: 60px;
        }
        
        .btn-login, .btn-register {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 700;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-block;
            text-align: center;
        }
        
        .btn-login {
            font-size: 96px;
            line-height: 73px;
            color: #FF0B55;
            background: transparent;
            padding: 0;
        }
        
        .btn-login:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }
        
        .btn-register {
            font-size: 48px;
            line-height: 73px;
            color: rgba(255, 11, 85, 0.87);
            background: transparent;
            padding: 0;
        }
        
        .btn-register:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }
        
        .btn-dashboard {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 700;
            font-size: 48px;
            line-height: 73px;
            color: rgba(255, 11, 85, 0.87);
            text-decoration: none;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-block;
        }
        
        .btn-dashboard:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }
        
        @media (max-width: 1440px) {
            .main-content {
                width: calc(100% - 200px);
            }
        }
        
        @media (max-width: 768px) {
            .header {
                padding: 0 20px;
                flex-direction: column;
                height: auto;
                min-height: 125px;
            }
            
            .header-center {
                position: relative;
                left: 0;
                transform: none;
                margin-top: 10px;
            }
            
            .content-card {
                flex-direction: column;
                padding: 40px 20px;
            }
            
            .heading-section {
                padding-right: 0;
                padding-bottom: 30px;
                border-right: none;
                border-bottom: 2px solid rgba(0, 0, 0, 0.1);
            }
            
            .auth-section {
                padding-left: 0;
                padding-top: 30px;
                align-items: center;
                width: 100%;
            }
            
            .heading-text {
                font-size: 32px;
                line-height: 42px;
            }
            
            .btn-login {
                font-size: 64px;
            }
            
            .btn-register {
                font-size: 36px;
            }
        }
            </style>
    </head>
<body>
    <div class="homepage">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <div class="logo-circle"></div>
                <div class="logo-text">Curhatin</div>
            </div>
            <div class="header-center">
                Curhat Online Sekarang
            </div>
        </header>

        <!-- Main Content -->
        <div class="main-content-wrapper">
            <div class="main-content">
                <div class="content-card">
                    <div class="heading-section">
                        <h1 class="heading-text">
                            Kamu nggak sendirian koq, silahkan curhat disini, gratis.
                        </h1>
                    </div>
                    <div class="auth-section">
            @if (Route::has('login'))
                    @auth
                                <a href="{{ url('/dashboard') }}" class="btn-dashboard">Dashboard</a>
                    @else
                                <a href="{{ route('login') }}" class="btn-login">login</a>
                        @if (Route::has('register'))
                                    <a href="{{ route('register') }}" class="btn-register">register</a>
                                @else
                                    <a href="{{ url('/register') }}" class="btn-register">register</a>
                                @endif
                            @endauth
                        @else
                            <a href="{{ url('/login') }}" class="btn-login">login</a>
                            <a href="{{ url('/register') }}" class="btn-register">register</a>
                        @endif
                    </div>
                </div>
                </div>
        </div>
    </div>
    </body>
</html>

