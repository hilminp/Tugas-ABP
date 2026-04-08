<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Psikolog - Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #FFF8EE; font-family: 'Poppins', sans-serif; }
        .sidebar { width: 240px; background: #2C3E50; height: 100vh; position: fixed; left: 0; top: 0; display: flex; flex-direction: column; padding-top: 24px; color: #fff; }
        .sidebar .logo { padding: 0 24px; margin-bottom: 32px; }
        .sidebar .logo h2 { font-size: 24px; color: #FF6FA3; }
        .sidebar nav { width: 100%; flex: 1; }
        .sidebar nav a { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; color: #ECF0F1; text-decoration: none; font-size: 15px; transition: background .2s; }
        .sidebar nav a:hover { background: #34495E; }
        .sidebar nav a.active { background: #FF6FA3; color: #fff; font-weight: 600; }
        .badge { background: #E74C3C; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 12px; min-width: 20px; text-align: center; }
        .logout-btn { margin: 24px; background: #E74C3C; color: #fff; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; }
        .main { margin-left: 240px; padding: 32px 40px; }
        .card { background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .header h1 { font-size: 28px; color: #2C3E50; }
        .alert { padding: 16px; border-radius: 12px; margin-bottom: 20px; }
        .alert.success { background: #D4EDDA; border-left: 4px solid #28A745; color: #155724; }
        .alert.danger { background: #F8D7DA; border-left: 4px solid #DC3545; color: #721C24; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #ECF0F1; color: #2C3E50; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #ECF0F1; }
        .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: transform .2s; text-decoration: none; display: inline-block; margin-right: 8px; }
        .btn:hover { transform: translateY(-2px); }
        .btn-success { background: #27AE60; color: #fff; }
        .btn-danger { background: #E74C3C; color: #fff; }
        .btn-primary { background: #3498DB; color: #fff; }
        .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status.pending { background: #FFF3CD; color: #856404; }
        .status.verified { background: #D4EDDA; color: #155724; }
        .empty { padding: 48px; text-align: center; color: #95A5A6; }
        .empty-icon { font-size: 64px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="logo">
            <h2>🛡️ Admin Panel</h2>
            <div style="font-size: 12px; color: #95A5A6; margin-top: 4px;">{{ session('user_name') }}</div>
        </div>
        <nav>
            <a href="{{ url('/admin/dashboard') }}">
                <span>📊 Dashboard</span>
            </a>
            <a href="{{ url('/admin/verifications') }}" class="active">
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
            <h1>Verifikasi Psikolog</h1>
            <a href="{{ url('/admin/dashboard') }}" class="btn btn-primary">← Kembali ke Dashboard</a>
        </div>

        @if(session('success'))
            <div class="alert success">
                ✓ {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="alert danger">
                ✗ {{ session('error') }}
            </div>
        @endif

        <div class="card">
            <h2 style="margin-bottom: 16px;">📋 Daftar Psikolog Menunggu Verifikasi</h2>
            
            @if($pendingPsikolog->isEmpty())
                <div class="empty">
                    <div class="empty-icon">✓</div>
                    <h3>Tidak Ada Verifikasi Pending</h3>
                    <p style="margin-top: 8px;">Semua psikolog sudah diverifikasi</p>
                </div>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Tanggal Daftar</th>
                            <th>Dokumen</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pendingPsikolog as $user)
                            <tr>
                                <td><strong>{{ $user->name }}</strong></td>
                                <td>{{ $user->email }}</td>
                                <td>{{ $user->username }}</td>
                                <td>{{ $user->created_at->format('d/m/Y H:i') }}</td>
                                <td>
                                    @if($user->str_file)
                                        <a href="{{ asset('storage/' . $user->str_file) }}" target="_blank" class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;">📄 STR</a>
                                    @endif
                                    @if($user->ijazah_file)
                                        <a href="{{ asset('storage/' . $user->ijazah_file) }}" target="_blank" class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;">📄 Ijazah</a>
                                    @endif
                                </td>
                                <td>
                                    <form method="POST" action="{{ url('/admin/verify/' . $user->id) }}" style="display: inline;">
                                        @csrf
                                        <button type="submit" class="btn btn-success" onclick="return confirm('Verifikasi psikolog ini?')">✓ Verifikasi</button>
                                    </form>
                                    <form method="POST" action="{{ url('/admin/reject/' . $user->id) }}" style="display: inline;">
                                        @csrf
                                        <button type="submit" class="btn btn-danger" onclick="return confirm('Tolak verifikasi dan hapus akun ini?')">✗ Tolak</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        @if($verifiedPsikolog->isNotEmpty())
            <div class="card" style="margin-top: 24px;">
                <h2 style="margin-bottom: 16px;">✅ Psikolog Terverifikasi</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Tanggal Verifikasi</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($verifiedPsikolog as $user)
                            <tr>
                                <td><strong>{{ $user->name }}</strong></td>
                                <td>{{ $user->email }}</td>
                                <td>{{ $user->username }}</td>
                                <td>{{ $user->updated_at->format('d/m/Y H:i') }}</td>
                                <td><span class="status verified">✓ Terverifikasi</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</body>
</html>
