import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Drawer from "@/Components/Drawer";
import { useState, useEffect } from "react";
import { Select, message, Button } from "antd";
import axios from "axios";

export default function MetalCapacity({
    tableData = {},
    tableFilters = {},
    packages = [],
    totalCapacity = 0,
    totalMetalMagazine = 0,
    totalMetalTube = 0,
    totalCapacitySum = 0,
    totalMetalMagazineSum = 0,
    totalMetalTubeSum = 0,
}) {


    useEffect(() => {
    const interval = setInterval(() => {
        router.reload({
            only: ["tableData"],
            preserveState: true,
            preserveScroll: true,
        });
    }, 3000);

    return () => clearInterval(interval);
}, []);

    /* -------------------- SAFE DATA -------------------- */

    const tableRows = tableData?.data ?? [];
    const packageOptions = (packages ?? []).map((p) => ({
        label: p.package_type,
        value: p.package_type,
    }));

    

    /* -------------------- STATES -------------------- */

    const initialForm = {
        package_type: "",
        lead_count: "",
        dimensions: "",
        capacity: "",
        qty_per_tube: "",
        metal_magazine: "",
        qty_per_magazine: "",
        metal_tube: "",
        remarks: "",
    };

    const [form, setForm] = useState(initialForm);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [filteredDimensions, setFilteredDimensions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    /* -------------------- HANDLERS -------------------- */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

const handlePackageChange = async (value) => {
    setForm((prev) => ({
        ...prev,
        package_type: value,
        lead_count: "",
        dimensions: "",
    }));

    setFilteredDimensions([]);
    setLoadingOptions(true);

    try {
        const res = await axios.get(route("capacity.filtered-options"), {
            params: { package_type: value },
        });

        setFilteredLeads(res.data?.leads ?? []);
    } catch (error) {
        message.error("Failed to load lead options");
    }

    setLoadingOptions(false);
};

const handleLeadChange = async (value) => {
    setForm((prev) => ({
        ...prev,
        lead_count: value,
        dimensions: "",
    }));

    setLoadingOptions(true);

    try {
        const res = await axios.get(route("capacity.filtered-options"), {
            params: {
                package_type: form.package_type,
                lead_count: value,
            },
        });

        setFilteredDimensions(res.data?.dimensions ?? []);
    } catch (error) {
        message.error("Failed to load dimensions");
    }

    setLoadingOptions(false);
};


    

    const handleSave = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("capacity.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                message.success("Data saved successfully!");
                setShowSetupModal(false);
                setForm(initialForm);
                setFilteredLeads([]);
                setFilteredDimensions([]);
            },
            onFinish: () => setProcessing(false),
        });
    };

    /* -------------------- TABLE -------------------- */

    const dataWithAction = tableRows.map((r) => ({
        ...r,
        action: (
            <Button
                type="primary"
                style={{ backgroundColor: "#727272", borderWidth: 2, borderColor: "#858585" }}
                size="middle" 
                onClick={() => setShowSetupModal(true)}
             
                className="flex items-center gap-2"
             >
                <i className="fa-solid fa-eye"></i>View
            </Button>
        ),
    }));

    /* -------------------- UI -------------------- */

    return (
        <AuthenticatedLayout>
            <Head title="Metal Capacity" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SummaryCard
                    title={<div className="text-xl font-semibold text-sky-600">Total Remaining Capacity</div>}
                    value={<div className="text-2xl font-semibold text-sky-600">{totalCapacitySum}/{totalCapacity}</div>}
                    color="bg-sky-200"
                    icon={<i className="fa-solid fa-cubes text-4xl text-sky-600 animate-pulse"></i>}
                />
                <SummaryCard
                    title={<div className="text-xl font-semibold text-blue-600">Remaining Metal Magazine</div>}
                    value={<div className="text-2xl font-semibold text-blue-600">{totalMetalMagazineSum}/{totalMetalMagazine}</div>}
                    color="bg-blue-200"
                    icon={<i className="fa-solid fa-check-circle text-4xl text-blue-600 animate-pulse"></i>}
                />
                <SummaryCard
                    title={<div className="text-xl font-semibold text-cyan-600">Remaining Metal Tube</div>}
                    value={<div className="text-2xl font-semibold text-cyan-600">{totalMetalTubeSum}/{totalMetalTube}</div>} 
                    color="bg-cyan-200"
                    icon={<i className="fa-solid fa-box text-4xl text-cyan-600 animate-pulse"></i>}
                />
            </div>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-blue-600 animate-pulse">
                    <i className="fa-solid fa-boxes-packing"></i> Metal Capacity
                </h1>

                <Button 
                    type="primary" 
                    onClick={() => setShowSetupModal(true)}
                    className="flex items-center py-4"
                    >
                    
                   <i className="fa-solid fa-box-tissue"></i>New Metal Capacity
                </Button>
            </div>
            

            <DataTable
                columns={[
                    { key: "package_type", label: "Package Type" },
                    { key: "lead_count", label: "Lead Count" },
                    { key: "dimensions", label: "Dimensions" },
                    { key: "capacity", label: "Capacity" },
                    { key: "metal_magazine", label: "Metal Magazine" },
                    { key: "qty_per_magazine", label: "Qty Per Magazine" },
                    { key: "metal_tube", label: "Metal Tube" },
                    { key: "qty_per_tube", label: "Qty Per Tube" },
                    { key: "action", label: "Action" },
                ]}
                data={dataWithAction}
                meta={{
                    from: tableData?.from ?? 0,
                    to: tableData?.to ?? 0,
                    total: tableData?.total ?? 0,
                    links: tableData?.links ?? [],
                    currentPage: tableData?.current_page ?? 1,
                    lastPage: tableData?.last_page ?? 1,
                }}
                routeName={route("capacity.index")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            <Drawer
                show={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                placement="right"
                size="large"
                icon={<i className="fa-solid fa-inbox text-emerald-600"></i>}
                title={<div className="text-xl font-semibold text-emerald-600">New Metal Capacity</div>}
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">

                    <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Package Type</label>
                    <Select
                        placeholder="Select Package"
                        options={packageOptions}
                        value={form.package_type}
                        onChange={handlePackageChange}
                        className="w-full p-2 border rounded-md border-gray-500"
                        showSearch
                    />
                    </div>

                    <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Lead Count</label>
                    <Select
                        placeholder="Select Lead Count"
                        options={filteredLeads.map((e) => ({
                         label: `${e.lead_count}L`,
                            value: e.lead_count,
                        }))}
                        value={form.lead_count}
                        onChange={handleLeadChange}
                        disabled={!form.package_type}
                        loading={loadingOptions}
                         className="w-full p-2 border rounded-md border-gray-500"
                    />
                    </div>

                    <div>
                    <label className="block mb-2 text-sm font-medium text-stone-700">Dimensions</label>
                    <Select
                        placeholder="Select Dimensions"
                        options={(filteredDimensions ?? []).map((d) => ({
                            label: d.dimensions,
                            value: d.dimensions,
                        }))}
                        value={form.dimensions}
                        onChange={(value) =>
                            setForm((prev) => ({ ...prev, dimensions: value }))
                        }
                        disabled={!form.package_type || !form.lead_count}
                        loading={loadingOptions}
                         className="w-full p-2 border rounded-md border-gray-500"
                    />
                    </div>



                    

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                        type="number"
                        name="metal_magazine"
                        placeholder="Metal Magazine"
                        value={form.metal_magazine}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <input
                        type="number"
                        name="qty_per_magazine"
                        placeholder="Qty Per Magazine"
                        value={form.qty_per_magazine}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <input
                        type="number"
                        name="metal_tube"
                        placeholder="Metal Tube"
                        value={form.metal_tube}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <input
                        type="number"
                        name="qty_per_tube"
                        placeholder="Qty Per Tube"
                        value={form.qty_per_tube}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                    </div>

                    <input
                        type="number"
                        name="capacity"
                        placeholder="Capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <textarea
                        name="remarks"
                        placeholder="Remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        rows="5"
                    />

                    <Button
                        type="primary"
                        style={{ backgroundColor: "#52c41a", borderWidth: 2, borderColor: "#389e0d" }}
                        className="w-full p-4 hover:bg-green-600 flex items-center justify-center gap-2"
                        htmlType="submit"
                        loading={processing}
                        block
                    >
                       <i className="fa-solid fa-floppy-disk"></i> Save
                    </Button>
                </form>
            </Drawer>
        </AuthenticatedLayout>
    );
}
function SummaryCard({ title, value, color, icon}) {
  return (
      <div className={`p-4 ${color} rounded-lg shadow text-gray-700`}>
        <div>{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-3xl font-bold flex justify-end">{value}</p>
      </div>
  );
}