<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salle extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'default_capacite'];

    public function examens()
    {
        return $this->belongsToMany(Examen::class, 'examens_salles')
                    ->withPivot('capacite')
                    ->withTimestamps();
    }
}
