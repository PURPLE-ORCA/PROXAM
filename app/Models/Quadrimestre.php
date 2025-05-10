<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quadrimestre extends Model
{
    protected $fillable = ['code', 'seson_id'];

    public function seson()
    {
        return $this->belongsTo(Seson::class);
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
}