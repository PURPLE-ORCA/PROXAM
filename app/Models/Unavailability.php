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
        'start_datetime',
        'end_datetime',
        'reason'
    ];

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }
}
