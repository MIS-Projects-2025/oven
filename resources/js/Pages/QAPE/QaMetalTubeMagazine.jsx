import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState, useEffect } from "react";
import { Select, message} from "antd";

export default function QaMetalTubeMagazine({ tableData, tableFilters, emp_data, packages }) {

    const today = new Date();
    const todayDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
        today.getDate()
    ).padStart(2, "0")}/${today.getFullYear()}`;

    const currentShift =
    today.getHours() >= 7 && today.getHours() <= 18 ? "A" : "C";

    const dateShift = `${todayDate} - ${currentShift}`;


    const packageOptions = packages.map((p) => ({
    label: `${p.package_type}`,
    value: `${p.package_type}`,
    }));

    const initialForm = {
        date_shift: dateShift || "",
        package_type: "",
        metal_tube: "",
        magazine: "",
        performed_by: emp_data?.emp_id || "",
        remarks: "",
    };

    const [showDrawer, setShowDrawer] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [processing, setProcessing] = useState(false);

    const [selectedSetup, setSelectedSetup] = useState(null);
    const [viewDrawer, setViewDrawer] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("cleaning.logsheet.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                message.success("Data saved successfully!");
                window.location.reload();
                setShowDrawer(false);
                setForm(initialForm);
            },
            onFinish: () => setProcessing(false),
        });
    };
    
        const handleVerify = () => {
    if (!selectedSetup) return;

    setVerifying(true);

    router.put(
        route("cleaning.logsheet.verify", selectedSetup.id),
        {},
        {
            onSuccess: () => {
                message.success("Vision verified successfully!");
                setViewDrawer(false);
                window.location.reload();
            },
            onFinish: () => setVerifying(false),
        }
    );
};


const dataWithAction = tableData.data.map((r) => ({
    ...r,
    metal_tube: r.metal_tube ? (
        <div className="text-left w-16 h-16">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-3xl border border-stone-200 flex items-center justify-center relative">
                {/* Center Value */}
                <div className="font-semibold text-center text-md px-1">
                    {r.metal_tube == 1 ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                     <span className="text-red-600">&#10060;</span>
                    )}
                </div>
            </div>
        </div>
    ) : null,

    magazine: r.magazine ? (
        <div className="text-left w-16 h-16">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-3xl border border-stone-200 flex items-center justify-center relative">
                {/* Center Value */}
                <div className="text-blue-600 font-semibold text-center text-md px-1">
                    {r.magazine == 1 ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                     <span className="text-red-600">&#10060;</span>
                    )}
                </div>
            </div>
        </div>
    ) : null,

    verifier_name: r.verifier_name ? (
        <div className="text-left w-16 h-16">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">

                {/* Top Text */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
                    PASSED
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
                    TSPI
                </div>

                {/* Center Value */}
                <div className="text-blue-600 font-semibold text-center text-md px-1">
                    {r.verifier_name}
                </div>
            </div>
        </div>
    ) : "Pending Verification...", // ✅ walang lalabas kung walang verifier_name

    action: (
        <button
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
                setSelectedSetup(r);
                setViewDrawer(true);
            }}
        >
            <i className="fa-solid fa-eye"></i> View
        </button>
    ),
}));

    return (
        <AuthenticatedLayout>
            <Head title="Cleaning Logsheet of Magazine" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-stone-500"><i className="fa-solid fa-users-gear mr-2"></i> Cleaning Logsheet of Magazine</h1>
            </div>

            <DataTable
                columns={[
                    { key: "date_shift", label: "Date/ Shift" },
                    { key: "package_type", label: "Package" },
                    { key: "metal_tube", label: "Metal Tube" },
                    { key: "magazine", label: "Magazine" },
                    { key: "performed_by", label: "Performed By" },
                    { key: "verifier_name", label: "Verifier" },
                    { key: "action", label: "Action" },
                ]}
                data={dataWithAction}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("cleaning.logsheet.qape.index")}
                filters={tableFilters}
                rowKey="id"
                // selectable={true}
                // onSelectionChange={setSelectedRows}
                // dateRangeSearch={true}
                showExport={false}
            />

                        {viewDrawer && selectedSetup && (
    <div className="fixed inset-0 z-50 flex">
        <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setViewDrawer(false)}
        ></div>

        <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-xl overflow-y-auto">

            <div className="p-6 border-b flex justify-between items-center bg-gray-100">
                <h2 className="text-lg font-semibold text-indigo-600">
                   <i className="fa fa-info-circle"></i> Cleaning Metal Tube/ Magazine Logsheet
                </h2>
                <button
                    className="text-red-500"
                    onClick={() => setViewDrawer(false)}
                >
                    <i className="fa fa-times"></i>
                </button>
            </div>

            <div className="p-6 space-y-3 text-sm">

                <div className="grid grid-cols-3 gap-4">
                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Date/ Shift
                    </label>
                    <input type="text" value={selectedSetup.date_shift || "-"} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                {/* Package */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Package
                    </label>
                    <input type="text" value={selectedSetup.package_type || "-"} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                
                </div>            

                <label className="block text-xl font-medium text-indigo-600 text-semibold">
                    Metal
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        Metal Tube
                    </label>
                    <input
                        type="text"
                        value={
                                selectedSetup.metal_tube == 1
                                ? "✔"
                                : selectedSetup.metal_tube == 0
                                ? "✖"
                                : "-"
                            }
                            className={`border-none font-semibold text-left ${
                                selectedSetup.metal_tube == 1
                                ? "text-green-600"
                                : selectedSetup.metal_tube == 0
                                ? "text-red-600"
                                : "text-stone-600"
                            }`}
                        readOnly
                    />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        Metal Magazine
                    </label>
                    <input
                        type="text"
                        value={
                                selectedSetup.magazine == 1
                                ? "✔"
                                : selectedSetup.magazine == 0
                                ? "✖"
                                : "-"
                            }
                            className={`border-none font-semibold text-left ${
                                selectedSetup.magazine == 1
                                ? "text-green-600"
                                : selectedSetup.magazine == 0
                                ? "text-red-600"
                                : "text-stone-600"
                            }`}
                        readOnly
                    />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    
                </div>

                <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Performed By
                    </label>
                    <input type="text" value={selectedSetup.performed_by || "-"} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                 {selectedSetup.verifier_name && (
                <div>
    <label className="block text-sm font-medium text-gray-600">
        QA Verifier
    </label>

    {selectedSetup.verifier_name ? (
        <div className="text-left w-16 h-16 relative mb-2">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">

                {/* Top Text */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
                    PASSED
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
                    TSPI
                </div>

                {/* Center Value */}
                <div className="text-blue-600 font-semibold text-center text-md px-1">
                    {selectedSetup.verifier_name}
                </div>
            </div>
        </div>
        
    ) : (
        <div className="text-gray-400 text-sm">Not Verified</div>
    )}
</div>

                )}
                </div>
                

                <div>
                    <label className="block text-sm font-medium text-gray-600 m-2">
                        Remarks:
                    </label>
                    <textarea className="w-full border rounded-md p-2 bg-stone-100 text-stone-600" rows="3" value={selectedSetup.remarks || "-"} readOnly></textarea>
                </div>

                {/* QA VERIFY BUTTON */}
                {emp_data?.emp_dept === "Quality Assurance" &&
                    !selectedSetup.verifier_name && (
                        <button
                            onClick={handleVerify}
                            disabled={verifying}
                            className="w-full mt-4 bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600"
                        >
                            {verifying ? "Verifying..." : "Verify by: " + emp_data.emp_id}
                        </button>
                    )}
            </div>
        </div>
    </div>
)}
                
        </AuthenticatedLayout>
    );
}
