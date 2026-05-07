<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SetupLosheet extends Model
{
    use HasFactory;

    protected $table = 'setup_losheet_tbl';

    protected $connection = 'mysql';

    protected $primaryKey = 'id';

    public $timestamps = false; // kasi may custom date_created / date_updated ka

    protected $fillable = [
        'setup_log_id',
        'machine_num',
        'ww',
        'date',
        'shift_time',
        'badge',
        'remarks',
        'fill_type',
        'answers',
        'verifier',
        'reasonfailed',
        'reason',
        'verify_status',
        'date_verify',
        'date_created',
        'date_updated',
    ];

    protected $casts = [
        'answers' => 'array', // optional (if JSON ka dito)
        'reason' => 'string',
        'remarks' => 'string',
    ];
}
