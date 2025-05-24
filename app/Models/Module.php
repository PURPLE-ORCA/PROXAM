<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;
    protected $fillable = ['nom', 'level_id'];

    protected $appends = ['default_total_required_professors']; 

    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'professeur_modules');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
    
    public function level()
    {
        return $this->belongsTo(Level::class);
    }
    public function examRoomConfigs()
    {
        return $this->hasMany(ModuleExamRoomConfig::class);
    }
    public function getDefaultTotalRequiredProfessorsAttribute(): int
    {
        if (!$this->relationLoaded('examRoomConfigs')) {
            $this->load('examRoomConfigs');
        }
        return $this->examRoomConfigs->sum('configured_prof_count') ?: 0; 
    }
}