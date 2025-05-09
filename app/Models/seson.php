<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seson extends Model
{
    protected $fillable = ['code', 'annee_uni_id'];

    public function anneeUni()
    {
        return $this->belongsTo(AnneeUni::class);
    }

    public function quadrimestres()
    {
        return $this->hasMany(Quadrimestre::class);
    }
}
