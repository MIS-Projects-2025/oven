<?php

namespace App\Http\Controllers\PositiveLogsheet;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PositiveChecklistItemController extends Controller
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
            'positive_checklist_item',
            [


                'searchColumns' => ['input_variable', 'vision_system', 'control_item', 'responsible', 'tolerance', 'fill_type'],
            ]
        );



        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('PositiveLogsheet/PositiveChecklistItems', [
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
            'input_variable' => 'required|string|max:255',
            'vision_system' => 'nullable|string|max:255',
            'control_item' => 'nullable|string|max:255',
            'frequency'    => 'nullable|string',
            'responsible'       => 'nullable|string',
            'fill_type'      => 'nullable|string',
            'created_by'     => 'required|string|max:255',
        ]);

        // 🔍 Check kung existing na ang checklist_item
        $exists = DB::connection('mysql')
            ->table('positive_checklist_item')
            ->whereRaw('LOWER(input_variable) = ?', [
                strtolower(trim($validated['input_variable']))
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
                    'input_variable' => 'Checklist item already exists.'
                ])
                ->withInput();
        }

        // ✅ Insert if not existing
        DB::connection('mysql')
            ->table('positive_checklist_item')
            ->insert([
                'input_variable' => trim($validated['input_variable']),
                'vision_system' => $validated['vision_system'] ?? null,
                'control_item' => $validated['control_item'] ?? null,
                'frequency'    => $validated['frequency'] ?? null,
                'responsible'       => $validated['responsible'] ?? null,
                'fill_type'      => $validated['fill_type'] ?? null,
                'created_by'     => session('emp_data')['emp_name'] ?? null,
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
            'input_variable' => 'required|string',
            'vision_system' => 'nullable|string',
            'control_item' => 'nullable|string',
            'frequency' => 'required|string',
            'responsible' => 'required|string',
            'fill_type' => 'required|string',
            'updated_by' => 'nullable|string|max:255',
        ]);

        DB::connection('mysql')
            ->table('positive_checklist_item')
            ->where('id', $id)
            ->update([
                'input_variable' => $validated['input_variable'],
                'vision_system' => $validated['vision_system'],
                'control_item' => $validated['control_item'],
                'frequency' => $validated['frequency'],
                'responsible' => $validated['responsible'],
                'fill_type' => $validated['fill_type'],
                'updated_by' => session('emp_data')['emp_name'] ?? null,
            ]);

        return redirect()->back()->with('success', 'Checklist item updated successfully.');
    }

    public function destroy($id)
    {
        $deleted = DB::connection('mysql')
            ->table('positive_checklist_item')
            ->where('id', $id)
            ->delete();

        if ($deleted) {
            return redirect()->back()->with('success', 'Checklist item deleted!');
        }

        return redirect()->back()->with('error', 'Checklist item not found.');
    }
}
