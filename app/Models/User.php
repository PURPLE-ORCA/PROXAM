<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function professeur()
    {
        return $this->hasOne(Professeur::class, 'user_id');
    }
}
