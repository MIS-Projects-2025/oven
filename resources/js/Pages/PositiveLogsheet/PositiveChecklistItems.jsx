import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { Activity, useState } from "react";
import { Select } from "antd";


export default function PositiveChecklistItems({ tableData, tableFilters, emp_data }) {
    const { flash, errors } = usePage().props;
    const { Option } = Select;
    const [showModal, setShowModal] = useState(false); // New item
    const [viewModal, setViewModal] = useState(false); // View
    const [editModal, setEditModal] = useState(false); // Edit
    const [selectedItem, setSelectedItem] = useState(null); // for View/Edit

    const [form, setForm] = useState({
        input_variable: "",
        vision_system: "",
        control_item: "", 
        frequency: "", 
        responsible: "",
        fill_type: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (name, value) => {
    setForm({
        ...form,
        [name]: value,
    });
};


    // Save new checklist item
    const handleSave = () => {
        router.post(route("positive.item.store"), {
            ...form,
            created_by: emp_data.emp_name,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert("✅ Checklist item saved.");
                setShowModal(false);
                setForm({
                    input_variable: "",
                    vision_system: "",
                    control_item: "", 
                    frequency: "", 
                    responsible: "",
                    fill_type: "" });
                window.location.reload();
            },
        });
    };

    // Update existing checklist item
    const handleUpdate = () => {
    router.put(route("positive.item.update", selectedItem.id), {
        ...form,
        updated_by: emp_data.emp_name, // include who updated
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert("✅ Checklist item updated.");
            setEditModal(false);
            setForm({
                input_variable: "",
                vision_system: "",
                control_item: "", 
                frequency: "", 
                responsible: "",
                fill_type: "" }); // reset form
            router.reload(); // refresh Inertia page
        },
        onError: (errors) => {
            console.log(errors); // optional: show errors inline
        }
    });
};


    // Format date mm/dd/yyyy hh:mm:ss
    const dataWithAction = tableData.data.map((r) => {

        return {
            ...r,
            action: (
                <div className="flex gap-2">
                    <button
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => {
                            setSelectedItem(r);
                            setViewModal(true);
                        }}
                    >
                        <i className="fas fa-eye"></i> View
                    </button>
                    <button
                        className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        onClick={() => {
                            setSelectedItem(r);
                            setForm({ input_variable: r.input_variable, vision_system: r.vision_system, control_item: r.control_item, frequency: r.frequency, responsible: r.responsible, fill_type: r.fill_type });
                            setEditModal(true);
                        }}
                    >
                        <i className="fas fa-edit"></i> Edit
                    </button>
                </div>
            ),
        };
    });

    return (
        <AuthenticatedLayout>
            <Head title="Manage Checklist Item" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-stone-500">
                    <i className="fa-solid fa-list-check"></i> Positive Checklist Item
                </h1>
                <button
                    className="text-blue-600 border-blue-600 btn flex items-center"
                    onClick={() => setShowModal(true)}
                >
                    <i className="fa-solid fa-plus"></i> New Checklist Item
                </button>
            </div>

            <DataTable
                columns={[
                    { key: "input_variable", label: "Input Variable" },
                    { key: "vision_system", label: "Vision System" },
                    { key: "control_item", label: "Control Item" },
                    { key: "frequency", label: "Frequency" },
                    { key: "responsible", label: "Responsible" },
                    { key: "fill_type", label: "Fill Type" },
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
                routeName={route("positive.checklist.index")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            {/* --- New Checklist Modal --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg p-6 z-10">
                        <h2 className="text-xl font-bold mb-4"><i className="fa-regular fa-plus-square text-green-600"></i> New Checklist Item</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Input Variable</label>
                                <input
                                    type="text"
                                    name="input_variable"
                                    value={form.input_variable || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full mb-4"
                                />
                                {errors.input_variable && (
                                    <p className="text-red-500 text-sm mt-1">{errors.input_variable}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Vision System/ MC Part/ MC Feature</label>
                                <input
                                    type="text"
                                    name="vision_system"
                                    value={form.vision_system || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full mb-4"
                                />
                                {errors.vision_system && (
                                    <p className="text-red-500 text-sm mt-1">{errors.vision_system}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Control Item</label>
                                <input
                                    type="text"
                                    name="control_item"
                                    value={form.control_item || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full mb-4"
                                />
                                {errors.control_item && (
                                    <p className="text-red-500 text-sm mt-1">{errors.control_item}</p>
                                )}
                            </div>


                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                  <Select
                                    name="frequency"
                                    value={form.frequency}
                                     onChange={(value) => handleSelectChange("frequency", value)}
                                    placeholder="Select Frequency..."
                                    className="w-full mb-4"
                                    size="large"
                                  >
                                    <Option value="Start of shift">Start of shift</Option>
                                    <Option value="Every Set-up">Every Set-up</Option>
                                    <Option value="End of the shift">End of the shift</Option>
                                    <Option value="Start of shift / Every Setup">Start of shift / Every Setup</Option>
                                    <Option value="Every Set-up/ Every Loading">Every Set-up/ Every Loading</Option>
                                    <Option value="Start of the shift / Setup / End of Shift">Start of the shift / Setup / End of Shift</Option>
                                  </Select>
                                </div>
                            </div>
                             {/* Responsible */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Responsible</label>
                                <Select
                                    name="responsible"
                                    value={form.responsible}
                                     onChange={(value) => handleSelectChange("responsible", value)}
                                    placeholder="Select Responsible..."
                                    className="w-full mb-4"
                                    size="large"
                                >
                                    <Option value="Operator">Operator</Option>
                                    <Option value="Technician">Technician</Option>
                                    <Option value="Operator/ Technician">Operator/ Technician</Option>
                                </Select>
                            </div>

                            
                            {/* Fill Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Fill Type</label>
                                <Select
                                    name="fill_type"
                                    value={form.fill_type}
                                     onChange={(value) => handleSelectChange("fill_type", value)}
                                    placeholder="Select Fill Type..."
                                    className="w-full mb-4"
                                    size="large"
                                >
                                    <Option value="Start of Shift">Start of Shift</Option>
                                    <Option value="Setup">Setup</Option>
                                    <Option value="End of Shift">End of Shift</Option>
                                    <Option value="Start of Shift/ Setup">Start of Shift/ Setup</Option>
                                </Select>
                            </div>

                            

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
                                onClick={() => setShowModal(false)}
                            >
                                <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                            <button
                                className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
                                onClick={handleSave}
                            >
                                <i className="fa-solid fa-save"></i> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- View Modal --- */}
            {viewModal && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50 transition-opacity"
                    onClick={() => setViewModal(false)}
                />

        {/* Modal box */}
        <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 z-10 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-eye text-blue-600"></i>
                    View Positive Checklist Item
                </h2>
                <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setViewModal(false)}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Input Variable:</span>
                    <span className="text-gray-800">{selectedItem.input_variable}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Vision System:</span>
                    <span className="text-gray-800">{selectedItem.vision_system}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Control Item:</span>
                    <span className="text-gray-800">{selectedItem.control_item}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Frequency:</span>
                    <span className="text-gray-800">{selectedItem.frequency || "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Responsible:</span>
                    <span className="text-gray-800">{selectedItem.responsible || "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Fill Type:</span>
                    <span className="text-gray-800">{selectedItem.fill_type || "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Created By:</span>
                    <span className="text-gray-800">{selectedItem.created_by}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Date Created:</span>
                    <span className="text-gray-800">{selectedItem.date_created}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
                <button
                    className="bg-red-500 px-5 py-2 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
                    onClick={() => setViewModal(false)}
                >
                    <i className="fa-solid fa-xmark mr-1"></i> Close
                </button>
                </div>
            </div>
        </div>
        )}
            {/* --- Edit Modal --- */}
            {editModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg p-6 z-10">
                        <h1 className="text-xl font-bold mb-4"><i className="fa-solid fa-edit text-yellow-500"></i> Edit Checklist Item</h1>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Input Variable</label>
                                <input
                                    type="text"
                                    name="input_variable"
                                    value={form.input_variable || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Vision System</label>
                                <input
                                    type="text"
                                    name="vision_system"
                                    value={form.vision_system || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Control Item</label>
                                <input
                                    type="text"
                                    name="control_item"
                                    value={form.control_item || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>

                             {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                  <Select
                                    name="frequency"
                                    value={form.frequency || ""}
                                     onChange={(value) => handleSelectChange("frequency", value)}
                                    placeholder="Select Frequency..."
                                    className="w-full mb-4"
                                    size="large"
                                  >
                                    <Option value="Start of shift">Start of shift</Option>
                                    <Option value="Every Set-up">Every Set-up</Option>
                                    <Option value="End of the shift">End of the shift</Option>
                                    <Option value="Start of shift / Every Setup">Start of shift / Every Setup</Option>
                                    <Option value="Every Set-up/ Every Loading">Every Set-up/ Every Loading</Option>
                                    <Option value="Start of the shift / Setup / End of Shift">Start of the shift / Setup / End of Shift</Option>
                                  </Select>
                                </div>

                             {/* Responsible */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Responsible</label>
                                <Select
                                    name="responsible"
                                    value={form.responsible}
                                     onChange={(value) => handleSelectChange("responsible", value)}
                                    placeholder="Select Responsible..."
                                    className="w-full mb-4"
                                    size="large"
                                >
                                    <Option value="Operator">Operator</Option>
                                    <Option value="Technician">Technician</Option>
                                    <Option value="Operator/ Technician">Operator/ Technician</Option>
                                </Select>
                            </div>

                            {/* Fill Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Fill Type</label>
                                <Select
                                    name="fill_type"
                                    value={form.fill_type}
                                     onChange={(value) => handleSelectChange("fill_type", value)}
                                    placeholder="Select Fill Type..."
                                    className="w-full mb-4"
                                    size="large"
                                >
                                    <Option value="Start of Shift">Start of Shift</Option>
                                    <Option value="Setup">Setup</Option>
                                    <Option value="End of Shift">End of Shift</Option>
                                    <Option value="Start of Shift/ Setup">Start of Shift/ Setup</Option>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
                                onClick={() => setEditModal(false)}
                            >
                                <i className="fa-solid fa-close"></i> Cancel
                            </button>
                            <button
                                className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
                                onClick={handleUpdate}
                            >
                                <i className="fa-solid fa-save"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
