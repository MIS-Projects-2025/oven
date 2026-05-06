<?php

namespace App\Http\Controllers\TableChecklist;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Pest\Laravel\session;

class LocationListController extends Controller
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
            'location_tbl',
            [

                'conditions' => function ($query) {
                    return $query
                        ->OrderBy('location_name', 'ASC');
                },

                'searchColumns' => ['location_name', 'location_description', 'created_by', 'date_created'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('TableChecklist/LocationList', [
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
            'location_name' => 'required|string|max:255',
            'location_description'    => 'nullable|string',
            'created_by'     => 'required|string|max:255',
        ]);

        // 🔍 Check kung existing na ang location_name
        $exists = DB::connection('mysql')
            ->table('location_tbl')
            ->whereRaw('LOWER(location_name) = ?', [
                strtolower(trim($validated['location_name']))
            ])
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'warning',
                    'message' => 'Location name already exists.'
                ])
                ->withErrors([
                    'location_name' => 'Location name already exists.'
                ])
                ->withInput();
        }

        // ✅ Insert if not existing
        DB::connection('mysql')
            ->table('location_tbl')
            ->insert([
                'location_name' => trim($validated['location_name']),
                'location_description'    => $validated['location_description'] ?? null,
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
            'location_name' => 'required|string',
            'location_description' => 'required|string',
            'updated_by' => 'required|string|max:255',
        ]);

        DB::connection('mysql')
            ->table('location_tbl')
            ->where('id', $id)
            ->update([
                'location_name' => $validated['location_name'],
                'location_description' => $validated['location_description'],
                'updated_by' => $validated['updated_by'],
            ]);

        return redirect()->back()->with('success', 'Checklist item updated successfully.');
    }
}
