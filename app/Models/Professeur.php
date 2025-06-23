<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use App\Models\Service;

class Professeur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'statut',
        'service_id',
    ];

    protected $appends = ['effective_statut'];

    /**
     * Get the professor's effective status, considering any active unavailabilities.
     * This is the "real" status at the current moment.
     */
    public function getEffectiveStatutAttribute(): array
    {
        $now = now();

        // Check for an active unavailability record that spans the current time
        $activeUnavailability = $this->unavailabilities()
            ->where('start_datetime', '<=', $now)
            ->where('end_datetime', '>=', $now)
            ->first();

        if ($activeUnavailability) {
            // If they are unavailable, that's the most important status.
            return [
                'key' => 'UNAVAILABLE',
                'label' => 'Unavailable',
                'reason' => $activeUnavailability->reason ?? 'No reason provided' // e.g., "Conference"
            ];
        }

        // If no active unavailability, just return their base long-term status.
        return [
            'key' => $this->statut, // 'Active', 'On_Leave', etc.
            'label' => self::getStatuts()[$this->statut] ?? $this->statut,
            'reason' => 'Base status'
        ];
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
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
