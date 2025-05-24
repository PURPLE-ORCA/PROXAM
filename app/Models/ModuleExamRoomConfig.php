<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleExamRoomConfig extends Model
{
    /** @use HasFactory<\Database\Factories\ModuleExamRoomConfigFactory> */
    use HasFactory;

    protected $fillable = [
        'module_id',
        'salle_id',
        'configured_capacity',
        'configured_prof_count',
    ];
    protected $table = 'module_exam_room_configs'; 

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}
