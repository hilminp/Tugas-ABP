<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Friend Requests</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body{font-family:'Poppins',sans-serif;background:#FFF8EE;margin:0;padding:20px}
        .box{max-width:900px;margin:0 auto}
        .req{background:#fff;border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
        .btn{background:#FF6FA3;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;margin-left:6px}
        .actions{display:flex}
    </style>
</head>
<body>
    <div class="box">
        <h2>Incoming Friend Requests</h2>
        @if($requests->isEmpty())
            <div>No requests</div>
        @endif
        @foreach($requests as $r)
            <div class="req">
                <div>
                    <div style="font-weight:600">{{ $r->requester->name }} ({{ $r->requester->username }})</div>
                    <div style="font-size:13px;color:#777">{{ $r->requester->email }}</div>
                </div>
                <div class="actions">
                    <form method="POST" action="{{ url('/friend/' . $r->user_id . '/accept') }}">
                        @csrf
                        <button class="btn" type="submit">Accept</button>
                    </form>
                    <form method="POST" action="{{ url('/friend/' . $r->user_id . '/reject') }}">
                        @csrf
                        <button class="btn" style="background:#ccc;color:#222" type="submit">Reject</button>
                    </form>
                </div>
            </div>
        @endforeach
        <a href="{{ url('/home') }}">Back to Home</a>
    </div>
</body>
</html>
