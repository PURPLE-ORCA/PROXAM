<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unavailability extends Model
{
    /** @use HasFactory<\Database\Factories\UnavailabilityFactory> */
    use HasFactory;
    protected $table = 'unavailabilities';

    protected $fillable = [
        'professeur_id',
        'annee_uni_id',
        'start_datetime',
        'end_datetime',
        'reason'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function anneeUni()
    {
        return $this->belongsTo(AnneeUni::class);
    }
}
