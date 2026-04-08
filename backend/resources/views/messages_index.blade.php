<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Messages</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body{font-family:'Poppins',sans-serif;background:#FFF8EE;margin:0;padding:24px;color:#2a1f25}
        .box{max-width:980px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .title{font-weight:700;font-size:24px;color:#F0679F}
        .back{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(240,103,159,.18);color:#F0679F;padding:8px 12px;border-radius:12px;text-decoration:none;box-shadow:0 6px 14px rgba(240,103,159,.08)}
        .list{background:#fff;border-radius:16px;box-shadow:0 10px 24px rgba(240,103,159,.12);padding:8px}
        .friend{background:#fff;border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;transition:background .2s ease}
        .friend + .friend{border-top:1px solid #f1f5f9}
        .friend:hover{background:#fff6fb}
        .name{font-weight:600}
        .email{font-size:13px;color:#6b7280}
        .btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#F78BB8,#F0679F);color:#fff;border:none;padding:10px 14px;border-radius:12px;cursor:pointer;text-decoration:none;box-shadow:0 10px 20px rgba(240,103,159,.22)}
        .btn:hover{filter:brightness(1.03)}
        .empty{padding:18px;color:#6b7280}
        a{color:#F0679F;text-decoration:none}
    </style>
</head>
<body>
    <div class="box">
        <div class="header">
            <div class="title">Friends</div>
            <a class="back" href="{{ url('/home') }}" aria-label="Back to Home">↩ Back to Home</a>
        </div>
        <div class="list">
            @if($friends->isEmpty())
                <div class="empty">No friends yet</div>
            @endif
            @foreach($friends as $f)
                <div class="friend">
                    <div>
                        <div class="name">{{ $f->name }} ({{ $f->username }})</div>
                        <div class="email">{{ $f->email }}</div>
                    </div>
                    <div>
                        <a class="btn" href="{{ url('/messages/' . $f->id) }}" aria-label="Send Message">✉️ Send Message</a>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</body>
</html>