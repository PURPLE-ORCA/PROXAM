<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnneeUni extends Model
{
    use HasFactory;

    protected $fillable = [
        'annee',
    ];

    protected $casts = [
        // 'date_debut' => 'date', // Removed as per new form
        // 'date_fin' => 'date', // Removed as per new form
    ];
    
    // Add relationships if needed
    public function sesons()
    {
        return $this->hasMany(Seson::class);
    }
}
