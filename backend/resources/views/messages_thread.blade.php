<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Conversation with {{ $friend->name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body{font-family:'Poppins',sans-serif;background:#f1f5f9;margin:0;padding:20px;color:#0f172a}
        .box{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
        .header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#fff;border-radius:14px;box-shadow:0 8px 18px rgba(240,103,159,0.15)}
        .header-title{font-weight:700;font-size:18px;color:#F0679F}
        .back{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(240,103,159,.18);color:#F0679F;padding:8px 12px;border-radius:12px;text-decoration:none;box-shadow:0 6px 14px rgba(240,103,159,.08)}
        .chat-card{background:#e2e8f0;border-radius:18px;box-shadow:0 10px 24px rgba(15,23,42,0.1);overflow:hidden;display:flex;flex-direction:column;min-height:60vh}
        .messages{padding:18px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;max-height:60vh}
        .row{display:flex}
        .row.me{justify-content:flex-end}
        .row.other{justify-content:flex-start}
        .bubble{max-width:70%;padding:12px 14px;border-radius:16px;line-height:1.5;white-space:pre-wrap;word-break:break-word;box-shadow:0 2px 8px rgba(0,0,0,0.08);position:relative}
        .bubble.me{background:#dcf8c6;border-bottom-right-radius:6px}
        .bubble.other{background:#fff;border-bottom-left-radius:6px}
        .meta{font-size:11px;color:#475569;margin-top:6px;text-align:right}
        .form{display:flex;gap:10px;padding:12px;background:#fff;border-top:1px solid #e2e8f0}
        textarea{flex:1;padding:10px 12px;border-radius:12px;border:1px solid #cbd5e1;resize:none;min-height:44px;max-height:160px;font-family:'Poppins',sans-serif;line-height:1.5;overflow:hidden}
        textarea:focus{outline:none;border-color:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.18)}
        .btn{background:linear-gradient(135deg,#F78BB8,#F0679F);color:#fff;border:none;padding:12px 18px;border-radius:12px;cursor:pointer;font-weight:600;box-shadow:0 10px 20px rgba(240,103,159,0.22)}
        .btn:hover{filter:brightness(1.03)}
        a{color:#0f172a;text-decoration:none;font-weight:600}
    </style>
</head>
<body>
    <div class="box">
        <div class="header">
            <div>
                <div class="header-title">{{ $friend->name }} ({{ $friend->username }})</div>
                <div style="font-size:12px;color:#475569">Percakapan pribadi</div>
            </div>
            <a class="back" href="{{ url('/messages') }}" aria-label="Kembali ke daftar teman">↩ Back</a>
        </div>

        <div class="chat-card">
            <div class="messages">
                @foreach($messages as $m)
                    @if($m->sender_id == session('user_id'))
                        <div class="row me">
                            <div class="bubble me">
                                {{ trim($m->body) }}
                                <div class="meta">{{ $m->created_at }}</div>
                            </div>
                        </div>
                    @else
                        <div class="row other">
                            <div class="bubble other">
                                {{ trim($m->body) }}
                                <div class="meta" style="text-align:left">{{ $m->created_at }}</div>
                            </div>
                        </div>
                    @endif
                @endforeach
            </div>

            <form class="form" method="POST" action="{{ url('/messages/' . $friend->id) }}">
                @csrf
                <textarea name="body" rows="3" placeholder="Ketik pesan..."></textarea>
                <button class="btn" type="submit">Kirim</button>
            </form>
        </div>

        <div style="margin-top:8px"><a href="{{ url('/messages') }}" style="color:#F0679F;text-decoration:none">⬅ Kembali ke daftar teman</a></div>
    </div>
    <script>
    (function() {
        const ta = document.querySelector('textarea[name="body"]');
        if (!ta) return;
        const limit = 160;
        const resize = () => {
            ta.style.height = 'auto';
            const next = Math.min(ta.scrollHeight, limit);
            ta.style.height = next + 'px';
        };
        ['input', 'focus'].forEach(ev => ta.addEventListener(ev, resize));
        // Trim before submit to avoid trailing newlines in stored message
        const form = ta.closest('form');
        if (form) {
            form.addEventListener('submit', () => {
                ta.value = ta.value.replace(/[\s\u00A0]+$/g, '').replace(/(\r?\n){3,}/g, '\n\n');
            });
        }
        resize();
    })();
    </script>
</body>
</html>