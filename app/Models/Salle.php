<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = ['nom', 'default_capacite'];

    public function examens()
    {
        return $this->belongsToMany(Examen::class, 'examens_salles')
                    ->withPivot('capacite');
    }
}