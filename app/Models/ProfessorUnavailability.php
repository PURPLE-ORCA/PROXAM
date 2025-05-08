<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProfessorUnavailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'professeur_id',
        'start_datetime',
        'end_datetime',
        'reason',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }
}
