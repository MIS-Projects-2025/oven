<?php

namespace App\Http\Controllers\Capability;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use App\Models\CapabilityMatrix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CapabilityMatrixController extends Controller
{
    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }


    public function index(Request $request)
    {
        // ============================================
        // STATIC DROPDOWN SOURCES
        // ============================================

        $machines = DB::connection('server25')
            ->table('machine_list')
            ->select('machine_num', 'machine_manufacturer')
            ->distinct()
            ->get();

        $packages = DB::connection('server25')
            ->table('package_list')
            ->select('package_type', 'lead_count', 'dimensions', 'devicename')
            ->get()
            ->groupBy('devicename')
            ->map(fn($group) => $group->first())
            ->values();

        $customers = DB::connection('server25')
            ->table('customer_list')
            ->select('customer_name')
            ->distinct()
            ->get();

        $areas = DB::connection('mysql')
            ->table('productline_list')
            ->select('productline')
            ->distinct()
            ->get();

        // ============================================
        // BASE QUERY
        // ============================================

        $baseQuery = DB::connection('mysql')
            ->table('capability_matrix');

        $filterFields = [
            'devicename',
            'machine',
            'customer',
            'areas',
            'package',
        ];

        // ============================================
        // SEARCH
        // ============================================

        if ($request->filled('search')) {
            $search = $request->search;

            $baseQuery->where(function ($q) use ($search) {
                $q->where('devicename', 'like', "%{$search}%")
                    ->orWhere('machine', 'like', "%{$search}%")
                    ->orWhere('machine_brand', 'like', "%{$search}%")
                    ->orWhere('package', 'like', "%{$search}%")
                    ->orWhere('dimensions', 'like', "%{$search}%")
                    ->orWhere('inspection_capability', 'like', "%{$search}%")
                    ->orWhere('customer', 'like', "%{$search}%")
                    ->orWhere('areas', 'like', "%{$search}%");
            });
        }

        // ============================================
        // DYNAMIC FILTERS
        // ============================================

        foreach ($filterFields as $field) {
            if ($request->filled($field)) {
                $baseQuery->where($field, $request->$field);
            }
        }

        // ============================================
        // DATE FILTER (IMPORTANT)
        // ============================================

        if ($request->filled('start')) {
            $baseQuery->whereDate('date_created', '>=', $request->start);
        }

        if ($request->filled('end')) {
            $baseQuery->whereDate('date_created', '<=', $request->end);
        }

        // ============================================
        // EXPORT (SAME FILTERS APPLIED)
        // ============================================

        if ($request->filled('export')) {

            $rows = $baseQuery->get();

            return response()->streamDownload(function () use ($rows) {

                $file = fopen('php://output', 'w');

                if ($rows->isNotEmpty()) {

                    // headers
                    fputcsv($file, array_keys((array) $rows->first()));

                    foreach ($rows as $row) {
                        fputcsv($file, (array) $row);
                    }
                }

                fclose($file);
            }, 'export.csv', [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Cache-Control' => 'no-store, no-cache',
            ]);
        }

        // ============================================
        // SORTING
        // ============================================

        $sortBy = $request->sortBy ?? 'date_created';
        $sortDirection = $request->sortDirection ?? 'DESC';

        $baseQuery->orderBy($sortBy, $sortDirection);

        // ============================================
        // PAGINATION
        // ============================================

        $perPage = $request->perPage ?? 10;

        $tableData = $baseQuery
            ->paginate($perPage)
            ->withQueryString();

        // ============================================
        // CASCADING FILTER OPTIONS (OPTIONAL)
        // ============================================

        $filterQuery = DB::connection('mysql')->table('capability_matrix');

        foreach ($filterFields as $field) {
            if ($request->filled($field)) {
                $filterQuery->where($field, $request->$field);
            }
        }

        $filterOptions = [
            'devicename' => (clone $filterQuery)
                ->select('devicename')->distinct()->pluck('devicename')->values(),

            'machines' => (clone $filterQuery)
                ->select('machine')->distinct()->pluck('machine')->values(),

            'customers' => (clone $filterQuery)
                ->select('customer')->distinct()->pluck('customer')->values(),

            'areas' => (clone $filterQuery)
                ->select('areas')->distinct()->pluck('areas')->values(),

            'packages' => (clone $filterQuery)
                ->select('package')->distinct()->pluck('package')->values(),
        ];

        // ============================================
        // RETURN
        // ============================================

        return Inertia::render('Capability/CapabilityMatrix', [
            'tableData' => $tableData,
            'machines' => $machines,
            'packages' => $packages,
            'customers' => $customers,
            'areas' => $areas,
            'filterOptions' => $filterOptions,
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'machine',
                'customer',
                'areas',
                'package',
            ]),
        ]);
    }

    public function export(Request $request)
    {
        $baseQuery = DB::connection('mysql')
            ->table('capability_matrix');

        // =========================
        // APPLY SAME FILTERS
        // =========================

        if ($request->filled('search')) {
            $search = $request->search;

            $baseQuery->where(function ($q) use ($search) {
                $q->where('devicename', 'like', "%{$search}%")
                    ->orWhere('machine', 'like', "%{$search}%")
                    ->orWhere('customer', 'like', "%{$search}%")
                    ->orWhere('areas', 'like', "%{$search}%");
            });
        }

        $filterFields = ['devicename', 'machine', 'customer', 'areas', 'package'];

        foreach ($filterFields as $field) {
            if ($request->filled($field)) {
                $baseQuery->where($field, $request->$field);
            }
        }

        // DATE FILTER
        if ($request->filled('start')) {
            $baseQuery->whereDate('date_created', '>=', $request->start);
        }

        if ($request->filled('end')) {
            $baseQuery->whereDate('date_created', '<=', $request->end);
        }

        // =========================
        // GET DATA
        // =========================

        $rows = $baseQuery->get();

        // =========================
        // OUTPUT CSV (PURE PHP)
        // =========================

        $filename = 'capability-matrix-' . now()->format('Y-m-d') . '.csv';

        header('Content-Type: text/csv');
        header("Content-Disposition: attachment; filename={$filename}");

        $output = fopen('php://output', 'w');

        if ($rows->count()) {

            fputcsv($output, array_keys((array) $rows->first()));

            foreach ($rows as $row) {
                fputcsv($output, (array) $row);
            }
        }

        fclose($output);
        exit;
    }


    public function store(Request $request)
    {
        try {

            $items = $request->items;

            // DEBUG
            logger($items);

            if (!$items || !count($items)) {
                return back()->withErrors([
                    'message' => 'No items received'
                ]);
            }

            DB::beginTransaction();

            foreach ($items as $item) {

                CapabilityMatrix::create([
                    'machine' => $item['machine'] ?? null,
                    'machine_brand' => $item['machine_brand'] ?? null,
                    'inspection_capability' => $item['inspection_capability'] ?? null,
                    'package' => $item['package'] ?? null,
                    'dimensions' => $item['dimensions'] ?? null,
                    'devicename' => $item['devicename'] ?? null,
                    'customer' => $item['customer'] ?? null,
                    'areas' => $item['areas'] ?? null,

                    'd3' => $item['d3'] ?? null,
                    'd2' => $item['d2'] ?? null,
                    'term_distance' => $item['term_distance'] ?? null,
                    'leadBurr' => $item['leadBurr'] ?? null,
                    'padBurr' => $item['padBurr'] ?? null,
                    'padContain' => $item['padContain'] ?? null,
                    'padDiscoloration' => $item['padDiscoloration'] ?? null,
                    'tightendBH' => $item['tightendBH'] ?? null,
                    'markTop' => $item['markTop'] ?? null,
                    'pinTop' => $item['pinTop'] ?? null,
                    'crackTop' => $item['crackTop'] ?? null,
                    'chipoutTop' => $item['chipoutTop'] ?? null,
                    'scratchTop' => $item['scratchTop'] ?? null,

                    'markip' => $item['markip'] ?? null,
                    'pinip' => $item['pinip'] ?? null,
                    'tipip' => $item['tipip'] ?? null,
                    'pitchip' => $item['pitchip'] ?? null,
                    'leadVariance' => $item['leadVariance'] ?? null,
                    'crack' => $item['crack'] ?? null,
                    'chipout' => $item['chipout'] ?? null,
                    'scratch' => $item['scratch'] ?? null,

                    'arr' => $item['arr'] ?? null,
                    'tubetube' => $item['tubetube'] ?? null,
                    'tubetape' => $item['tubetape'] ?? null,
                    'tapetube' => $item['tapetube'] ?? null,
                    'tubetray' => $item['tubetray'] ?? null,
                    'traytray' => $item['traytray'] ?? null,
                    'traytape' => $item['traytape'] ?? null,
                    'tapetray' => $item['tapetray'] ?? null,
                    'tryjewelbox' => $item['tryjewelbox'] ?? null,
                    'canistertray' => $item['canistertray'] ?? null,
                    'canistertape' => $item['canistertape'] ?? null,
                    'tapetape' => $item['tapetape'] ?? null,

                    'withAuxillary' => $item['withAuxillary'] ?? null,
                    'ColoredCamera' => $item['ColoredCamera'] ?? null,
                    'detape' => $item['detape'] ?? null,
                    'machineLearn' => $item['machineLearn'] ?? null,
                    'created_by' => session('emp_data')['emp_name'] ?? null,
                    'created_date' => Carbon::now(),
                ]);
            }

            DB::commit();

            return back()->with([
                'success' => 'Capability Matrix saved successfully'
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            logger($e);

            return back()->withErrors([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $matrix = CapabilityMatrix::findOrFail($id);

            $matrix->update([
                'machine' => $request->machine,
                'machine_brand' => $request->machine_brand,
                'inspection_capability' => $request->inspection_capability,
                'package' => $request->package,
                'dimensions' => $request->dimensions,
                'devicename' => $request->devicename,
                'customer' => $request->customer,
                'areas' => $request->areas,

                'd3' => $request->d3,
                'd2' => $request->d2,
                'term_distance' => $request->term_distance,
                'leadBurr' => $request->leadBurr,
                'padBurr' => $request->padBurr,
                'padContain' => $request->padContain,
                'padDiscoloration' => $request->padDiscoloration,
                'tightendBH' => $request->tightendBH,

                'markTop' => $request->markTop,
                'pinTop' => $request->pinTop,
                'crackTop' => $request->crackTop,
                'chipoutTop' => $request->chipoutTop,
                'scratchTop' => $request->scratchTop,

                'markip' => $request->markip,
                'pinip' => $request->pinip,
                'tipip' => $request->tipip,
                'pitchip' => $request->pitchip,
                'leadVariance' => $request->leadVariance,

                'crack' => $request->crack,
                'chipout' => $request->chipout,
                'scratch' => $request->scratch,

                'arr' => $request->arr,
                'tubetube' => $request->tubetube,
                'tubetape' => $request->tubetape,
                'tapetube' => $request->tapetube,
                'tubetray' => $request->tubetray,
                'traytray' => $request->traytray,
                'traytape' => $request->traytape,
                'tapetray' => $request->tapetray,
                'tryjewelbox' => $request->tryjewelbox,
                'canistertray' => $request->canistertray,
                'canistertape' => $request->canistertape,
                'tapetape' => $request->tapetape,

                'withAuxillary' => $request->withAuxillary,
                'ColoredCamera' => $request->ColoredCamera,
                'detape' => $request->detape,
                'machineLearn' => $request->machineLearn,
            ]);

            return back()->with([
                'success' => 'Updated successfully!'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function destroy($id)
    {
        try {
            DB::connection('mysql')
                ->table('capability_matrix')
                ->where('id', $id)
                ->delete();

            return redirect()
                ->route('capability.matrix.index')
                ->with('success', 'Deleted successfully');
        } catch (\Exception $e) {

            return redirect()
                ->route('capability.matrix.index')
                ->with('error', 'Delete failed');
        }
    }
}
