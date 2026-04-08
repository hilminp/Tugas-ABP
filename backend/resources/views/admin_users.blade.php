<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin — Users</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body{font-family:'Poppins',sans-serif;background:#f6f6f9;margin:0;padding:24px}
        .box{max-width:1100px;margin:0 auto;background:#ffffff;padding:18px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{padding:8px 10px;border-bottom:1px solid #eee;text-align:left}
        th{background:#fafafa;font-weight:600}
        .admin-yes{color:green;font-weight:700}
        .admin-no{color:#888}
        .muted{color:#666;font-size:13px}
        .btn{display:inline-block;padding:6px 10px;border-radius:6px;border:none;background:#2f7cff;color:#fff;text-decoration:none;cursor:pointer;transition:all 0.2s ease}
        .small-btn{padding:4px 8px;font-size:13px}
        .btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 4px 12px rgba(47,124,255,0.3)}
        .btn:disabled{opacity:0.5;cursor:not-allowed}
        .btn-suspend{background:#e74c3c}
        .btn-suspend:hover:not(:disabled){box-shadow:0 4px 12px rgba(231,76,60,0.3)}
        .modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center}
        .modal.show{display:flex}
        .modal-content{background:#fff;padding:24px;border-radius:8px;max-width:500px;width:90%;box-shadow:0 8px 24px rgba(0,0,0,0.15)}
        .modal-header{font-size:18px;font-weight:600;margin-bottom:16px}
        .modal-body{margin-bottom:16px}
        .modal-input{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;margin-bottom:12px;box-sizing:border-box;font-family:Poppins,sans-serif}
        .modal-footer{display:flex;gap:8px;justify-content:flex-end}
        .btn-small{padding:8px 16px;font-size:13px}
        .back-link{display:inline-block;padding:10px 16px;margin-top:16px;background:#3498DB;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;transition:all 0.2s ease}
        .back-link:hover{background:#2980B9;transform:translateY(-2px);box-shadow:0 4px 12px rgba(52,152,219,0.3)}
    </style>
</head>
<body>
    <div class="box">
        <h1>Admin panel — All users</h1>
        <p class="muted">Displaying all users from the database. Only accessible for admins.</p>
        
        <div style="margin: 16px 0; padding: 12px; background: #F0F8FF; border-radius: 8px; border-left: 4px solid #3498DB;">
            <strong>🛡️ Admin Menu:</strong>
            <a href="{{ url('/admin/dashboard') }}" style="margin-left: 12px; color: #3498DB;">📊 Dashboard</a> |
            <a href="{{ url('/admin/verifications') }}" style="margin-left: 8px; color: #3498DB;">
                ✅ Verifikasi Psikolog
                @php
                    $pending = \App\Models\User::where('role', 'psikolog')->where('is_admin', false)->where('is_verified', false)->count();
                @endphp
                @if($pending > 0)
                    <span style="background: #E74C3C; color: white; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-left: 4px;">{{ $pending }}</span>
                @endif
            </a> |
            <a href="{{ url('/admin/users') }}" style="margin-left: 8px; color: #3498DB; font-weight: 600;">👥 Kelola User</a> |
            <a href="{{ url('/admin/view-as-user') }}" style="margin-left: 8px; color: #3498DB;">👁️ Lihat sebagai User</a>
        </div>

        @if(session('success'))
            <div class="success-message">✓ {{ session('success') }}</div>
        @endif

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Created</th>
                    <th>Admin</th>
                    <th>Suspended</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($users as $u)
                <tr>
                    <td>{{ $u->id }}</td>
                    <td>{{ $u->name }}</td>
                    <td>{{ $u->username ?? '-' }}</td>
                    <td>{{ $u->email }}</td>
                    <td>
                        @if($u->is_admin)
                            <span style="color:#E91E63; font-weight:600;">🛡️ Admin</span>
                        @elseif($u->role == 'psikolog')
                            <span style="color: #3498DB;">👨‍⚕️ Psikolog</span>
                        @elseif($u->role == 'anonim')
                            <span style="color: #95A5A6;">🙋 Anonim</span>
                        @else
                            <span class="muted">-</span>
                        @endif
                    </td>
                    <td>
                        @if($u->role == 'psikolog')
                            @if($u->is_verified)
                                <span style="color: #27AE60;">✓ Yes</span>
                            @else
                                <span style="color: #F39C12; font-weight: 600;">⏳ Pending</span>
                            @endif
                        @else
                            <span style="color: #95A5A6;">-</span>
                        @endif
                    </td>
                    <td>{{ $u->created_at }}</td>
                    <td>
                        @if($u->is_admin)
                            <span class="admin-yes">YES</span>
                        @else
                            <span class="admin-no">no</span>
                        @endif
                    </td>
                    <td>
                        @if($u->is_suspended)
                            <div style="color:#b02a37;font-weight:700">SUSPENDED</div>
                            <div class="muted">{{ $u->suspended_reason ?? 'no reason provided' }}</div>
                        @else
                            <div class="admin-no">active</div>
                        @endif
                    </td>
                    <td>
                        @if(isset($me) && $me && $me->is_admin)
                            <!-- suspend / unsuspend only -->
                            @if($u->is_suspended)
                                <form method="POST" action="{{ url('/admin/user/' . $u->id . '/suspend') }}" style="display:inline">
                                    @csrf
                                    <input type="hidden" name="action" value="unsuspend">
                                    <button class="btn small-btn" type="submit">Unsuspend</button>
                                </form>
                            @else
                                <button class="btn btn-suspend small-btn" onclick="openSuspendModal({{ $u->id }}, '{{ $u->name }}')">Suspend</button>
                            @endif
                        @else
                            —
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top:12px"><a href="/admin/dashboard" class="back-link">← Kembali ke Dashboard Admin</a></div>
    </div>

    <!-- Suspend Modal -->
    <div id="suspendModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">⚠️ Suspend User</div>
            <div class="modal-body">
                <p style="margin:0 0 12px 0">User: <strong id="suspendUserName"></strong></p>
                <label style="display:block;margin-bottom:8px;font-weight:600">Reason for suspension:</label>
                <textarea id="suspendReason" class="modal-input" placeholder="Enter suspension reason..." rows="4"></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-small" onclick="closeSuspendModal()">Cancel</button>
                <button class="btn btn-suspend btn-small" onclick="submitSuspend()">Confirm Suspend</button>
            </div>
        </div>
    </div>

    <script>
        let currentUserId = null;
        
        function openSuspendModal(userId, userName) {
            currentUserId = userId;
            document.getElementById('suspendUserName').textContent = userName;
            document.getElementById('suspendReason').value = '';
            document.getElementById('suspendModal').classList.add('show');
        }
        
        function closeSuspendModal() {
            document.getElementById('suspendModal').classList.remove('show');
            currentUserId = null;
        }
        
        function submitSuspend() {
            const reason = document.getElementById('suspendReason').value.trim();
            if (!reason) {
                alert('Please enter a suspension reason');
                return;
            }
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/user/${currentUserId}/suspend`;
            form.innerHTML = `
                @csrf
                <input type="hidden" name="action" value="suspend">
                <input type="hidden" name="reason" value="${reason}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
        
        // Close modal when clicking outside
        document.getElementById('suspendModal').addEventListener('click', function(e) {
            if (e.target === this) closeSuspendModal();
        });
    </script>
