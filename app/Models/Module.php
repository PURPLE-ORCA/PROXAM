<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Module extends Model
{
    use HasFactory;

    protected $fillable = ['nom'];

    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'professeur_module')->withTimestamps();
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
}
