<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamenSalle extends Model
{
    use HasFactory;

    protected $table = 'examens_salles';

    protected $fillable = [
        'examen_id',
        'salle_id',
        'capacite'
    ];

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}