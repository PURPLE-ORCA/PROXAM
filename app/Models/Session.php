<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Session extends Model
{
    use HasFactory;

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
