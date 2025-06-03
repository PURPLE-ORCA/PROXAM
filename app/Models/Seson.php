<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seson extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'annee_uni_id',
        'assignments_approved_at',
        'notifications_sent_at',
        'approval_user_id',
    ];

    protected $casts = [
        'assignments_approved_at' => 'datetime',
        'notifications_sent_at' => 'datetime',
    ];

    // Relationship to AnneeUni (Seson belongs to AnneeUni)
    public function anneeUni(): BelongsTo
    {
        return $this->belongsTo(AnneeUni::class, 'annee_uni_id');
    }

    // Relationship to Examen (Seson has many Examens)
    public function examens(): HasMany
    {
        return $this->hasMany(Examen::class);
    }

    // No quadrimestre() relationship needed here based on your sesons table schema
    public function quadrimestres(): HasMany
    {
        return $this->hasMany(Quadrimestre::class);
    }
}
