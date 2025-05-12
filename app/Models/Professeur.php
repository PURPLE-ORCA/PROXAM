<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
    protected $fillable = [
        'user_id', 'nom', 'prenom', 'rang', 'statut', 
        'is_chef_service', 'date_recrutement', 'specialite', 'service_id'
    ];

    protected $casts = [
        'is_chef_service' => 'boolean',
        'date_recrutement' => 'date',
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
        return $this->belongsToMany(Module::class, 'professeur_module');
    }

    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }

    public function unavailabilities()
    {
        return $this->hasMany(ProfessorUnavailability::class);
    }

    public function exchangeRequests()
    {
        return $this->hasMany(Echange::class, 'professeur_requester_id');
    }

    public function exchangeAcceptances()
    {
        return $this->hasMany(Echange::class, 'professeur_accepter_id');
    }
}