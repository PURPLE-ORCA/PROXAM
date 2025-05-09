<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['nom'];

    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'professeur_module');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
}