<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Curhatin</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #FFF8EE; font-family: 'Poppins', sans-serif; }
        .sidebar { width: 240px; background: #2C3E50; height: 100vh; position: fixed; left: 0; top: 0; display: flex; flex-direction: column; padding-top: 24px; color: #fff; }
        .sidebar .logo { padding: 0 24px; margin-bottom: 32px; }
        .sidebar .logo h2 { font-size: 24px; color: #FF6FA3; }
        .sidebar nav { width: 100%; flex: 1; }
        .sidebar nav a { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; color: #ECF0F1; text-decoration: none; font-size: 15px; transition: background .2s; position: relative; }
        .sidebar nav a:hover { background: #34495E; }
        .sidebar nav a.active { background: #FF6FA3; color: #fff; font-weight: 600; }
        .badge { background: #E74C3C; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 12px; min-width: 20px; text-align: center; }
        .logout-btn { margin: 24px; background: #E74C3C; color: #fff; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; }
        .main { margin-left: 240px; padding: 32px 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .header h1 { font-size: 32px; color: #2C3E50; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .stat-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .stat-card .icon { font-size: 40px; margin-bottom: 12px; }
        .stat-card .value { font-size: 36px; font-weight: 700; color: #2C3E50; margin-bottom: 4px; }
        .stat-card .label { font-size: 14px; color: #7F8C8D; }
        .card { background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; }
        .card h2 { font-size: 20px; color: #2C3E50; margin-bottom: 20px; }
        .alert { padding: 16px; border-radius: 12px; margin-bottom: 20px; }
        .alert.warning { background: #FFF3CD; border-left: 4px solid #FFC107; color: #856404; }
        .alert.info { background: #D1ECF1; border-left: 4px solid #17A2B8; color: #0C5460; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #ECF0F1; color: #2C3E50; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #ECF0F1; }
        .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: transform .2s; text-decoration: none; display: inline-block; }
        .btn:hover { transform: translateY(-2px); }
        .btn-success { background: #27AE60; color: #fff; }
        .btn-danger { background: #E74C3C; color: #fff; }
        .btn-primary { background: #3498DB; color: #fff; }
        .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status.pending { background: #FFF3CD; color: #856404; }
        .status.verified { background: #D4EDDA; color: #155724; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="logo">
            <h2>🛡️ Admin Panel</h2>
            <div style="font-size: 12px; color: #95A5A6; margin-top: 4px;">{{ session('user_name') }}</div>
        </div>
        <nav>
            <a href="{{ url('/admin/dashboard') }}" class="active">
                <span>📊 Dashboard</span>
            </a>
            <a href="{{ url('/admin/verifications') }}">
                <span>✅ Verifikasi Psikolog</span>
                @if($pendingCount > 0)
                    <span class="badge">{{ $pendingCount }}</span>
                @endif
            </a>
            <a href="{{ url('/admin/users') }}">
                <span>👥 Kelola User</span>
            </a>
            <a href="{{ url('/admin/view-as-user') }}">
                <span>👁️ Lihat sebagai User</span>
            </a>
        </nav>
        <form method="POST" action="/logout">
            @csrf
            <button class="logout-btn" type="submit">Logout</button>
        </form>
    </div>

    <div class="main">
        <div class="header">
            <h1>Dashboard Admin</h1>
            <div style="font-size: 14px; color: #7F8C8D;">{{ now()->format('d F Y, H:i') }}</div>
        </div>

        @if(session('success'))
            <div class="alert info">
                ✓ {{ session('success') }}
            </div>
        @endif

        @if($pendingCount > 0)
            <div class="alert warning">
                <strong>⚠️ Perhatian!</strong> Ada {{ $pendingCount }} psikolog menunggu verifikasi. 
                <a href="{{ url('/admin/verifications') }}" style="color: #856404; text-decoration: underline; font-weight: 600;">Lihat sekarang</a>
            </div>
        @endif

        <div class="stats">
            <div class="stat-card">
                <div class="icon">👥</div>
                <div class="value">{{ $totalUsers }}</div>
                <div class="label">Total User</div>
            </div>
            <div class="stat-card">
                <div class="icon">👨‍⚕️</div>
                <div class="value">{{ $totalPsikolog }}</div>
                <div class="label">Total Psikolog</div>
            </div>
            <div class="stat-card">
                <div class="icon">🙋</div>
                <div class="value">{{ $totalAnonim }}</div>
                <div class="label">Total Anonim</div>
            </div>
            <div class="stat-card">
                <div class="icon">⏳</div>
                <div class="value">{{ $pendingCount }}</div>
                <div class="label">Menunggu Verifikasi</div>
            </div>
        </div>

        <div class="card">
            <h2>📋 Psikolog Terbaru Menunggu Verifikasi</h2>
            @if($pendingPsikolog->isEmpty())
                <div style="padding: 32px; text-align: center; color: #95A5A6;">
                    <div style="font-size: 48px; margin-bottom: 12px;">✓</div>
                    <div>Tidak ada psikolog yang menunggu verifikasi</div>
                </div>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pendingPsikolog->take(5) as $user)
                            <tr>
                                <td><strong>{{ $user->name }}</strong></td>
                                <td>{{ $user->email }}</td>
                                <td>{{ $user->username }}</td>
                                <td>{{ $user->created_at->format('d/m/Y H:i') }}</td>
                                <td><span class="status pending">Menunggu</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                @if($pendingCount > 5)
                    <div style="margin-top: 16px; text-align: center;">
                        <a href="{{ url('/admin/verifications') }}" class="btn btn-primary">Lihat Semua ({{ $pendingCount }})</a>
                    </div>
                @endif
            @endif
        </div>

        <div class="card">
            <h2>📊 Aktivitas Terakhir</h2>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Bergabung</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($recentUsers as $user)
                        <tr>
                            <td><strong>{{ $user->name }}</strong></td>
                            <td>{{ $user->email }}</td>
                            <td>
                                @if($user->is_admin)
                                    <span style="color:#E91E63; font-weight:600;">🛡️ Admin</span>
                                @elseif($user->role == 'psikolog')
                                    <span style="color: #3498DB;">👨‍⚕️ Psikolog</span>
                                @elseif($user->role == 'anonim')
                                    <span style="color: #95A5A6;">🙋 Anonim</span>
                                @else
                                    <span style="color: #95A5A6;">-</span>
                                @endif
                            </td>
                            <td>{{ $user->created_at->diffForHumans() }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
