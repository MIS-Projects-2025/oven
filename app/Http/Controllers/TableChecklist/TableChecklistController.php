<?php

namespace App\Http\Controllers\TableChecklist;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TableChecklistController extends Controller
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
            'table_checklist',
            [
                'conditions' => function ($query) {
                    return $query
                        ->select('table_name', 'area', 'shift', 'ww')
                        ->distinct()
                        ->orderBy('ww', 'desc');
                },
                'searchColumns' => ['table_name', 'area', 'shift', 'ww'],
            ]
        );


        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        $categories = DB::connection('mysql')
            ->table('working_tbl_checklist')
            ->select('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('TableChecklist/TableChecklist', [
            'tableData' => $result['data'],
            'categories' => $categories,
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



            // ✅ MASTER CHECKLIST ITEMS
            'checklistItems' => DB::table('working_tbl_checklist')
                ->select('id', 'category', 'checklist_item', 'requirement', 'activity', 'frequency')
                ->orderBy('id')
                ->get(),

            // ✅ TABLE DROPDOWN
            'tables' => DB::table('table_tbl')
                ->select('table_name')
                ->orderBy('table_name')
                ->get(),

            // ✅ AREA DROPDOWN
            'areas' => DB::table('location_tbl')
                ->select('location_name')
                ->orderBy('location_name')
                ->get(),

            // ✅ EMP DATA
            'emp_data' => session('emp_data'),
        ]);
    }




    public function store(Request $request)
    {
        $newChecklist = $request->checklist_item;

        $existingRecord = DB::table('table_checklist')
            ->where('table_name', $request->table_name)
            ->where('area', $request->area)
            ->where('shift', $request->shift)
            ->where('ww', $request->ww)
            ->first();

        if ($existingRecord) {
            $existingChecklist = json_decode($existingRecord->checklist_item, true);

            $conflicts = collect($newChecklist)->filter(function ($newItem) use ($existingChecklist) {
                foreach ($existingChecklist as $existingItem) {
                    if (
                        $existingItem['day'] === $newItem['day'] &&
                        $existingItem['date_performed'] === $newItem['date_performed'] &&
                        $existingItem['checklist_item'] === $newItem['checklist_item']
                    ) {
                        return true;
                    }
                }
                return false;
            });

            if ($conflicts->isNotEmpty()) {
                $firstConflict = $conflicts->first();
                $conflictMessage = "Checklist for <br/>
                                    <b>Table</b>: '{$request->table_name}'<br/>
                                    <b>Area</b>: '{$request->area}'<br/>
                                    <b>Shift</b>: '{$request->shift}'<br/>
                                    <b>Workweek</b>: '{$request->ww}'<br/>
                                    <b>Day</b>: '{$firstConflict['day']}'<br/>
                                    <b>Date</b>: '{$firstConflict['date_performed']}' <br/>
                                    Already exists.
                                   ";
                return redirect()->back()->with('error', $conflictMessage);
            }

            $mergedChecklist = array_merge($existingChecklist, $newChecklist);

            DB::table('table_checklist')
                ->where('id', $existingRecord->id)
                ->update([
                    'checklist_item' => json_encode($mergedChecklist, JSON_UNESCAPED_UNICODE),
                ]);

            return redirect()->back()->with('success', 'Checklist updated successfully!');
        }

        DB::table('table_checklist')->insert([
            'table_name'     => $request->table_name,
            'area'           => $request->area,
            'shift'          => $request->shift,
            'ww'             => $request->ww,
            'checklist_item' => json_encode($newChecklist, JSON_UNESCAPED_UNICODE),
        ]);

        return redirect()->back()->with('success', 'Checklist saved successfully!');
    }



    public function view(Request $request)
    {
        $row = DB::table('table_checklist')
            ->where('table_name', $request->table_name)
            ->where('area', $request->area)
            ->where('shift', $request->shift)
            ->where('ww', $request->ww)
            ->first();

        if (!$row) {
            return response()->json(['checklist' => []]);
        }

        return response()->json([
            'checklist' => json_decode($row->checklist_item, true),
        ]);
    }
}
