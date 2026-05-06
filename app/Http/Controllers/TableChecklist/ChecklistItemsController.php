<?php

namespace App\Http\Controllers\TableChecklist;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChecklistItemsController extends Controller
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
            'working_tbl_checklist',
            [


                'conditions' => function ($query) {
                    return $query
                        ->select(
                            'category',
                            DB::raw('MIN(checklist_item) as checklist_item'),
                            DB::raw('MIN(requirement) as requirement'),
                            DB::raw('MIN(created_by) as created_by'),
                            DB::raw('MIN(date_created) as date_created')
                        )
                        ->groupBy('category')
                        ->orderBy('category', 'desc');
                },

                'searchColumns' => ['category', 'created_by'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $checkItem = DB::connection('mysql')
            ->table('working_tbl_checklist')
            ->get();

        return Inertia::render('TableChecklist/ChecklistItems', [
            'tableData' => $result['data'],
            'checkItem' => $checkItem,
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
        // =========================
        // VALIDATION
        // =========================
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],

            'items.*.category' => ['required', 'string', 'max:45'],
            'items.*.checklist_item' => ['required', 'string', 'max:255'],
            'items.*.requirement' => ['nullable', 'string', 'max:255'],
            'items.*.activity' => ['required', 'string', 'max:255'],
            'items.*.frequency' => ['required', 'string', 'max:255'],
        ]);

        // =========================
        // PREPARE DATA FOR INSERT
        // =========================
        $now = now();

        $data = collect($validated['items'])->map(function ($item) use ($now) {
            return [
                'category'       => $item['category'],
                'checklist_item' => $item['checklist_item'],
                'requirement'    => $item['requirement'] ?? NULL,
                'activity'       => $item['activity'],
                'frequency'      => $item['frequency'],
                'created_by'     => session('emp_data')['emp_name'] ?? NULL,
            ];
        })->toArray();

        // =========================
        // BULK INSERT (TRANSACTION)
        // =========================
        DB::transaction(function () use ($data) {
            DB::table('working_tbl_checklist')->insert($data);
        });

        return back()->with('success', 'Checklist items saved successfully.');
    }

    public function update(Request $request, $id)
    {
        DB::table('working_tbl_checklist')
            ->where('id', $id)
            ->update([
                'checklist_item' => $request->checklist_item,
                'requirement'    => $request->requirement,
                'activity'       => $request->activity,
                'frequency'      => $request->frequency,
                'updated_by'     => session('emp_data')['emp_name'] ?? NULL,
            ]);

        return back()->with('success', 'Checklist updated');
    }
}
