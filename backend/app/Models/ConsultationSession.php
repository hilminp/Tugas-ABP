<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'psychologist_id',
        'user_id',
        'session_date',
        'session_time',
        'status',
        'started_at',
        'ended_at',
        'is_seen',
    ];

    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
