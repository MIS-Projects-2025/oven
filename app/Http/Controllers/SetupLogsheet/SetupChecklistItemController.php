<?php

namespace App\Http\Controllers\SetupLogsheet;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Pest\Laravel\session;

class SetupChecklistItemController extends Controller
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
            'setup_checklist_item',
            [

                // 'conditions' => function ($query) {
                //     return $query
                //         ->whereNot('emp_role', 'superadmin')
                //         ->OrderBy('emp_role', 'ASC');
                // },

                'searchColumns' => ['check_item', 'frequency', 'responsible', 'fill_type', 'created_by', 'created_at'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('SetupLogsheet/SetupChecklistItem', [
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
            'check_item' => 'required|string|max:255',
            'frequency'    => 'nullable|string',
            'responsible'       => 'nullable|string',
            'fill_type'      => 'nullable|string',
            'created_by'     => 'required|string|max:255',
        ]);

        // 🔍 Check kung existing na ang checklist_item
        $exists = DB::connection('mysql')
            ->table('setup_checklist_item')
            ->whereRaw('LOWER(check_item) = ?', [
                strtolower(trim($validated['check_item']))
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
                    'check_item' => 'Checklist item already exists.'
                ])
                ->withInput();
        }

        // ✅ Insert if not existing
        DB::connection('mysql')
            ->table('setup_checklist_item')
            ->insert([
                'check_item' => trim($validated['check_item']),
                'frequency'    => $validated['frequency'] ?? null,
                'responsible'       => $validated['responsible'] ?? null,
                'fill_type'      => $validated['fill_type'] ?? null,
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
            'check_item' => 'required|string',
            'frequency' => 'required|string',
            'responsible' => 'nullable|string',
            'fill_type' => 'nullable|string',
            'updated_by' => 'required|string|max:255',
        ]);

        DB::connection('mysql')
            ->table('setup_checklist_item')
            ->where('id', $id)
            ->update([
                'check_item' => $validated['check_item'],
                'frequency' => $validated['frequency'],
                'responsible' => $validated['responsible'],
                'fill_type' => $validated['fill_type'],
                'updated_by' => $validated['updated_by'],
            ]);

        return redirect()->back()->with('success', 'Checklist item updated successfully.');
    }
}
