<?php

namespace App\Http\Controllers\Capacity;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CapacityController extends Controller
{
    protected $datatable;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }

    public function index(Request $request)
    {
        // DataTable
        $result = $this->datatable->handle(
            $request,
            'mysql',
            'capacity_tbl',
            [
                'conditions' => fn($query) => $query->orderBy('id', 'DESC'),
                'searchColumns' => [
                    'package_type',
                    'lead_count',
                    'dimensions',
                    'capacity',
                    'metal_magazine',
                    'qty_per_magazine',
                    'metal_tube',
                    'qty_per_tube'
                ],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        /*
    |--------------------------------------------------------------------------
    | RAW TOTALS
    |--------------------------------------------------------------------------
    */
        $totals = DB::connection('mysql')->table('capacity_tbl')
            ->selectRaw("
            SUM(CAST(REPLACE(capacity, ',', '') AS UNSIGNED)) AS total_capacity,
            SUM(CAST(REPLACE(metal_magazine, ',', '') AS UNSIGNED)) AS total_magazine,
            SUM(CAST(REPLACE(metal_tube, ',', '') AS UNSIGNED)) AS total_tube
        ")
            ->first();

        $totalCapacity = $totals->total_capacity ?? 0;
        $totalMetalMagazine = $totals->total_magazine ?? 0;
        $totalMetalTube = $totals->total_tube ?? 0;

        /*
    |--------------------------------------------------------------------------
    | PACKAGES
    |--------------------------------------------------------------------------
    */
        $packages = DB::connection('server25')
            ->table('package_list')
            ->select('package_type')
            ->distinct()
            ->orderBy('package_type', 'asc')
            ->get();

        /*
    |--------------------------------------------------------------------------
    | MAIN COMPUTATION
    |--------------------------------------------------------------------------
    */
        $capacityRows = DB::connection('mysql')->table('capacity_tbl')->get();

        $total_capacity_sum = 0;
        $total_metal_magazine_sum = 0;
        $total_metal_tube_sum = 0;

        foreach ($capacityRows as $row) {

            $package_type = trim($row->package_type);

            /*
        |--------------------------------------------------------------------------
        | BAKING DATA (ONGOING LANG PARA WALANG DOUBLE COUNT)
        |--------------------------------------------------------------------------
        */
            $ongoing = DB::connection('bake')->table('dbakeformtable')
                ->whereRaw('TRIM(package) = ?', [$package_type])
                ->whereIn('bake_status', ['inuse', 'cooldown'])
                ->sum('quantity') ?? 0;

            $used = (float) $ongoing;

            /*
        |--------------------------------------------------------------------------
        | CLEAN CAPACITY
        |--------------------------------------------------------------------------
        */
            $capacity = (float) str_replace(',', '', $row->capacity);

            /*
        |--------------------------------------------------------------------------
        | REMAINING CAPACITY
        |--------------------------------------------------------------------------
        */
            $remaining_capacity = max(0, $capacity - $used);
            $total_capacity_sum += $remaining_capacity;

            /*
        |--------------------------------------------------------------------------
        | METAL MAGAZINE
        |--------------------------------------------------------------------------
        */
            $qty_per_magazine = (float) str_replace(',', '', $row->qty_per_magazine);

            if ($qty_per_magazine > 0) {
                $total_units = $capacity / $qty_per_magazine;
                $used_units = $used / $qty_per_magazine;

                $remaining_metal_magazine = max(0, $total_units - $used_units);
            } else {
                $remaining_metal_magazine = 0;
            }

            $total_metal_magazine_sum += $remaining_metal_magazine;

            /*
        |--------------------------------------------------------------------------
        | METAL TUBE
        |--------------------------------------------------------------------------
        */
            $qty_per_tube = (float) str_replace(',', '', $row->qty_per_tube);

            if ($qty_per_tube > 0) {
                $total_units = $capacity / $qty_per_tube;
                $used_units = $used / $qty_per_tube;

                $remaining_metal_tube = max(0, $total_units - $used_units);
            } else {
                $remaining_metal_tube = 0;
            }

            $total_metal_tube_sum += $remaining_metal_tube;
        }

        /*
    |--------------------------------------------------------------------------
    | ROUND OFF (2 DECIMAL PLACES)
    |--------------------------------------------------------------------------
    */
        $total_capacity_sum = round($total_capacity_sum, 2);
        $total_metal_magazine_sum = round($total_metal_magazine_sum, 2);
        $total_metal_tube_sum = round($total_metal_tube_sum, 2);

        /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */
        return Inertia::render('Capacity/MetalCapacity', [
            'tableData' => $result['data'],
            'packages' => $packages,

            'totalCapacity' => $totalCapacity,
            'totalMetalMagazine' => $totalMetalMagazine,
            'totalMetalTube' => $totalMetalTube,

            'totalCapacitySum' => $total_capacity_sum,
            'totalMetalMagazineSum' => $total_metal_magazine_sum,
            'totalMetalTubeSum' => $total_metal_tube_sum,

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

    public function getFilteredOptions(Request $request)
    {
        $package = $request->package_type;
        $lead = $request->lead_count;

        if (!$package) {
            return response()->json([
                'leads' => [],
                'dimensions' => [],
            ]);
        }

        // STEP 1: Filter leads by package
        $leads = DB::connection('server25')
            ->table('package_list')
            ->where('package_type', $package)
            ->where('dimensions', '!=', '')
            ->whereNotIn('dimensions', [' ', '--', 'N/A', 'NA'])
            ->whereNotNull('lead_count')
            ->select('lead_count')
            ->distinct()
            ->orderByRaw('CAST(lead_count AS UNSIGNED) ASC')
            ->get();

        // STEP 2: Filter dimensions by package + lead_count
        $dimensionQuery = DB::connection('server25')
            ->table('package_list')
            ->where('package_type', $package)
            ->where('lead_count', $lead)
            ->whereNotNull('dimensions')
            ->where('dimensions', '!=', '')
            ->whereNotIn('dimensions', [' ', '--', 'N/A', 'NA']);

        // if ($lead) {
        //     $dimensionQuery->where('lead_count', $lead);
        // }

        $dimensions = $dimensionQuery
            ->select('dimensions')
            ->where('dimensions', '!=', '')
            ->whereNotIn('dimensions', [' ', '--', 'N/A', 'NA'])
            ->distinct()
            ->orderBy('dimensions', 'asc')
            ->get();

        return response()->json([
            'leads' => $leads->values(),
            'dimensions' => $dimensions->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_type' => 'required',
            'lead_count' => 'required',
            'dimensions' => 'required',
            'capacity' => 'required',
            'metal_magazine' => 'nullable',
            'qty_per_magazine' => 'nullable',
            'metal_tube' => 'nullable',
            'qty_per_tube' => 'nullable',
            'remarks' => 'nullable|string',
        ]);

        DB::connection('mysql')->table('capacity_tbl')->insert([
            'package_type' => $validated['package_type'],
            'lead_count' => $validated['lead_count'],
            'dimensions' => $validated['dimensions'],
            'capacity' => $validated['capacity'],
            'metal_magazine' => $validated['metal_magazine'],
            'qty_per_magazine' => $validated['qty_per_magazine'],
            'metal_tube' => $validated['metal_tube'],
            'qty_per_tube' => $validated['qty_per_tube'],
            'remarks' => $validated['remarks'] ?? null,
            'created_by' => session('emp_data')['emp_name'] ?? 'system',
        ]);

        return redirect()->route('capacity.index')
            ->with('success', 'Metal Capacity added successfully.');
    }
}
