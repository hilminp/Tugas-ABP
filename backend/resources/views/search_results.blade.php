<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Search Results</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body{font-family:'Poppins',sans-serif;background:#FFF8EE;margin:0;padding:20px}
        .box{max-width:900px;margin:0 auto}
        .user{background:#fff;border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
        .btn{background:#FF6FA3;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
        .info{color:#666;margin-bottom:12px}
    </style>
</head>
<body>
    <div class="box">
        <h2>Hasil pencarian untuk "{{ $query }}"</h2>
        <div class="info">{{ $results->count() }} hasil ditemukan</div>
        
        @if($results->isEmpty())
            <div style="background: #F8F9FA; padding: 24px; border-radius: 10px; text-align: center; color: #666; margin: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
                <div style="font-size: 16px; font-weight: 600;">Tidak ada hasil yang ditemukan</div>
                <div style="font-size: 13px; margin-top: 8px;">
                    Tidak ada user yang cocok dengan pencarian "{{ $query }}".<br>
                    <em>(Catatan: Akun admin tidak ditampilkan dalam hasil pencarian)</em>
                </div>
            </div>
        @else
        @php
            $meId = session('user_id');
            // allow testing override in local env: ?as_user={id}
            if (!$meId && app()->environment('local')) {
                $as = (int) request()->query('as_user', 0);
                if ($as > 0) $meId = $as;
            }
            $me = null;
            if ($meId) $me = \App\Models\User::find($meId);
        @endphp
        @foreach($results as $user)
            <div class="user">
                <div>
                    <div style="font-weight:600">{{ $user->name }} ({{ $user->username }})</div>
                    <div style="font-size:13px;color:#777">{{ $user->email }}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    @php $adminViewing = session('is_admin') && session('viewing_as_user'); @endphp
                    @unless($adminViewing)
                        <form method="POST" action="{{ url('/friend/' . $user->id) }}">
                            @csrf
                            <button class="btn" type="submit" {{ $user->is_suspended ? 'disabled' : '' }}>Add Friend</button>
                        </form>
                    @endunless

                    @if($user->is_suspended)
                        <div style="font-size:13px;color:#b02a37;margin-left:10px">Suspended: {{ $user->suspended_reason ?? 'no reason provided' }}</div>
                    @endif

                    @if(isset($me) && $me && $me->is_admin)
                        @if($user->id != $me->id)
                            <form method="POST" action="{{ url('/admin/user/' . $user->id . '/suspend') }}" class="suspend-form" data-user-id="{{ $user->id }}">
                                @csrf
                                <input type="hidden" name="action" value="suspend">
                                <input type="hidden" name="reason" value="">
                                <button class="btn" type="button" onclick="handleSuspend(this, false)">
                                    Suspend
                                </button>
                            </form>
                            @if($user->is_suspended)
                                <form method="POST" action="{{ url('/admin/user/' . $user->id . '/suspend') }}">
                                    @csrf
                                    <input type="hidden" name="action" value="unsuspend">
                                    <button class="btn" type="submit" style="background:#6c757d">Unsuspend</button>
                                </form>
                            @endif
                        @endif
                    @endif
                </div>
            </div>
        @endforeach
        @endif
        
        <div style="margin-top: 20px;">
            <a href="{{ url('/home') }}" style="color: #FF6FA3; text-decoration: none; font-weight: 600;">← Kembali ke Home</a>
        </div>
    </div>

    <script>
        function handleSuspend(button, isAlreadySuspended) {
            // find the closest form
            var form = button.closest('.suspend-form');
            if (!form) return;
            var reason = prompt('Masukkan alasan penangguhan untuk user ini (required):');
            if (reason === null) return; // cancelled
            reason = reason.trim();
            if (!reason) {
                alert('Alasan wajib diisi untuk menangguhkan akun.');
                return;
            }
            // set the hidden input and submit
            var reasonInput = form.querySelector('input[name="reason"]');
            if (reasonInput) reasonInput.value = reason;
            // change action to suspend (just in case)
            var actionInput = form.querySelector('input[name="action"]');
            if (actionInput) actionInput.value = 'suspend';
            form.submit();
        }
    </script>
    </div>
</body>
</html>