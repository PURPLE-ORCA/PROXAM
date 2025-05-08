<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Professeur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'rang',
        'statut',
        'is_chef_service',
        'date_recrutement',
        'specialite',
        'service_id',
    ];

    protected $casts = [
        'date_recrutement' => 'date',
        'is_chef_service' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'professeur_module')->withTimestamps();
    }

    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }

    public function unavailabilities()
    {
        return $this->hasMany(ProfessorUnavailability::class);
    }

    public function echangeRequests()
    {
        return $this->hasMany(Echange::class, 'professeur_requester_id');
    }

    public function echangeAcceptances()
    {
        return $this->hasMany(Echange::class, 'professeur_accepter_id');
    }
}
