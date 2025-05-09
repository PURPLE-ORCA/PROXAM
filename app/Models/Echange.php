<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Echange extends Model
{
    protected $fillable = [
        'attribution_offered_id', 'professeur_requester_id', 
        'motif', 'status', 'professeur_accepter_id', 'attribution_accepted_id'
    ];

    public function offeredAttribution()
    {
        return $this->belongsTo(Attribution::class, 'attribution_offered_id');
    }

    public function acceptedAttribution()
    {
        return $this->belongsTo(Attribution::class, 'attribution_accepted_id');
    }

    public function requester()
    {
        return $this->belongsTo(Professeur::class, 'professeur_requester_id');
    }

    public function accepter()
    {
        return $this->belongsTo(Professeur::class, 'professeur_accepter_id');
    }
}