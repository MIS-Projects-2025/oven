<?php

namespace App\Http\Controllers\metalMagazine;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MetalTubeMagazineController extends Controller
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
            'monitoring_tbl',
            [

                'conditions' => function ($query) {
                    return $query
                        ->OrderBy('date_created', 'DESC');
                },

                'searchColumns' => ['date_shift', 'package_type', 'metal_tube', 'magazine', 'performed_by'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $packages = DB::connection('server25')->table('package_list')
            ->select('package_type')
            ->distinct()
            ->orderBy('package_type', 'asc')
            ->get();

        return Inertia::render('MetalMagazine/MetalTubeMagazine', [
            'tableData' => $result['data'],
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
            'date_shift' => 'required',
            'package_type' => 'required',
            'metal_tube' => 'required',
            'magazine' => 'required',
            'performed_by' => 'required',
            'remarks' => 'nullable|string',
        ]);

        DB::connection('mysql')->table('monitoring_tbl')->insert($validated);

        return redirect()->back()->with('success', 'Saved successfully.');
    }

    public function verify($id)
    {
        $record = DB::connection('mysql')
            ->table('monitoring_tbl')
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

        $empName = $empData['emp_name'];

        $stampNo = DB::connection('server25stamp')
            ->table('stamp_list')
            ->where('employee_id', $empId)
            ->value('stamp_no');

        // 🚨 STOP HERE if no stamp
        if (!$stampNo) {
            return redirect()->back()->with('error', 'No stamp number assigned. Please contact your supervisor.');
        }

        // Update using query builder
        DB::connection('mysql')
            ->table('monitoring_tbl')
            ->where('id', $id)
            ->update([
                'verifier_id' => $empId,
                'verifier_name' => $stampNo,
                'created_by' => $empName,
                'date_verify' => Carbon::now(),
            ]);

        return redirect()->back()->with('success', 'Verified successfully.');
    }
}
