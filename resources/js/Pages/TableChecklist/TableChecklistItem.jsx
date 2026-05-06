import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { Activity, useState } from "react";
import { Select } from "antd";


export default function TableChecklistItem({ tableData, tableFilters, emp_data }) {
    const { flash, errors } = usePage().props;
const { Option } = Select;
    const [showModal, setShowModal] = useState(false); // New item
    const [viewModal, setViewModal] = useState(false); // View
    const [editModal, setEditModal] = useState(false); // Edit
    const [selectedItem, setSelectedItem] = useState(null); // for View/Edit

    const [form, setForm] = useState({
        checklist_item: "",
        requirement: "",
        activity: "",
        frequency: "",
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
        router.post(route("checklist_item.store"), {
            ...form,
            created_by: emp_data.emp_name,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert("✅ Checklist item saved.");
                setShowModal(false);
                setForm({ checklist_item: "", requirement: "", activity: "", frequency: "" });
                // window.location.reload();
            },
        });
    };

    // Update existing checklist item
    const handleUpdate = () => {
    router.put(route("checklist_item.update", selectedItem.id), {
        ...form,
        updated_by: emp_data.emp_name, // include who updated
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert("✅ Checklist item updated.");
            setEditModal(false);
            setForm({ checklist_item: "", requirement: "", activity: "", frequency: "" }); // reset form
            router.reload(); // refresh Inertia page
        },
        onError: (errors) => {
            console.log(errors); // optional: show errors inline
        }
    });
};


    // Format date mm/dd/yyyy hh:mm:ss
    const dataWithAction = tableData.data.map((r) => {
        const [datePart, timePart] = r.date_created.split(" ");
        const [year, month, day] = datePart.split("-");
        const formattedDate = `${month}/${day}/${year} ${timePart}`;

        return {
            ...r,
            date_created: formattedDate,
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
                            setForm({ checklist_item: r.checklist_item, requirement: r.requirement, activity: r.activity, frequency: r.frequency });
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
                <h1 className="text-2xl font-bold">
                    <i className="fa-solid fa-list-check"></i> Checklist Item
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
                    { key: "checklist_item", label: "Checklist Item" },
                    { key: "requirement", label: "Requirement" },
                    { key: "activity", label: "Activity" },
                    { key: "frequency", label: "Frequency" },
                    { key: "created_by", label: "Created By" },
                    { key: "date_created", label: "Created At" },
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
                routeName={route("checklist_item.index")}
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
                                <label className="block text-sm font-medium mb-1">Checklist Item</label>
                                <input
                                    type="text"
                                    name="checklist_item"
                                    value={form.checklist_item}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                                {errors.checklist_item && (
                                    <p className="text-red-500 text-sm mt-1">{errors.checklist_item}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Requirement</label>
                                {/* <textarea
                                    name="requirement"
                                    value={form.requirement}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                /> */}
                                <input
                                    type="text"
                                    name="requirement"
                                    value={form.requirement}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                                {errors.requirement && (
                                    <p className="text-red-500 text-sm mt-1">{errors.requirement}</p>
                                )}
                            </div>
                             {/* Activity */}
            <div>
            <label className="block text-sm font-medium mb-1">Activity</label>
              <Select
                name="activity"
                value={form.activity}
                 onChange={(value) => handleSelectChange("activity", value)}
                placeholder="Activity"
                className="w-full text-center"
                size="large"
              >
                <Option value="N/A">N/A</Option>
                <Option value="A">A - Check</Option>
                <Option value="A/B">A/B - Check/Clean</Option>
                <Option value="B">B - Clean</Option>
                <Option value="C">C - Visual Inspection</Option>
                <Option value="D">D - Turn On</Option>
              </Select>
            </div>

            {/* Frequency */}
            <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
              <Select
                name="frequency"
                value={form.frequency}
                 onChange={(value) => handleSelectChange("frequency", value)}
                placeholder="Freq"
                className="w-full text-center"
                size="large"
              >
                <Option value="N/A">N/A</Option>
                <Option value="I">I - Start of the Shift</Option>
                <Option value="I/O">I/O - Start of the Shift/ End of the Shift</Option>
                <Option value="M">M - Middle of the Shift</Option>
                <Option value="O">O - End of the Shift</Option>
              </Select>
            </div>
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
                    View Checklist Item
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
                    <span className="font-medium text-gray-600">Checklist Item:</span>
                    <span className="text-gray-800">{selectedItem.checklist_item}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Requirement:</span>
                    <span className="text-gray-800">{selectedItem.requirement || "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Activity:</span>
                    <span className="text-gray-800">{selectedItem.activity || "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Frequency:</span>
                    <span className="text-gray-800">{selectedItem.frequency || "-"}</span>
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
                                <label className="block text-sm font-medium mb-1">Checklist Item</label>
                                <input
                                    type="text"
                                    name="checklist_item"
                                    value={form.checklist_item}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Requirement</label>
                                <textarea
                                    name="requirement"
                                    value={form.requirement}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Activity</label>
                                <textarea
                                    name="activity"
                                    value={form.activity}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                <input
                                    type="text"
                                    name="frequency"
                                    value={form.frequency}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
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
