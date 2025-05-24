<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    use HasFactory;
    protected $fillable = ['nom', 'default_capacite'];

    public function examens()
    {
        return $this->belongsToMany(Examen::class, 'examens_salles')
                    ->withPivot('capacite', 'professeurs_assignes_salle')
                    ->withTimestamps();
    }
    public function moduleExamRoomConfigs() // <<< NEW RELATIONSHIP
    {
        return $this->hasMany(ModuleExamRoomConfig::class);
    }
    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }
}