<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'examen_id',
        'professeur_id',
        'is_responsable',
    ];

    protected $casts = [
        'is_responsable' => 'boolean',
    ];

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function echangeOffered()
    {
        return $this->hasOne(Echange::class, 'attribution_offered_id');
    }

    public function echangeAccepted()
    {
        return $this->hasOne(Echange::class, 'attribution_accepted_id');
    }
}
