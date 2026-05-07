import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Icon, icons } from "lucide-react";
import { Line, Bar } from 'react-chartjs-2';
import { useEffect } from "react";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const {
        emp_data = {},
        totalFilledToday = 0,
        totalSetup = 0,
        machinesFilledToday = 0,
        machinesStartShiftToday = 0,
        machinesSetupToday = 0,
        machinesSetupNotVerified = 0,
        setupMachines = [],
        lineGraphData = [],
        TotalFilledMachines = [],
    } = usePage().props;

useEffect(() => {
    const interval = setInterval(() => {
        router.reload({
            only: [
                "totalFilledToday",
                "machinesFilledToday",
                "machinesStartShiftToday",
                "machinesSetupToday",
                "machinesSetupNotVerified",
                "setupMachines",
                "lineGraphData",
                "TotalFilledMachines",
                "totalSetup",
            ],
            preserveState: true,
            preserveScroll: true,
        });
    }, 3000);

    return () => clearInterval(interval);
}, []);


    const isQAPE = ["Quality Assurance", "Process Engineering", "Quality Management System"].includes(emp_data?.emp_dept);

    // Main checklist line chart
    const mainChartData = {
        labels: lineGraphData.map(item => {
            if (!item.date) return "";
            const [year, month, day] = item.date.split("-");
            return `${month}/${day}/${year}`; // mm/dd/yyyy
        }),
        datasets: [
            {
                label: "Checklists Filled",
                data: lineGraphData.map(item => item.total_filled || 0),
                fill: false,
                borderColor: "rgb(34, 197, 94)",
                tension: 0.1,
            },
        ],
    };

    const mainChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
    };

    // QA/PE/QMS setup bar chart
    const setupChartData = {
        labels: setupMachines.map(item => item.machine_num || ""),
        datasets: [
            {
                label: "Setup Checklists Filled",
                data: setupMachines.map(item => item.totalsetup_filled || 0),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
            },
        ],
    };

    const setupChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <h1 className="text-2xl font-bold mb-6 text-stone-500 font-sansarif"> <i className="fa-solid fa-dashboard"></i> Dashboard Summary</h1>

            {/* Non-QAPE Departments */}
            {!isQAPE && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-yellow-100 p-4 rounded-lg shadow border border-yellow-600">
                            <h2 className="text-md text-amber-700 font-semibold"> <i className="fa-solid fa-stamp"></i> Pending Buy-Off</h2>
                            <p className="text-3xl text-yellow-600 font-semibold text-right">{machinesSetupNotVerified}</p>
                        </div>
                        <div className="bg-stone-100 p-4 rounded-lg shadow border border-stone-600">
                            <h2 className="text-md text-gray-700 font-semibold"> <i className="fa-solid fa-gear"></i> MC Filled-up Today</h2>
                            <p className="text-3xl text-stone-600 font-semibold text-right">{machinesFilledToday}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg shadow border border-green-600">
                            <h2 className="text-md font-semibold text-emerald-700"> <i className="fa-solid fa-check-double"></i> Total Filled Today</h2>
                            <p className="text-3xl text-green-600 font-semibold text-right">{totalFilledToday}</p>
                        </div>
                        <div className="bg-cyan-100 p-4 rounded-lg shadow border border-cyan-600">
                            <h2 className="text-md text-sky-700 font-semibold"> <i className="fa-solid fa-star-of-life"></i> Total Start of Shift</h2>
                            <p className="text-3xl text-cyan-600 font-semibold text-right">{machinesStartShiftToday}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg shadow border border-blue-600">
                            <h2 className="text-md font-semibold text-blue-700"> <i className="fa-solid fa-sliders"></i> Total Setup today</h2>
                            <p className="text-3xl text-blue-600 font-semibold text-right">{machinesSetupToday}</p>
                        </div>
                    </div>

                    {/* Table Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* filled Machines Table Container */}
                        <div className="bg-white rounded-lg shadow p-4 h-[500px] flex flex-col overflow-auto border border-gray-300">
                            <h2 className="text-xl font-semibold text-center mb-4 text-stone-500">
                               <i className="fa-solid fa-list-check"></i> Filled Machines Today
                            </h2>
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-stone-200 text-left text-stone-700">
                                        <th className="px-4 py-2">Machine</th>
                                        <th className="px-4 py-2">Times Filled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {TotalFilledMachines.length > 0 ? (
                                        TotalFilledMachines.map((machine) => (
                                            <tr key={machine.machine_num} className="border-t border-stone-200 text-stone-500">
                                                <td className="px-4 py-2">{machine.machine_num}</td>
                                                <td className="px-4 py-2">{machine.total_filled_today}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-gray-500 text-center">
                                                No setup checklists filled yet today.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Line Chart Container */}
                        <div className="bg-white rounded-lg shadow p-4 h-[500px] flex flex-col border border-gray-300">
                            <h2 className="text-xl font-semibold text-center mb-4 text-stone-500">
                               <i className="fa-solid fa-signs-post"></i> Daily Checklists Filled
                            </h2>
                            <Line data={mainChartData} options={mainChartOptions} className="flex-1" />
                        </div>

                        
                    </div>
                </>
            )}

            {/* QAPE Departments */}
            {isQAPE && (
                <div className="mt-8">
                    {/* KPI Card */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-amber-100 p-4 rounded shadow border border-amber-500">
                            <h2 className="text-lg font-semibold text-yellow-600"> <i className="fa-solid fa-stamp text-2xl"></i> Machines Pending Buy-Off</h2>
                            <p className="text-3xl font-semibold text-amber-600">{machinesSetupNotVerified}</p>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-gray-100 rounded-lg shadow p-4 h-[750px]">
                        <h2 className="text-xl font-semibold text-center mb-4 text-gray-500">
                           <i className="fa-solid fa-gear"></i> Setup Checklists Count per Machine
                        </h2>
                        <Bar data={setupChartData} options={setupChartOptions} className="flex-1" />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
