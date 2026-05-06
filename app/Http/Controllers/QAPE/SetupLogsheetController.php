<?php

namespace App\Http\Controllers\QAPE;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SetupLogsheetController extends Controller
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
                        ->where('fill_type', 'Setup')
                        ->where(function ($q) {
                            $q->whereNull('verifier')
                                ->orWhere('verifier', '');
                        });
                },


                'searchColumns' => ['machine_num', 'ww', 'date', 'shift_time', 'badge', 'fill_type'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $empData = session('emp_data');

        $empId = $empData['emp_id'];

        $stampNo = DB::connection('server25stamp')
            ->table('stamp_list')
            ->where('employee_id', $empId)
            ->value('stamp_no');

        $positiveLogsheet = DB::connection('mysql')->table('positive_losheet_tbl')->get();

        return Inertia::render('QAPE/Logsheet', [
            'tableData' => $result['data'],
            'stampNo' => $stampNo,
            'positiveLogsheet' => $positiveLogsheet,
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

    public function verify(Request $request, $setup_log_id)
    {

        // dd($setup_log_id);

        $empData = session('emp_data');

        if (!$empData || !isset($empData['emp_id'])) {
            return redirect()->back()->with('error', 'Session expired. Please login again.');
        }

        $empId = $empData['emp_id'];

        $stampNo = DB::connection('server25stamp')
            ->table('stamp_list')
            ->where('employee_id', $empId)
            ->value('stamp_no');

        // 🚨 STOP HERE if no stamp
        if (!$stampNo) {
            return redirect()->back()->with('error', 'No stamp number assigned. Please contact your supervisor.');
        }

        DB::connection('mysql')
            ->table('setup_losheet_tbl')
            ->where('setup_log_id', $setup_log_id)
            ->update([
                'verifier' => $stampNo,
                'verify_status' => 'Passed',
                'date_verify' => Carbon::now(),
            ]);

        DB::connection('mysql')
            ->table('positive_losheet_tbl')
            ->where('setup_log_id', $setup_log_id)
            ->update([
                'verifier' => $stampNo,
                'verify_status' => 'Passed',
                'date_verify' => Carbon::now(),
            ]);

        return redirect()->back()->with('success', 'Verified successfully');
    }

    //incase kung required may failed na verification
    // public function verifyFailed(Request $request, $setup_log_id)
    // {

    //     $request->validate([
    //         'reasonfailed' => 'required|string'
    //     ]);

    //     $empData = session('emp_data');

    //     if (!$empData || !isset($empData['emp_id'])) {
    //         return redirect()->back()->with('error', 'Session expired. Please login again.');
    //     }

    //     $empId = $empData['emp_id'];

    //     $stampNo = DB::connection('server25stamp')
    //         ->table('stamp_list')
    //         ->where('employee_id', $empId)
    //         ->value('stamp_no');

    //     // 🚨 STOP HERE if no stamp
    //     if (!$stampNo) {
    //         return redirect()->back()->with('error', 'No stamp number assigned. Please contact your supervisor.');
    //     }

    //     $reasonfailed = $request->reasonfailed;

    //     DB::connection('mysql')
    //         ->table('setup_losheet_tbl')
    //         ->where('setup_log_id', $setup_log_id)
    //         ->update([
    //             'verifier' => $stampNo,
    //             'verify_status' => 'Failed',
    //             'reasonfailed' => $reasonfailed,
    //             'date_verify' => Carbon::now(),
    //         ]);

    //     DB::connection('mysql')
    //         ->table('positive_losheet_tbl')
    //         ->where('setup_log_id', $setup_log_id)
    //         ->update([
    //             'verifier' => $stampNo,
    //             'verify_status' => 'Failed',
    //             'reasonfailed' => $reasonfailed,
    //             'date_verify' => Carbon::now(),
    //         ]);

    //     return redirect()->back()->with('success', 'Verified successfully');
    // }


    public function modify(Request $request, $setup_log_id)
    {
        $request->validate([
            'updated_answers' => 'required|array',
            'reason' => 'required|string'
        ]);

        $empData = session('emp_data');

        $empId = $empData['emp_id'];
        $empName = $empData['emp_name'];

        $answers = $request->updated_answers;
        $reason = $request->reason;

        foreach ($answers as $answer) {

            DB::connection('mysql')
                ->table('positive_losheet_tbl')
                ->where('setup_log_id', $setup_log_id) // safety layer
                ->update([
                    'answers' => $answers,
                    'modified_by' => $empId, // add this
                    'reason' => $reason,
                    'modified_date' => Carbon::now(),
                ]);
        }

        return redirect()->back()->with('success', 'Modified successfully');
    }

    public function update(Request $request, $setup_log_id)
    {
        $request->validate([
            'updated_answers' => 'required|array',
        ]);

        $answers = $request->updated_answers;

        foreach ($answers as $answer) {

            DB::connection('mysql')
                ->table('positive_losheet_tbl')
                ->where('setup_log_id', $setup_log_id) // safety layer
                ->update([
                    'answers' => $answers,
                ]);
        }

        return redirect()->back()->with('success', 'Modified successfully');
    }
}
