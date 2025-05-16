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
        return $this->belongsToMany(Module::class, 'professeur_modules');
    }

    public function attributions()
    {
        return $this->hasMany(Attribution::class);
    }

    public function unavailabilities()
    {
        return $this->hasMany(Unavailability::class);
    }

    public function exchangeRequests()
    {
        return $this->hasMany(Echange::class, 'professeur_requester_id');
    }

    public function exchangeAcceptances()
    {
        return $this->hasMany(Echange::class, 'professeur_accepter_id');
    }
    public static function getRangs($rawKeys = false) {
        $rangs = ['PA' => 'Professeur Assistant (PA)', 'PAG' => 'Professeur Agrégé (PAG)', 'PES' => 'Professeur Enseignement Supérieur (PES)'];
        return $rawKeys ? array_keys($rangs) : $rangs;
    }

    public static function getStatuts($rawKeys = false) {
        $statuts = ['Active' => 'Active', 'On_Leave' => 'On Leave', 'Sick_Leave' => 'Sick Leave', 'Vacation' => 'Vacation', 'Inactive' => 'Inactive'];
        return $rawKeys ? array_keys($statuts) : $statuts;
    }

    public const RANG_PA  = 'PA';
    public const RANG_PAG = 'PAG';
    public const RANG_PES = 'PES';

    public const SPECIALITE_MEDICAL = 'medical';
    public const SPECIALITE_SURGICAL = 'surgical'; 

    public static function getSpecialties($displayTranslations = false, $translations = null) {
        $specialties = [
            self::SPECIALITE_MEDICAL => $displayTranslations && $translations ? ($translations['professeur_specialty_medical'] ?? 'Medical') : 'Medical',
            self::SPECIALITE_SURGICAL => $displayTranslations && $translations ? ($translations['professeur_specialty_surgical'] ?? 'Surgical') : 'Surgical',
        ];
        return $specialties;
    }
}