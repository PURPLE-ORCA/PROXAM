<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessorUnivability extends Model
{
    use HasFactory;

    protected $table = 'professor_univabilities';

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