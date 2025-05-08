<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnneeUni extends Model
{
    use HasFactory;

    protected $fillable = ['annee'];

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }
}

