import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import { useState } from "react";
import { IconWheelchair } from '@tabler/icons-react';

export default function TableList({ tableData, tableFilters, emp_data }) {
 const { flash, errors } = usePage().props;

    const [showModal, setShowModal] = useState(false); // New item
    const [viewModal, setViewModal] = useState(false); // View
    const [editModal, setEditModal] = useState(false); // Edit
    const [selectedItem, setSelectedItem] = useState(null); // for View/Edit

    const [form, setForm] = useState({
        table_name: "",
        table_area: "",
        table_description: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Save new checklist item
    const handleSave = () => {
        router.post(route("table.list.store"), {
            ...form,
            created_by: emp_data.emp_name,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert("✅ New table added successfully!!");
                setShowModal(false);
                setForm({ table_name: "", table_area: "", table_description: "" });
                window.location.reload();
            },
        });
    };

    // Update existing checklist item
    const handleUpdate = () => {
    router.put(route("table.list.update", selectedItem.id), {
        ...form,
        updated_by: emp_data.emp_name, // include who updated
    }, {
        preserveScroll: true,
        onSuccess: () => {
            alert("✅ Table Details updated successfully!!");
            setEditModal(false);
            setForm({ table_name: "", table_area: "", table_description: "" }); // reset form
            router.reload(); // refresh Inertia page
        },
        onError: (errors) => {
            console.log(errors); // optional: show errors inline
        }
    });
};


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
                        className="px-3 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-700"
                        onClick={() => {
                            setSelectedItem(r);
                            setViewModal(true);
                        }}
                    >
                        <i className="fas fa-eye"></i> View
                    </button>
                    <button
                        className="px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                        onClick={() => {
                            setSelectedItem(r);
                            setForm({ table_name: r.table_name, table_area: r.table_area, table_description: r.table_description });
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
            <Head title="Manage Table List" />

            <div className="flex items-center justify-between mb-4">
                
                <h1 className="text-2xl font-bold"><i class="fa-regular fa-paste"></i> Table List</h1>

                
                    <button
                        className="text-blue-600 border-blue-600 btn"
                        onClick={() => setShowModal(true)}
                    >
                        <i class="fa-regular fa-square-plus"></i>New Table
                    </button>
            </div>

            <DataTable
                columns={[
                    { key: "table_name", label: "Table Name" },
                    { key: "table_area", label: "Area" },
                    { key: "table_description", label: "Description" },
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
                routeName={route("table.list.index")}
                filters={tableFilters}
                rowKey="id"
                // selectable={true}
                // onSelectionChange={setSelectedRows}
                // dateRangeSearch={true}
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
                        <h2 className="text-xl font-bold mb-4"><i className="fa-regular fa-plus-square text-green-600"></i> New Table</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Table Name</label>
                                <input
                                    type="text"
                                    name="table_name"
                                    value={form.table_name}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                                {errors.table_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.table_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Table Area</label>
                                <input
                                    type="text"
                                    name="table_area"
                                    value={form.table_area}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                                {errors.table_area && (
                                    <p className="text-red-500 text-sm mt-1">{errors.table_area}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="table_description"
                                    value={form.table_description}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                />
                                {errors.table_description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.table_description}</p>
                                )}
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
                    View Table Details
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
                    <span className="font-medium text-gray-600">Table Name:</span>
                    <span className="text-gray-800">{selectedItem.table_name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Table Area:</span>
                    <span className="text-gray-800">{selectedItem.table_area}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Description:</span>
                    <span className="text-gray-800">{selectedItem.table_description || "-"}</span>
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
                        <h1 className="text-xl font-bold mb-4"><i className="fa-solid fa-edit text-yellow-500"></i> Edit Table Details</h1>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Table Name</label>
                                <input
                                    type="text"
                                    name="table_name"
                                    value={form.table_name}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Table Area</label>
                                <input
                                    type="text"
                                    name="table_area"
                                    value={form.table_area}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="table_description"
                                    value={form.table_description}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
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
