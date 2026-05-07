<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Hamcrest\Core\Set;
use App\Models\SetupLosheet;

class DashboardController extends Controller
{

    public function index(Request $request)
    {

        $todayFillup = SetupLosheet::all();

        $empData = session('emp_data');
        $today = Carbon::today();

        // Total checklists filled today
        $totalFilledToday = DB::connection('mysql')->table('setup_losheet_tbl')
            ->whereDate('date_created', $today)
            ->count();

        // Distinct machines checked today
        $machinesFilledToday = DB::connection('mysql')->table('setup_losheet_tbl')
            ->whereDate('date_created', $today)
            ->distinct()
            ->count('machine_num');

        $machinesStartShiftToday = DB::connection('mysql')->table('setup_losheet_tbl')
            ->whereDate('date_created', $today)
            ->where('fill_type', 'Start of Shift')
            ->distinct()
            ->count('machine_num');

        $machinesSetupToday = DB::connection('mysql')->table('setup_losheet_tbl')
            ->whereDate('date_created', $today)
            ->where('fill_type', 'Setup')
            ->count('machine_num');

        $machinesSetupNotVerified = DB::connection('mysql')->table('setup_losheet_tbl')
            ->where('fill_type', 'Setup')
            ->whereNull('verifier')
            ->count('machine_num');

        // Per-machine filled count today
        $perMachine = DB::connection('mysql')->table('setup_losheet_tbl')
            ->select('machine_num', DB::raw('count(*) as total_filled'))
            ->whereDate('date_created', $today)
            ->groupBy('machine_num')
            ->get();

        //for QAPEQMS
        $setupMachines = DB::connection('mysql')->table('setup_losheet_tbl')
            ->select('machine_num', DB::raw('count(*) as totalsetup_filled'))
            ->where('fill_type', 'Setup')
            ->groupBy('machine_num')
            ->get();

        $TotalFilledMachines = DB::connection('mysql')->table('setup_losheet_tbl')
            ->select('machine_num', DB::raw('count(*) as total_filled_today'))
            ->whereDate('date_created', $today)
            ->groupBy('machine_num')
            ->get();



        //for QAPEQMS
        $totalSetup = DB::connection('mysql')->table('setup_losheet_tbl')
            ->where('fill_type', 'Setup')
            ->distinct()
            ->count('machine_num');


        // dd($setupMachnines);

        // Line graph data (count per date)
        $lineGraphData = DB::connection('mysql')->table('setup_losheet_tbl')
            ->select(DB::raw('DATE(date_created) as date'), DB::raw('count(*) as total_filled'))
            ->groupBy(DB::raw('DATE(date_created)'))
            ->orderBy('date')
            ->get();

        return Inertia::render('Dashboard', [
            'emp_data' => $empData,
            'totalFilledToday' => $totalFilledToday,
            'machinesFilledToday' => $machinesFilledToday,
            'perMachine' => $perMachine,
            'totalSetup' => $totalSetup,
            'setupMachines' => $setupMachines,
            'lineGraphData' => $lineGraphData,
            'TotalFilledMachines' => $TotalFilledMachines,
            'machinesStartShiftToday' => $machinesStartShiftToday,
            'machinesSetupToday' => $machinesSetupToday,
            'machinesSetupNotVerified' => $machinesSetupNotVerified,
        ]);
    }
}
