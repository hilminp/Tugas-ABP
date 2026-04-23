<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'psychologist_id',
        'patient_id',
        'rating',
        'comment',
        'is_anonymous',
    ];

    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
