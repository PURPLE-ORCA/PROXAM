<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    protected $fillable = [
        'nom', 'quadrimestre_id', 'type', 'debut', 'fin', 
        'module_id', 'filiere', 'required_professors'
    ];

    protected $casts = [
        'debut' => 'datetime',
        'fin' => 'datetime',
    ];

    public function quadrimestre()
    {
        return $this->belongsTo(Quadrimestre::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function salles()
    {
        return $this->belongsToMany(Salle::class, 'examens_salles')
                    ->withPivot('capacite');
    }

    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }
}