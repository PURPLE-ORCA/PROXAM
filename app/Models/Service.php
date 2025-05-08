<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['nom'];

    public function professeurs()
    {
        return $this->hasMany(Professeur::class);
    }
}
