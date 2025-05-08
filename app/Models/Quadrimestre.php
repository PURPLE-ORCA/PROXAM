<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Quadrimestre extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'session_id'];

    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
}
