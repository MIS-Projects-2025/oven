<?php

namespace App\Http\Controllers\TableChecklist;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Pest\Laravel\session;

class TableListController extends Controller
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
            'table_tbl',
            [

                'conditions' => function ($query) {
                    return $query
                        ->OrderBy('table_area', 'ASC');
                },

                'searchColumns' => ['table_name', 'table_area', 'table_description', 'created_by', 'date_created'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('TableChecklist/TableList', [
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
            'table_name' => 'required|string|max:255',
            'table_area' => 'required|string|max:255',
            'table_description'    => 'nullable|string',
            'created_by'     => 'required|string|max:255',
        ]);

        // 🔍 Check kung existing na ang table_name
        $exists = DB::connection('mysql')
            ->table('table_tbl')
            ->whereRaw('LOWER(table_name) = ?', [
                strtolower(trim($validated['table_name']))
            ])
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'warning',
                    'message' => 'Table Name already exists.'
                ])
                ->withErrors([
                    'table_name' => 'Table Name already exists.'
                ])
                ->withInput();
        }

        // ✅ Insert if not existing
        DB::connection('mysql')
            ->table('table_tbl')
            ->insert([
                'table_name' => trim($validated['table_name']),
                'table_area' => trim($validated['table_area']),
                'table_description'    => $validated['table_description'] ?? null,
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
            'table_name' => 'required|string',
            'table_area' => 'required|string',
            'table_description' => 'required|string',
            'updated_by' => 'required|string|max:255',
        ]);

        DB::connection('mysql')
            ->table('table_tbl')
            ->where('id', $id)
            ->update([
                'table_name' => $validated['table_name'],
                'table_area' => $validated['table_area'],
                'table_description' => $validated['table_description'],
                'updated_by' => $validated['updated_by'],
            ]);

        return redirect()->back()->with('success', 'Checklist item updated successfully.');
    }
}
