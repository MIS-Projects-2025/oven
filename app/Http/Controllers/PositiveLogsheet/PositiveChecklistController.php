<?php

namespace App\Http\Controllers\PositiveLogsheet;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PositiveChecklistController extends Controller
{

    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }
    // public function index(Request $request)
    // {

    //     $PositivechecklistItems = DB::connection('mysql')->table('positive_checklist_item')->get()->toArray();

    //     return Inertia::render('PositiveLogsheet/PositiveChecklist', [
    //         'PositivechecklistItemses' => $PositivechecklistItems,
    //     ]);
    // }

    public function store(Request $request)
    {
        // Validate incoming data (basic validation)
        $request->validate([
            'machine_num'    => 'required|string|max:45',
            'ww'             => 'required|string|max:45',
            'date'           => 'required|string|max:45',
            'shift_time'     => 'required|string|max:45',
            'badge'          => 'nullable|string|max:45',
            'remarks'        => 'nullable|string',
            'answers'        => 'required|string',
            'fill_type'      => 'required|string|max:45',
        ]);

        try {
            // Generate a unique setup_log_id
            $setupLogId = Str::uuid()->toString();

            DB::connection('mysql')->table('positive_losheet_tbl')->insert([
                'setup_log_id'   => $setupLogId,
                'machine_num'    => $request->machine_num,
                'ww'             => $request->ww,
                'date'           => $request->date,
                'shift_time'     => $request->shift_time,
                'badge'          => $request->badge,
                'remarks'        => $request->remarks,
                'answers'        => $request->answers,
                'fill_type'      => $request->fill_type,
            ]);

            DB::connection('mysql')->table('setup_losheet_tbl')
                ->where('machine_num', ($request->machine_num))
                ->where('ww', ($request->ww))
                ->where('date', ($request->date))
                ->where('shift_time', ($request->shift_time))
                ->where('badge', ($request->badge))
                ->where('fill_type', ($request->fill_type))
                ->update([
                    'setup_log_id' => $setupLogId
                ]);

            return redirect()
                ->route('setup-new.checklist.index')
                ->with('success', 'Checklist saved successfully!');
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to save checklist: ' . $e->getMessage(),
            ], 500);
        }
    }
}
