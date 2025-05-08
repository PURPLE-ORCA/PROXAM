<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token',
        'role',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function professeur()
    {
        return $this->hasOne(Professeur::class);
    }
}
