<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Echange extends Model
{
    use HasFactory;

    protected $fillable = [
        'attribution_offered_id',
        'professeur_requester_id',
        'motif',
        'status',
        'professeur_accepter_id',
        'attribution_accepted_id',
    ];

    public function attributionOffered()
    {
        return $this->belongsTo(Attribution::class, 'attribution_offered_id');
    }

    public function attributionAccepted()
    {
        return $this->belongsTo(Attribution::class, 'attribution_accepted_id');
    }

    public function professeurRequester()
    {
        return $this->belongsTo(Professeur::class, 'professeur_requester_id');
    }

    public function professeurAccepter()
    {
        return $this->belongsTo(Professeur::class, 'professeur_accepter_id');
    }
}
