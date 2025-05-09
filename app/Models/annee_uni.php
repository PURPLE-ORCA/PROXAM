<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeUni extends Model
{
    protected $fillable = ['annee'];

    public function seson()
    {
        return $this->hasMany(Seson::class);
    }
}