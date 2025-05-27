<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom', 'quadrimestre_id', 'type', 'debut', 
        'module_id'
    ];

    protected $casts = [
        'debut' => 'datetime',
    ];

    public function getEndDatetimeAttribute(): Carbon
    {
        return Carbon::parse($this->debut)->addHours(2);
    }

    // Append it so it's included in toArray() / JSON
    protected $appends = ['end_datetime', 'total_required_professors'];
    
    public function quadrimestre()
    {
        return $this->belongsTo(Quadrimestre::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function seson()
    {
        return $this->belongsTo(Seson::class);
    }

    public function salles() {
        return $this->belongsToMany(Salle::class, 'examens_salles')
                    ->withPivot('capacite', 'professeurs_assignes_salle')
                    ->withTimestamps();
    }
    public function getTotalRequiredProfessorsAttribute(): int {
        if (!$this->relationLoaded('salles')) { $this->load('salles'); }
        return $this->salles->sum('pivot.professeurs_assignes_salle') ?: 0;
    }

    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }

    public static function getTypes() {
        // Key is what's stored in DB, Value is for display
        return ['QCM' => 'QCM', 'theoreique' => 'Théorique', 'MIXED' => 'MIXED'];
    }

    public static function getFilieres() {
        return ['Medicale' => 'Médicale', 'Pharmacie' => 'Pharmacie'];
    }
    public function getNomOrIdAttribute(): string
    {
        return $this->nom ?? "Exam ID {$this->id}";
    }
}
