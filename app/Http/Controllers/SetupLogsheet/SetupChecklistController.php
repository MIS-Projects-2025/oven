<?php

namespace App\Http\Controllers\SetupLogsheet;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SetupChecklistController extends Controller
{

    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }
    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'mysql',
            'setup_losheet_tbl',
            [
                'conditions' => function ($query) {
                    return $query
                        ->orderBy('date', 'desc');
                },

                'searchColumns' => ['machine_num', 'ww', 'date', 'shift_time', 'badge', 'fill_type', 'verifier'],
            ]
        );



        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $setupChecklistItems = DB::connection('mysql')->table('setup_checklist_item')->get();

        $setupLogsheet = DB::connection('mysql')->table('setup_losheet_tbl')->get();

        $positiveLogsheet = DB::connection('mysql')->table('positive_losheet_tbl')->get();

        $empId = session('emp_data')['emp_id'];

        $stampNo = DB::connection('server25stamp')
            ->table('stamp_list')
            ->where('employee_id', $empId)
            ->value('stamp_no');

        $machineList = DB::connection('server25')->table('machine_non_tnr_list')
            ->whereLike('machine_name', '%Oven%')
            ->where('remarks', 'Active')
            ->get();

        $PositivechecklistItems = DB::connection('mysql')->table('positive_checklist_item')->get();

        // dd($stampNo);

        return Inertia::render('SetupLogsheet/SetupChecklist', [
            'tableData' => $result['data'],
            'setupChecklistItems' => $setupChecklistItems,
            'positiveLogsheet' => $positiveLogsheet,
            'setupLogsheet' => $setupLogsheet,
            'stampNo' => $stampNo,
            'machineList' => $machineList,
            'PositivechecklistItems' => $PositivechecklistItems,
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'dropdownSearchValue',
                'dropdownFields',
            ]),
        ]);
    }

    public function positive($setup_log_id)
    {
        $positiveItems = DB::connection('mysql')->table('positive_losheet_tbl')
            ->where('setup_log_id', $setup_log_id)
            ->get();

        return response()->json($positiveItems);
    }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'machine_num' => 'required|string|max:45',
    //         'ww' => 'required|string|max:45',
    //         'date' => 'required|string|max:45',
    //         'shift_time' => 'required|string|max:45',
    //         'badge' => 'required|string|max:45',
    //         'remarks' => 'nullable|string',
    //         'fill_type' => 'nullable|string|max:45',
    //         'answers' => 'nullable|string',
    //     ]);

    //     // Get today's date in mm/dd/yyyy format
    //     $today = Carbon::today()->format('m/d/Y');

    //     // Only check if the submitted date is today
    //     if ($validated['date'] === $today) {
    //         $existing = DB::connection('mysql')
    //             ->table('setup_losheet_tbl')
    //             ->where('machine_num', $validated['machine_num'])
    //             ->where('ww', $validated['ww'])
    //             ->where('date', $validated['date'])
    //             ->first();

    //         if ($existing) {
    //             return back()->withErrors([
    //                 'duplicate' => '⚠️ This has already been filled out by: '
    //                     . $existing->badge .
    //                     ' on ' . $existing->date .
    //                     ' at ' . $existing->shift_time
    //             ]);
    //         }
    //     }


    //     // ✅ SAVE DATA
    //     $setupId = DB::connection('mysql')
    //         ->table('setup_losheet_tbl')
    //         ->insertGetId([
    //             ...$validated,
    //         ]);

    //     $setupData = DB::connection('mysql')
    //         ->table('setup_losheet_tbl')
    //         ->where('id', $setupId)
    //         ->first();

    //     $PositivechecklistItems = DB::connection('mysql')->table('positive_checklist_item')->get()->toArray();


    //     return Inertia::render('PositiveLogsheet/PositiveChecklist', [
    //         'PositivechecklistItemses' => $PositivechecklistItems,
    //     ]);


    //     return Inertia::render('PositiveLogsheet/PositiveChecklist', [
    //         'setupData' => $setupData,
    //         'setupId' => $setupId,
    //         'PositivechecklistItems' => $PositivechecklistItems,
    //     ]);
    // }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'machine_num' => 'required|string|max:45',
            'ww' => 'required|string|max:45',
            'date' => 'required|string|max:45',
            'shift_time' => 'required|string|max:45',
            'badge' => 'required|string|max:45',
            'remarks' => 'nullable|string',
            'fill_type' => 'nullable|string|max:45',
            'answers' => 'nullable|string',
        ]);

        if (strtolower($validated['fill_type']) === 'start of shift') {
            // Get today's date in mm/dd/yyyy format
            $today = Carbon::today()->format('m/d/Y');

            // Check duplicate
            if ($validated['date'] === $today) {
                $existing = DB::connection('mysql')
                    ->table('setup_losheet_tbl')
                    ->where('machine_num', $validated['machine_num'])
                    ->where('ww', $validated['ww'])
                    ->where('date', $validated['date'])
                    ->first();

                if ($existing) {
                    return back()->withErrors([
                        'duplicate' => '⚠️ This has already been filled out by: '
                            . $existing->badge .
                            ' on ' . $existing->date .
                            ' at ' . $existing->shift_time
                    ]);
                }
            }
        }

        // ✅ Save setup data
        $setupId = DB::connection('mysql')
            ->table('setup_losheet_tbl')
            ->insertGetId([
                ...$validated,
                'date_created' => now(),
                'date_updated' => now(),
            ]);

        $setupData = DB::connection('mysql')
            ->table('setup_losheet_tbl')
            ->where('id', $setupId)
            ->first();

        // ✅ Fetch checklist items
        $positiveChecklistItems = DB::connection('mysql')
            ->table('positive_checklist_item')
            ->get();

        // ✅ Return Inertia with correct props
        return Inertia::render('PositiveLogsheet/PositiveChecklist', [
            'setupData' => $setupData,
            'setupId' => $setupId,
            'positiveChecklistItems' => $positiveChecklistItems,
        ]);
    }




    public function show($id)
    {
        $setup = DB::connection('mysql')->table('setup_losheet_tbl')->find($id);

        if (!$setup) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        return response()->json($setup);
    }

    public function verify($setup_log_id)
    {
        $empId = session('emp_data')['emp_id'];

        $stampNo = DB::connection('server25stamp')
            ->table('stamp_list')
            ->where('employee_id', $empId)
            ->value('stamp_no');

        DB::connection('mysql')
            ->table('setup_losheet_tbl')
            ->where('setup_log_id', $setup_log_id)
            ->update([
                'verify' => $stampNo,
                'date_verify' => Carbon::now(),
            ]);

        return Inertia::render('PositiveLogsheet/PositiveChecklist', [
            'message' => 'Verified successfully'
        ]);
    }
}
