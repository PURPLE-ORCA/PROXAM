<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;
    protected $fillable = ['nom', 'level_id'];

    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'professeur_modules');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
    
    public function level() // <<< NEW RELATIONSHIP
    {
        return $this->belongsTo(Level::class);
    }
}