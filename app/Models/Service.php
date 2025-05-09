<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['nom'];

    public function professeurs()
    {
        return $this->hasMany(Professeur::class);
    }
}