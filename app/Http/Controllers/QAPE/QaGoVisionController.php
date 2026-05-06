<?php

namespace App\Http\Controllers\QAPE;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QaGoVisionController extends Controller
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
            'eeportal',
            'vision_setup_tbl',
            [
                'conditions' => function ($query) {
                    return $query
                        ->where(function ($q) {
                            $q->whereNull('verifier')
                                ->orWhere('verifier', '');
                        });
                },

                'searchColumns' => ['date', 'machine', 'package_type', 'verifier'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $machines = DB::connection('server25')->table('machine_list')
            ->select('machine_num', 'machine_type')
            ->where('machine_num', '!=', '')
            ->where('machine_num', '!=', 'N/A')
            ->where('machine_type', '!=', 'N/A')
            ->whereNotIn('machine_type', ['Air Ionizer', 'Granite', 'Microscope', 'NON T&R'])
            ->whereNotNull('machine_type')
            ->distinct()
            ->orderBy('machine_type', 'asc')
            ->get();

        $packages = DB::connection('server25')->table('package_list')
            ->select('package_type', 'lead_count')
            ->distinct()
            ->orderBy('package_type', 'asc')
            ->get();

        return Inertia::render('QAPE/QaGoVision', [
            'tableData' => $result['data'],
            'machines' => $machines,
            'packages' => $packages,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'machine' => 'required',
            'package_type' => 'required',
            'samp_no_reject' => 'required|integer',
            'samp_no_good' => 'required|integer',
            'result_no_reject' => 'required|integer',
            'result_no_good' => 'required|integer',
            'result' => 'required|in:Pass,Fail',
            'remarks' => 'nullable|string',
        ]);

        $validated['date'] = Carbon::now()->format('m/d/Y');
        $validated['created_by'] = session('emp_data')['emp_name'];
        $validated['date_created'] =  Carbon::now();

        DB::connection('eeportal')->table('vision_setup_tbl')->insert($validated);

        return redirect()->back()->with('success', 'Saved successfully.');
    }

    public function verify($id)
    {
        $record = DB::connection('eeportal')
            ->table('vision_setup_tbl')
            ->where('id', $id)
            ->first();

        if (!$record) {
            abort(404, 'Record not found');
        }

        // Optional security check
        if (session('emp_data')['emp_dept'] !== 'Quality Assurance') {
            abort(403, 'Unauthorized.');
        }

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

        // Update using query builder
        DB::connection('eeportal')
            ->table('vision_setup_tbl')
            ->where('id', $id)
            ->update([
                'verifier' => $stampNo,
                'date_verify' => Carbon::now(),
            ]);

        return redirect()->back()->with('success', 'Verified successfully.');
    }
}
