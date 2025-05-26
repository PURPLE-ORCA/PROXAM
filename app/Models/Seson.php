<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Seson extends Model
{
    protected $fillable = [
        'code',
        'annee_uni_id',
        'assignments_approved_at',
        'notifications_sent_at',
        'approval_user_id',
    ];

    protected $casts = [
        'assignments_approved_at' => 'datetime',
        'notifications_sent_at' => 'datetime',
    ];

    public function anneeUni()
    {
        return $this->belongsTo(AnneeUni::class);
    }

    public function quadrimestres()
    {
        return $this->hasMany(Quadrimestre::class);
    }


    public function scopeOrderByAnneeUniThenCode(Builder $query): Builder
    {
        return $query->select('sesons.*') // Ensure we select from sesons table
            ->join('annee_unis', 'annee_unis.id', '=', 'sesons.annee_uni_id')
            ->orderBy('annee_unis.annee', 'desc')
            ->orderBy('sesons.code', 'asc');
    }
}
