import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";

import {
    Modal,
    Input,
    Button,
    Table,
    Select,
    message,
} from "antd";

import { Head, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import {
    CircleFadingPlus,
    DiamondPlus,
    Eye,
    FilePenLine
} from "lucide-react";

export default function CapabilityMatrix({
    tableData,
    tableFilters,
    filterOptions,
    machines = [],
    customers = [],
    areas = [],
    packages = [],
}) {
    // =========================
    // MODAL STATE
    // =========================
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState(null);

    // =========================
    // CART STATE
    // =========================
    const [cart, setCart] = useState([]);

    // =========================
    // YES NO FIELDS
    // =========================
    const yesNoFields = [
        "d3",
        "d2",
        "term_distance",
        "leadBurr",
        "padBurr",
        "padContain",
        "padDiscoloration",
        "tightendBH",
        "markTop",
        "pinTop",
        "crackTop",
        "chipoutTop",
        "scratchTop",
        "markip",
        "pinip",
        "tipip",
        "pitchip",
        "leadVariance",
        "crack",
        "chipout",
        "scratch",
        "arr",
        "tubetube",
        "tubetape",
        "tapetube",
        "tubetray",
        "traytray",
        "traytape",
        "tapetray",
        "tryjewelbox",
        "canistertray",
        "canistertape",
        "tapetape",
        "withAuxillary",
        "ColoredCamera",
        "detape",
        "machineLearn",
    ];

    // =========================
    // INITIAL FORM DATA
    // =========================
    const initialData = {
        machine: "",
        machine_brand: "",
        inspection_capability: "",
        package: "",
        dimensions: "",
        devicename: "",
        customer: "",
        areas: "",
    };

    yesNoFields.forEach((field) => {
        initialData[field] = "";
    });

    // =========================
    // FORM
    // =========================
    const { data, setData, reset } =
        useForm(initialData);

    const yesNo = ["Y", "N"];

    // =========================
    // MACHINE CHANGE
    // =========================
    const onMachineChange = (value) => {
        const selected = machines.find(
            (m) => m.machine_num === value
        );

        setData((prev) => ({
            ...prev,
            machine: value,
            machine_brand:
                selected?.machine_manufacturer || "",
        }));
    };

    // =========================
    // DEVICE CHANGE
    // =========================
    const fetchDeviceData = (value) => {
        const selected = packages.find(
            (p) => p.devicename === value
        );

        setData((prev) => ({
            ...prev,
            devicename: value,
            package: selected
                ? `${selected.lead_count}L ${selected.package_type}`
                : "",
            dimensions: selected?.dimensions || "",
        }));
    };

    // =========================
    // ADD TO CART
    // =========================
    const addToCart = () => {
    setCart((prev) => [
        ...prev,
        {
            id: crypto.randomUUID(),
            ...structuredClone(data),
        },
    ]);

    message.success("Added to cart");
    reset();
};

    // =========================
    // REMOVE CART ITEM
    // =========================
    const removeItem = (index) => {
        setCart((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // =========================
    // SUBMIT ALL
    // =========================
const submitAll = () => {
    if (!cart.length) {
        message.warning("Cart is empty");
        return;
    }

    router.post(
    route("capability-matrix.store"),
    {
        items: cart,
    },
    {
        onSuccess: () => {
            message.success("Saved successfully!");
            window.location.reload();
        },

        onError: (errors) => {
            console.log(errors);
        },
    }
);
};

    // =========================
    // YES / NO RENDER
    // =========================
    const renderYesNo = (field) => (
        <Select
            value={data[field]}
            onChange={(val) =>
                setData(field, val)
            }
            options={yesNo.map((v) => ({
                label: v,
                value: v,
            }))}
            className="w-full border-gray-400 rounded-md p-2"
        />
    );

    // =========================
    // TABLE COLUMNS
    // =========================
  const cartColumns = [
    {
        title: "Machine",
        dataIndex: "machine",
        render: (_, record, index) => (
            <Input
                value={record.machine}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "machine",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Brand",
        dataIndex: "machine_brand",
        render: (_, record, index) => (
            <Input
                value={record.machine_brand}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "machine_brand",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Inspection",
        dataIndex:
            "inspection_capability",
        render: (_, record, index) => (
            <Input
                value={
                    record.inspection_capability
                }
                onChange={(e) =>
                    updateCartField(
                        index,
                        "inspection_capability",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Device",
        dataIndex: "devicename",
        render: (_, record, index) => (
            <Input
                value={record.devicename}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "devicename",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Package",
        dataIndex: "package",
        render: (_, record, index) => (
            <Input
                value={record.package}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "package",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Dimensions",
        dataIndex: "dimensions",
        render: (_, record, index) => (
            <Input
                value={record.dimensions}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "dimensions",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Customer",
        dataIndex: "customer",
        render: (_, record, index) => (
            <Input
                value={record.customer}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "customer",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    {
        title: "Areas",
        dataIndex: "areas",
        render: (_, record, index) => (
            <Input
                value={record.areas}
                onChange={(e) =>
                    updateCartField(
                        index,
                        "areas",
                        e.target.value
                    )
                }
                className="border-gray-400 rounded-md p-2"
            />
        ),
    },

    // YES/NO FIELDS
    ...yesNoFields.map((field) => ({
        title: field,
        dataIndex: field,
        render: (_, __, index) =>
            renderEditableYesNo(
                index,
                field
            ),
            
    })),

    {
        title: "Action",
        render: (_, __, index) => (
            <Button
                danger
                onClick={() =>
                    removeItem(index)
                }
            >
                Remove
            </Button>
        ),
    },
];

    // =========================
// VALIDATION
// =========================
const hasEmptyFields =
    Object.values(data).some(
        (value) =>
            value === "" ||
            value === null ||
            value === undefined
    );

// =========================
// EDIT CART FIELD
// =========================
const updateCartField = (
    index,
    field,
    value
) => {
    const updated = [...cart];

    updated[index][field] = value;

    setCart(updated);
};

// =========================
// EDITABLE YES/NO
// =========================
const renderEditableYesNo = (
    recordIndex,
    field
) => (
    <Select
        value={cart[recordIndex][field]}
        onChange={(val) =>
            updateCartField(
                recordIndex,
                field,
                val
            )
        }
        options={[
            {
                label: "Y",
                value: "Y",
            },
            {
                label: "N",
                value: "N",
            },
        ]}
        className="w-full border-gray-400 rounded-md p-2 m-2"
    />
);

const renderField = (label, value) => (
    <div className="border p-2 rounded">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value ?? "-"}</div>
    </div>
);



    return (
        <AuthenticatedLayout>
            <Head title="Capability Matrix" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Capability Matrix
                </h1>

                <Button
                    onClick={() =>
                        setOpenCreate(true)
                    }
                    className="border border-sky-500 text-sky-600 bg-sky-50"
                >
                    <CircleFadingPlus className="w-4 h-4" />
                    Create
                </Button>
            </div>

            {/* TABLE */}
            <DataTable
    columns={[
        {
            key: "devicename",
            label: "Device Name",
            sortable: true,
        },

        {
            key: "machine",
            label: "Machine",
            sortable: true,
        },

        {
            key: "package",
            label: "Package",
        },

        {
            key: "dimensions",
            label: "Dimensions",
        },

        {
            key: "customer",
            label: "Customer",
            sortable: true,
        },

        {
            key: "areas",
            label: "Areas",
            sortable: true,
        },
    ]}

    data={tableData.data}

    meta={{
        from: tableData.from,
        to: tableData.to,
        total: tableData.total,
        links: tableData.links,
        currentPage: tableData.current_page,
        lastPage: tableData.last_page,
    }}

    filters={tableFilters}

    rowKey="id"

    routeName={route("capability.matrix.index")}

    showExport={true}

    filterConfigs={[

        {
        key: "devicename",
        label: "Device Name",

        options: filterOptions.devicename.map(
            (m) => ({
                label: m,
                value: m,
            })
        ),
    },

    {
        key: "machine",
        label: "Machine",

        options: filterOptions.machines.map(
            (m) => ({
                label: m,
                value: m,
            })
        ),
    },

    {
        key: "customer",
        label: "Customer",

        options: filterOptions.customers.map(
            (c) => ({
                label: c,
                value: c,
            })
        ),
    },

    {
        key: "areas",
        label: "Areas",

        options: filterOptions.areas.map(
            (a) => ({
                label: a,
                value: a,
            })
        ),
    },

    {
        key: "package",
        label: "Package",

        options: filterOptions.packages.map(
            (p) => ({
                label: p,
                value: p,
            })
        ),
    },
]}

    

    actions={[
        {
            label: <Eye className="w-4 h-4" />,

            className:
                "btn-info btn-outline",

            onClick: (row) => {
                setSelectedItem(row);
                setOpenView(true);
            },
        },

        {
            label: (
                <FilePenLine className="w-4 h-4" />
            ),

            className:
                "btn-warning btn-outline",

            onClick: (row) => {
                setEditData(
                    structuredClone(row)
                );

                setOpenEdit(true);
            },
        },

        {
            label: "Delete",

            className:
                "btn-error btn-outline",

            onClick: (row) => {

                if (
                    !confirm(
                        "Delete this item?"
                    )
                ) {
                    return;
                }

                router.delete(
                    route(
                        "capability.matrix.destroy",
                        row.id
                    ),
                    {
                        onSuccess: () => {
                            message.success(
                                "Deleted successfully"
                            );
                        },

                        onError: () => {
                            message.error(
                                "Delete failed"
                            );
                        },
                    }
                );
            },
        },
    ]}
/>

            {/* MODAL */}
            <Modal
                open={openCreate}
                onCancel={() =>
                    setOpenCreate(false)
                }
                width={1600}
                title="Capability Matrix"
                footer={[
                    <Button
                        key="close"
                        onClick={() =>
                            setOpenCreate(false)
                        }
                    >
                        Close
                    </Button>,

                    <Button
                        key="save"
                        type="primary"
                        disabled={!cart.length}
                        onClick={submitAll}
                    >
                        Save All ({cart.length})
                    </Button>,
                ]}
            >
                {/* BASIC INFO */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
                    <div>
                        <label >Machine</label>
                        <Select
                        placeholder="Select Machine"
                        value={data.machine}
                        onChange={onMachineChange}
                        options={machines.map(
                            (m) => ({
                                label: m.machine_num,
                                value: m.machine_num,
                            })
                        )}
                        className="w-full border-gray-400 rounded-md p-2"
                    />
                    </div>

                    <div>
                        <label >Machine Brand</label>
                        <Input
                        value={data.machine_brand}
                        readOnly
                        placeholder="Machine Brand"
                        className="w-full border-gray-400 bg-gray-100/50 rounded-md p-2"
                    />
                    </div>

                    <div>
                        <label >Inspection Capability</label>
                        <Select
                        placeholder="Inspection Capability"
                        value={
                            data.inspection_capability
                        }
                        onChange={(v) =>
                            setData(
                                "inspection_capability",
                                v
                            )
                        }
                        options={[
                            "Mark",
                            "Mark/Ball",
                            "Mark/Lead",
                            "Mark/Lead/PVI",
                            "Mark/Pad",
                            "Mark/Pad/PVI",
                        ].map((v) => ({
                            label: v,
                            value: v,
                        }))}
                        className="w-full border-gray-400 rounded-md p-2"
                    />
                    </div>

                    <div>
                        <label >Device Name</label>
                        <Select
                        showSearch
                        placeholder="Device Name"
                        value={
                            data.devicename ||
                            undefined
                        }
                        onChange={
                            fetchDeviceData
                        }
                        options={packages.map(
                            (p) => ({
                                label: p.devicename,
                                value: p.devicename,
                            })
                        )}
                        className="w-full border-gray-400 rounded-md p-2"
                    />
                    </div>

                    <div>
                        <label >Package</label>
                        <Input
                        value={data.package}
                        readOnly
                        placeholder="Package"
                        className="w-full border-gray-400 bg-gray-100/50 rounded-md"
                    />
                    </div>

                    <div>
                        <label >Dimensions</label>
                        <Input
                        value={data.dimensions}
                        readOnly
                        placeholder="Dimensions"
                        className="w-full border-gray-400 bg-gray-100/50 rounded-md"
                    />
                    </div>

                    <div>
                        <label >Customer</label>
                        <Select
                        placeholder="Customer"
                        value={data.customer}
                        onChange={(v) =>
                            setData(
                                "customer",
                                v
                            )
                        }
                        options={customers.map(
                            (c) => ({
                                label: c.customer_name,
                                value: c.customer_name,
                            })
                        )}
                        className="w-full border-gray-400 rounded-md p-2"
                    />
                    </div>

                    <div>
                        <label >Areas</label>
                        <Select
                        placeholder="Areas"
                        value={data.areas}
                        onChange={(v) =>
                            setData(
                                "areas",
                                v
                            )
                        }
                        options={areas.map(
                            (a) => ({
                                label: a.productline,
                                value: a.productline,
                            })
                        )}
                        className="w-full border-gray-400 rounded-md p-2"
                    />
                    </div>
                </div>

                {/* YES / NO */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
                    {yesNoFields.map((field) => (
                        <div key={field}>
                            <label className="text-xs">
                                {field}
                            </label>

                            {renderYesNo(
                                field
                            )}
                        </div>
                    ))}
                </div>

                {/* ADD BUTTON */}
                <div className="flex justify-end mb-4">
    <Button
        type="dashed"
        onClick={addToCart}
        disabled={hasEmptyFields}
    >
        <DiamondPlus className="w-4 h-4" />
        Add to Cart
    </Button>
</div>

                {/* CART TABLE */}
                <Table
    dataSource={cart}
    rowKey="id"
    pagination={{
        pageSize: 5,
    }}
    scroll={{
        x: "max-content",
    }}
    columns={cartColumns}
/>
            </Modal>
            
            {/* View Modal */}

            <Modal
    open={openView}
    onCancel={() => setOpenView(false)}
    title="View Capability Matrix"
    footer={[
        <Button key="close" onClick={() => setOpenView(false)}>
            Close
        </Button>,
    ]}
    width={1400}
>
    {selectedItem && (
        <div className="grid grid-cols-3 gap-2">

            {/* BASIC */}
            {renderField("Machine", selectedItem.machine)}
            {renderField("Brand", selectedItem.machine_brand)}
            {renderField("Inspection", selectedItem.inspection_capability)}
            {renderField("Device", selectedItem.devicename)}
            {renderField("Package", selectedItem.package)}
            {renderField("Dimensions", selectedItem.dimensions)}
            {renderField("Customer", selectedItem.customer)}
            {renderField("Areas", selectedItem.areas)}

            {/* YES/NO FIELDS */}
            {yesNoFields.map((field) =>
                renderField(field, selectedItem[field])
            )}

        </div>
    )}
</Modal>

{/* Edit Modal */}
<Modal
    open={openEdit}
    onCancel={() => setOpenEdit(false)}
    title="Edit Capability Matrix"
    width={1600}
    footer={[
        <Button key="close" onClick={() => setOpenEdit(false)}>
            Cancel
        </Button>,
        <Button
    key="save"
    type="primary"
    onClick={() => {
        router.put(
            route("capability.matrix.update", editData.id),
            editData,
            {
                onSuccess: () => {
                    message.success("Updated!");
                    setOpenEdit(false);
                },
                onError: (err) => {
                    message.error("Update failed");
                    console.log(err);
                },
            }
        );
    }}
>
    Save Changes
</Button>,
    ]}
>
    {editData && (
        <div className="grid grid-cols-4 gap-2">
            
            <div>
                <label >Machine</label>
                <Input
                value={editData.machine}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        machine: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Machine Brand</label>
                <Input
                value={editData.machine_brand}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        machine_brand: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Inspection Capability</label>
                <Input
                value={editData.inspection_capability}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        inspection_capability: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Device Name</label>
                <Input
                value={editData.devicename}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        devicename: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Package</label>
                <Input
                value={editData.package}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        package: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Dimensions</label>
                <Input
                value={editData.dimensions}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        dimensions: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Customer</label>
                <Input
                value={editData.customer}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        customer: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            <div>
                <label >Areas</label>
                <Input
                value={editData.areas}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        areas: e.target.value,
                    })
                }
                className="w-full border-gray-400 rounded-md"
            />
            </div>

            

            {/* YES/NO EDIT */}
{yesNoFields.map((field) => (
    <div key={field} className="mb-2">
        <label className="text-md block mb-1">
            {field}
        </label>

        <Select
            value={editData[field]}
            onChange={(val) =>
                setEditData((prev) => ({
                    ...prev,
                    [field]: val,
                }))
            }
            options={[
                { label: "Y", value: "Y" },
                { label: "N", value: "N" },
            ]}
            className="w-full border-gray-400 rounded-md p-3"
        />
    </div>
))}
        </div>
    )}
</Modal>
        </AuthenticatedLayout>
    );
}