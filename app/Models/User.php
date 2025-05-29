<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Notifications\ProfessorAccountActivation; 


class User extends Authenticatable
{
    use HasFactory, Notifiable; 

    protected $fillable = [
        'name', 'email', 'password', 'role'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', 
    ];
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function professeur()
    {
        return $this->hasOne(Professeur::class, 'user_id');
    }

    public function customNotifications() // Give it a distinct name
    {
        return $this->hasMany(\App\Models\Notification::class, 'user_id'); // Using your App\Models\Notification
    }
}
