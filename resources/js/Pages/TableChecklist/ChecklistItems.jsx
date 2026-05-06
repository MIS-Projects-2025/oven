import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { Drawer, Button, Input, Space } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, EditOutlined, CloseOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BookTwoTone } from "@ant-design/icons";

import { useState } from "react";
import { Select, Tag, Tooltip } from "antd";
import { CancelOutlined } from "@mui/icons-material";

export default function ChecklistItems({ tableData, tableFilters, checkItem }) {

    const { Option } = Select;
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [viewItems, setViewItems] = useState([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedItems, setEditedItems] = useState([]);


    const openViewDrawer = (category) => {
        const filtered = checkItem.filter(
            (item) => item.category === category
        );

        setSelectedCategory(category);
        setViewItems(filtered);
        setEditedItems(JSON.parse(JSON.stringify(filtered))); // deep copy
        setEditingRowId(null);
        setViewOpen(true);
    };

    const handleEditChange = (index, field, value) => {
        const updated = [...editedItems];
        updated[index][field] = value;
        setEditedItems(updated);
    };

    const saveRow = (row) => {
        router.put(
            route("checklist.item.update", row.id),
            row,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingRowId(null);
                },
            }
        );
    };






    const [rows, setRows] = useState([
        {
            category: "",
            checklist_item: "",
            requirement: "",
            activity: "",
            frequency: "",
        },
    ]);

    /* =======================
        TABLE VIEW BUTTON
    ======================== */
    const dataTable = tableData.data.map((row) => ({
        category: row.category,
        created_by: row.created_by,
        ViewTable: (
            <button
                className="px-3 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600"
                onClick={() => openViewDrawer(row.category)}
            >
                <i className="fa-solid fa-eye"></i> View
            </button>
        ),

    }));

    /* =======================
        ROW HANDLERS
    ======================== */
    const addRow = () => {
        setRows([
            ...rows,
            {
                category: "",
                checklist_item: "",
                requirement: "",
                activity: "",
                frequency: "",
            },
        ]);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    /* =======================
        SUBMIT BULK INSERT
    ======================== */
    const submitChecklist = () => {
        router.post(
            route("checklist.store.bulk"),
            { items: rows },
            {
                onSuccess: () => {
                    setOpen(false);
                    setRows([
                        {
                            category: "",
                            checklist_item: "",
                            requirement: "",
                            activity: "",
                            frequency: "",
                        },
                    ]);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Checklist" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-blue-500">
                    <i className="fa-solid fa-list-check mr-2"></i>
                    Checklist Items
                </h1>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpen(true)}
                >
                    New Checklist
                </Button>
            </div>

            <DataTable
                columns={[
                    { key: "category", label: "Category" },
                    { key: "created_by", label: "Created By" },
                    { key: "ViewTable", label: "View" },
                ]}
                data={dataTable}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("admin")}
                filters={tableFilters}
                rowKey="id"
                showExport={false}
            />

            {/* =======================
    ANT DESIGN DRAWER
======================== */}
            <Drawer
                title="New Checklist Items"
                size={1400}
                onClose={() => setOpen(false)}
                open={open}
                extra={
                    <Space>
                        <Button color="danger" variant="solid" icon={<CancelOutlined />} onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            type="primary"
                            color="green"
                            variant="solid"
                            icon={<SaveOutlined />}
                            onClick={submitChecklist}
                        >
                            Save
                        </Button>
                    </Space>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">Checklist Item</th>
                                <th className="p-2 border">Requirement</th>
                                <th className="p-2 border">Activity</th>
                                <th className="p-2 border">Frequency</th>
                                <th className="p-2 border w-20">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    {/* CATEGORY */}
                                    <td className="p-2 border">
                                        <Select
                                            value={row.category || undefined}
                                            onChange={(value) =>
                                                handleChange(
                                                    index,
                                                    "category",
                                                    value
                                                )
                                            }
                                            placeholder="Select Category..."
                                            className="w-full p-2 border border-gray-500"
                                            size="middle"
                                        >

                                            <Select.Option value="Tubing">
                                    Tubing
                                </Select.Option>
                                <Select.Option value="Taping">
                                    Taping
                                </Select.Option>
                                <Select.Option value="Tray">
                                    Tray
                                </Select.Option>
                                <Select.Option value="Cannister">
                                    Cannister
                                </Select.Option>
                                        </Select>
                                    </td>

                                    {/* CHECKLIST ITEM */}
                                    <td className="p-2 border">
                                        <Input
                                            value={row.checklist_item}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    "checklist_item",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Checklist Item"
                                            className="rounded-md"
                                        />
                                    </td>

                                    {/* REQUIREMENT */}
                                    <td className="p-2 border">
                                        <Input
                                            value={row.requirement}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    "requirement",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Requirement"
                                            className="rounded-md w-full"
                                        />
                                    </td>

                                    {/* ACTIVITY */}
                                    <td className="p-2 border">
                                        <Select
                                            value={row.activity || undefined}
                                            onChange={(value) =>
                                                handleChange(
                                                    index,
                                                    "activity",
                                                    value
                                                )
                                            }
                                            placeholder="Activity"
                                            className="w-full p-2 border border-gray-500"
                                            size="middle"
                                        >
                                            <Select.Option value="N/A">N/A</Select.Option>
                                            <Select.Option value="A">
                                                A - Check
                                            </Select.Option>
                                            <Select.Option value="A/B">
                                                A/B - Check / Clean
                                            </Select.Option>
                                            <Select.Option value="B">
                                                B - Clean
                                            </Select.Option>
                                            <Select.Option value="C">
                                                C - Visual Inspection
                                            </Select.Option>
                                            <Select.Option value="D">
                                                D - Turn On
                                            </Select.Option>
                                        </Select>
                                    </td>

                                    {/* FREQUENCY */}
                                    <td className="p-2 border">
                                        <Select
                                            value={row.frequency || undefined}
                                            onChange={(value) =>
                                                handleChange(
                                                    index,
                                                    "frequency",
                                                    value
                                                )
                                            }
                                            placeholder="Frequency"
                                            className="w-full p-2 border border-gray-500"
                                            size="middle"
                                        >
                                            <Select.Option value="N/A">N/A</Select.Option>
                                            <Select.Option value="I">
                                                I - Start of the Shift
                                            </Select.Option>
                                            <Select.Option value="I/O">
                                                I/O - Start / End of the Shift
                                            </Select.Option>
                                            <Select.Option value="M">
                                                M - Middle of the Shift
                                            </Select.Option>
                                            <Select.Option value="O">
                                                O - End of the Shift
                                            </Select.Option>
                                        </Select>
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-2 border text-center">
                                        {rows.length > 1 && (
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeRow(index)}
                                                className="bg-red-500 text-white hover:bg-red-600"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ADD ROW */}
                    <Button
                        type="dashed"
                        size="large"
                        color="blue"
                        variant="solid"
                        icon={<PlusOutlined />}
                        onClick={addRow}
                        className="mt-6"
                        block
                    >
                        Add Row
                    </Button>
                </div>
            </Drawer>

            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <BookTwoTone />
                        <span className="font-semibold text-lg">
                            Checklist Items — {selectedCategory}
                        </span>
                    </div>
                }
                size={1350}
                open={viewOpen}
                onClose={() => setViewOpen(false)}
            >
                <div className="overflow-auto rounded-lg shadow border">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr className="text-gray-700 text-sm uppercase">
                                <th className="p-3 border">
                                    <FileTextOutlined /> Checklist Item
                                </th>
                                <th className="p-3 border">
                                    <CheckCircleOutlined /> Requirement
                                </th>
                                <th className="p-3 border">
                                    Activity
                                </th>
                                <th className="p-3 border">
                                    <ClockCircleOutlined /> Frequency
                                </th>
                                <th className="p-3 border w-36 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {editedItems.map((item, index) => {
                                const isEditing = editingRowId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-blue-50 transition"
                                    >
                                        {/* CHECKLIST ITEM */}
                                        <td className="p-3 border font-medium">
                                            {isEditing ? (
                                                <Input
                                                    value={item.checklist_item}
                                                    onChange={(e) =>
                                                        handleEditChange(
                                                            index,
                                                            "checklist_item",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="rounded-md"
                                                />
                                            ) : (
                                                item.checklist_item
                                            )}
                                        </td>

                                        {/* REQUIREMENT */}
                                        <td className="p-3 border">
                                            {isEditing ? (
                                                <Input
                                                    value={item.requirement}
                                                    onChange={(e) =>
                                                        handleEditChange(
                                                            index,
                                                            "requirement",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="rounded-md text-lg text-black"
                                                />
                                            ) : (
                                                item.requirement
                                            )}
                                        </td>

                                        {/* ACTIVITY */}
                                        <td className="p-3 border">
                                            {isEditing ? (
                                                <Select
                                                    value={item.activity}
                                                    onChange={(value) =>
                                                        handleEditChange(
                                                            index,
                                                            "activity",
                                                            value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-500"
                                                >
                                                    <Select.Option value="N/A">N/A</Select.Option>
                                                    <Select.Option value="A">A - Check</Select.Option>
                                                    <Select.Option value="A/B">A/B - Check / Clean</Select.Option>
                                                    <Select.Option value="B">B - Clean</Select.Option>
                                                    <Select.Option value="C">C - Visual Inspection</Select.Option>
                                                    <Select.Option value="D">D - Turn On</Select.Option>
                                                </Select>
                                            ) : (
                                                <Tag color="blue">{item.activity}</Tag>
                                            )}
                                        </td>

                                        {/* FREQUENCY */}
                                        <td className="p-3 border">
                                            {isEditing ? (
                                                <Select
                                                    value={item.frequency}
                                                    onChange={(value) =>
                                                        handleEditChange(
                                                            index,
                                                            "frequency",
                                                            value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-500"
                                                >
                                                    <Select.Option value="N/A">N/A</Select.Option>
                                                    <Select.Option value="I">I - Start</Select.Option>
                                                    <Select.Option value="I/O">I/O - Start / End</Select.Option>
                                                    <Select.Option value="M">M - Middle</Select.Option>
                                                    <Select.Option value="O">O - End</Select.Option>
                                                </Select>
                                            ) : (
                                                <Tag color="purple">{item.frequency}</Tag>
                                            )}
                                        </td>

                                        {/* ACTION */}
                                        <td className="p-3 border text-center space-x-2">
                                            {isEditing ? (
                                                <>
                                                    <Tooltip title="Save">
                                                        <Button
                                                            color="green"
                                                            variant="solid"
                                                            icon={<SaveOutlined />}
                                                            onClick={() => saveRow(item)}
                                                        />
                                                    </Tooltip>

                                                    <Tooltip title="Cancel">
                                                        <Button
                                                            color="danger"
                                                            variant="solid"
                                                            icon={<CloseOutlined />}
                                                            onClick={() => setEditingRowId(null)}
                                                        />
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <Tooltip title="Edit Row">
                                                    <Button
                                                        type="primary"
                                                        color="blue"
                                                        variant="solid"
                                                        icon={<EditOutlined />}
                                                        onClick={() => setEditingRowId(item.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Drawer>



        </AuthenticatedLayout>
    );
}
