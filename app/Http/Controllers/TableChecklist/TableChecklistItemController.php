<?php

namespace App\Http\Controllers\TableChecklist;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Pest\Laravel\session;

class TableChecklistItemController extends Controller
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

                // 'conditions' => function ($query) {
                //     return $query
                //         ->whereNot('emp_role', 'superadmin')
                //         ->OrderBy('emp_role', 'ASC');
                // },

                'searchColumns' => ['checklist_item', 'requirement', 'created_by', 'created_at'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('TableChecklist/TableChecklistItem', [
            'tableData' => $result['data'],
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
            'checklist_item' => 'required|string|max:255',
            'requirement'    => 'nullable|string',
            'activity'       => 'nullable|string',
            'frequency'      => 'nullable|string',
            'created_by'     => 'required|string|max:255',
        ]);

        // 🔍 Check kung existing na ang checklist_item
        $exists = DB::connection('mysql')
            ->table('working_tbl_checklist')
            ->whereRaw('LOWER(checklist_item) = ?', [
                strtolower(trim($validated['checklist_item']))
            ])
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'warning',
                    'message' => 'Checklist item already exists.'
                ])
                ->withErrors([
                    'checklist_item' => 'Checklist item already exists.'
                ])
                ->withInput();
        }

        // ✅ Insert if not existing
        DB::connection('mysql')
            ->table('working_tbl_checklist')
            ->insert([
                'checklist_item' => trim($validated['checklist_item']),
                'requirement'    => $validated['requirement'] ?? null,
                'activity'       => $validated['activity'] ?? null,
                'frequency'      => $validated['frequency'] ?? null,
                'created_by'     => $validated['created_by'],
            ]);

        return redirect()
            ->back()
            ->with('flash', [
                'type' => 'success',
                'message' => 'Checklist item created successfully.'
            ]);
    }


    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'checklist_item' => 'required|string',
            'requirement' => 'required|string',
            'activity' => 'nullable|string',
            'frequency' => 'nullable|string',
            'updated_by' => 'required|string|max:255',
        ]);

        DB::connection('mysql')
            ->table('working_tbl_checklist')
            ->where('id', $id)
            ->update([
                'checklist_item' => $validated['checklist_item'],
                'requirement' => $validated['requirement'],
                'activity' => $validated['activity'],
                'frequency' => $validated['frequency'],
                'updated_by' => $validated['updated_by'],
            ]);

        return redirect()->back()->with('success', 'Checklist item updated successfully.');
    }
}
