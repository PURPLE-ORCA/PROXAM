<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    /** @use HasFactory<\Database\Factories\LevelFactory> */
    use HasFactory;

    protected $fillable = ['nom', 'filiere_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
