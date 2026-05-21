<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CapabilityMatrix extends Model
{
    use HasFactory;

    protected $table = 'capability_matrix';

    public $timestamps = false;

    protected $fillable = [
        'machine',
        'machine_brand',
        'inspection_capability',
        'package',
        'dimensions',
        'devicename',
        'customer',
        'areas',

        'd3',
        'd2',
        'term_distance',
        'leadBurr',
        'padBurr',
        'padContain',
        'padDiscoloration',
        'tightendBH',

        'markTop',
        'pinTop',
        'crackTop',
        'chipoutTop',
        'scratchTop',

        'markip',
        'pinip',
        'tipip',
        'pitchip',
        'leadVariance',

        'crack',
        'chipout',
        'scratch',

        'arr',
        'tubetube',
        'tubetape',
        'tapetube',
        'tubetray',
        'traytray',
        'traytape',
        'tapetray',
        'tryjewelbox',
        'canistertray',
        'canistertape',
        'tapetape',

        'withAuxillary',
        'ColoredCamera',
        'detape',
        'machineLearn',

        'created_by'
    ];
}
