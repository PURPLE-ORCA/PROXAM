<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribution extends Model
{
    protected $fillable = ['examen_id', 'professeur_id', 'is_responsable', 'salle_id', 'is_involved_in_exchange'];

    protected $casts = [
        'is_responsable' => 'boolean',
        'is_involved_in_exchange' => 'boolean',
    ];

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function offeredExchanges()
    {
        return $this->hasMany(Echange::class, 'attribution_offered_id');
    }

    public function acceptedExchanges()
    {
        return $this->hasMany(Echange::class, 'attribution_accepted_id');
    }
    
    public function salle() { 
        return $this->belongsTo(Salle::class); 
    }
}
