<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnneeUni extends Model
{
    use HasFactory;

    protected $fillable = ['nom_annee', 'date_debut', 'date_fin'];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];
    
    // Add relationships if needed
    public function sesons()
    {
        return $this->hasMany(Seson::class);
    }
}
