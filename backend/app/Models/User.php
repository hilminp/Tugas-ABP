<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'is_admin',
        'is_suspended',
        'suspended_reason',
        'role',
        'is_verified',
        'str_file',
        'ijazah_file',
        'profile_image',
    ];

    /**
     * Users that this user has sent friendship to or accepted.
     */
    public function friends()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Check if there's already a friendship/ request between two users
     */
    public function hasFriendRequestTo($otherUserId)
    {
        return \App\Models\Friendship::where(function($q) use ($otherUserId) {
            $q->where('user_id', $this->id)->where('friend_id', $otherUserId);
        })->orWhere(function($q) use ($otherUserId) {
            $q->where('user_id', $otherUserId)->where('friend_id', $this->id);
        })->exists();
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_suspended' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }
}
