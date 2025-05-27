<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Add this import

class Examen extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom', 'quadrimestre_id', 'type', 'debut', 
        'module_id',
        'seson_id' // Assuming seson_id is also fillable if it's a direct FK
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
    
    public function quadrimestre(): BelongsTo
    {
        return $this->belongsTo(Quadrimestre::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function seson(): BelongsTo
    {
        return $this->belongsTo(Seson::class, 'seson_id'); // Assuming 'seson_id' FK on examens table
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
