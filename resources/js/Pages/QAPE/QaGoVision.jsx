import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState, useEffect } from "react";
import { Select, message} from "antd";
import { m } from "framer-motion";
export default function QaGoVision({ tableData, tableFilters, emp_data, machines, packages }) {

    const { errors } = usePage().props;

    const machineOptions = machines.map((m) => ({
    label: m.machine_num,
    value: m.machine_num,
    }));

    const packageOptions = packages.map((p) => ({
    label: `${p.lead_count}L ${p.package_type}`,
    value: `${p.lead_count}L ${p.package_type}`,
    }));

    const initialForm = {
        machine: "",
        package_type: "",
        samp_no_reject: "",
        samp_no_good: "",
        result_no_reject: "",
        result_no_good: "",
        result: "",
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

    const handleResultChange = (e) => {
    const { name, value } = e.target;
    let intValue = parseInt(value) || 0;

    if (name === "result_no_reject" && intValue > parseInt(form.samp_no_reject || 0)) {
        intValue = parseInt(form.samp_no_reject || 0);
    }

    if (name === "result_no_good" && intValue > parseInt(form.samp_no_good || 0)) {
        intValue = parseInt(form.samp_no_good || 0);
    }

    setForm(prev => ({
        ...prev,
        [name]: intValue,
    }));
};

useEffect(() => {
    if (parseInt(form.result_no_reject || 0) > parseInt(form.samp_no_reject || 0)) {
        setForm(prev => ({
            ...prev,
            result_no_reject: parseInt(form.samp_no_reject || 0),
        }));
    }
    if (parseInt(form.result_no_good || 0) > parseInt(form.samp_no_good || 0)) {
        setForm(prev => ({
            ...prev,
            result_no_good: parseInt(form.samp_no_good || 0),
        }));
    }
}, [form.samp_no_reject, form.samp_no_good]);


    const handleSave = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("go.vision.store"), form, {
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

const dataWithAction = tableData.data.map((r) => ({
    ...r,
    verifier: r.verifier ? (
        <div className="text-left w-16 h-16">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">

                {/* Top Text */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
                    {r.result === "Pass" ? "PASSED" : "FAILED"}
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
                    TSPI
                </div>

                {/* Center Value */}
                <div className="text-blue-600 font-semibold text-center text-md px-1">
                    {r.verifier}
                </div>
            </div>
        </div>
    ) : null, // ✅ walang lalabas kung walang verifier

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


    const handleVerify = () => {
    if (!selectedSetup) return;

    setVerifying(true);

    router.post(
        route("go.vision.verify", selectedSetup.id),
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


    return (
        <AuthenticatedLayout>
            <Head title="Vision Setup Logsheet" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-stone-500">
                    <i className="fa-solid fa-bullseye"></i> Vision Setup Logsheet
                </h1>

                {["Equipment Engineering"].includes(emp_data?.emp_dept) && !["superadmin", "admin"].includes(emp_data?.emp_role) && (
                    <button
                        onClick={() => setShowDrawer(true)}
                        className="px-4 py-2 text-white bg-emerald-500 rounded-md hover:bg-emerald-700"
                    >
                        <i className="fa-solid fa-plus"></i> New Vision Setup
                    </button>
                )}
            </div>

            <DataTable
                columns={[
                    { key: "date", label: "Date" },
                    { key: "machine", label: "Machine #" },
                    { key: "package_type", label: "Package" },
                    { key: "verifier", label: "QA Verifier" },
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
                routeName={route("qa-go.vision.index")}
                filters={tableFilters}
                rowKey="id"
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
                   <i className="fa fa-info-circle"></i> Vision Setup Details
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
                        Date
                    </label>
                    <input type="text" value={selectedSetup.date} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                {/* Machine */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Machine
                    </label>
                    <input type="text" value={selectedSetup.machine} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>

                {/* Package */}
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Package
                    </label>
                    <input type="text" value={selectedSetup.package_type} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                </div>            

                <label className="block text-sm font-medium text-indigo-600">
                    Go-no-Go Samples
                </label>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        No. of Rejects
                    </label>
                    <input type="text" value={selectedSetup.samp_no_reject} className="text-stone-600 border-none font-semibold" readOnly/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        No. of Good
                    </label>
                    <input type="text" value={selectedSetup.samp_no_good} className="text-stone-600 border-none font-semibold" readOnly/>
                    </div>
                </div>

                <label className="block text-sm font-medium text-indigo-600">
                    Go-no-Go Result
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        No. of Rejects
                    </label>
                    <input type="text" value={selectedSetup.result_no_reject} className="text-stone-600 border-none font-semibold" readOnly/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                        No. of Good
                    </label>
                    <input type="text" value={selectedSetup.result_no_good} className="text-stone-600 border-none font-semibold" readOnly/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-600">
                        Result
                    </label>
                    <input type="text" value={selectedSetup.result} className="text-stone-600 border-none font-semibold" readOnly/>
                </div>
                 {selectedSetup.verifier && (
                <div>
    <label className="block text-sm font-medium text-gray-600">
        QA Verifier
    </label>

    {selectedSetup.verifier ? (
        <div className="text-left w-16 h-16 relative mb-2">
            {/* Outer Circle */}
            <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">

                {/* Top Text */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
                    {selectedSetup.result === "Pass" ? "PASSED" : "FAILED"}
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
                    TSPI
                </div>

                {/* Center Value */}
                <div className="text-blue-600 font-semibold text-center text-md px-1">
                    {selectedSetup.verifier}
                </div>
            </div>

            {/* Verification Date */}
            {selectedSetup.date_verify && (
                <div className="mt-1 text-xs text-gray-500">
                    {new Date(selectedSetup.date_verify).toLocaleString()}
                </div>
            )}
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
                    <textarea className="w-full border rounded-md p-2 bg-stone-100 text-stone-600" rows="3" value={selectedSetup.remarks} readOnly></textarea>
                </div>

                {/* QA VERIFY BUTTON */}
                {emp_data?.emp_dept === "Quality Assurance" &&
                    !selectedSetup.verifier && (
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
