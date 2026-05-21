import {
    Modal,
    Input,
    Button,
    Table,
    Select,
    message,
} from "antd";
import { Head, useForm, router } from "@inertiajs/react";
import { DiamondPlus } from "lucide-react";

export default function CapabilityMatrixCreateModal({
    open,
    onClose,
    machines,
    customers,
    areas,
    packages,
    cart,
    setCart,
}) {
    const yesNoFields = [
        "d3","d2","term_distance","leadBurr","padBurr",
        "padContain","padDiscoloration","tightendBH",
        "markTop","pinTop","crackTop","chipoutTop","scratchTop",
        "markip","pinip","tipip","pitchip","leadVariance",
        "crack","chipout","scratch","arr","tubetube",
        "tubetape","tapetube","tubetray","traytray",
        "traytape","tapetray","tryjewelbox","canistertray",
        "canistertape","tapetape","withAuxillary",
        "ColoredCamera","detape","machineLearn",
    ];

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

    yesNoFields.forEach((f) => (initialData[f] = ""));

    const { data, setData, reset } = useForm(initialData);

    const yesNo = ["Y", "N"];

    // ================= MACHINE =================
    const onMachineChange = (value) => {
        const selected = machines.find(m => m.machine_num === value);

        setData(prev => ({
            ...prev,
            machine: value,
            machine_brand: selected?.machine_manufacturer || "",
        }));
    };

    // ================= PACKAGE =================
    const fetchDeviceData = (value) => {
        const selected = packages.find(p => p.devicename === value);

        setData(prev => ({
            ...prev,
            devicename: value,
            package: selected
                ? `${selected.lead_count}L ${selected.package_type}`
                : "",
            dimensions: selected?.dimensions || "",
        }));
    };

    // ================= ADD TO CART =================
    const addToCart = () => {
        setCart((prev) => [
            ...prev,
            structuredClone(data),
        ]);

        message.success("Added to cart");
        reset();
    };

    // ================= REMOVE =================
    const removeItem = (index) => {
        setCart((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // ================= SUBMIT =================
    const submitAll = () => {
    console.log("CART:", cart);

    if (!cart.length) {
        message.warning("Cart is empty");
        return;
    }

    router.post(route("capability-matrix.store"), {
        items: cart,
        onSuccess: () => {
            message.success("Saved successfully!");
            setCart([]);
            reset();
        },
        onError: () => {
            message.error("Failed to save");
        },
    });
};

    // ================= YES/NO =================
    const renderYesNo = (field) => (
        <Select
            value={data[field]}
            onChange={(val) => setData(field, val)}
            options={yesNo.map(v => ({ label: v, value: v }))}
        />
    );

    const cartColumns = [
        { title: "Machine", dataIndex: "machine" },
        { title: "Brand", dataIndex: "machine_brand" },
        { title: "Device", dataIndex: "devicename" },
        { title: "Package", dataIndex: "package" },
        { title: "Dimensions", dataIndex: "dimensions" },
        { title: "Customer", dataIndex: "customer" },
        { title: "Areas", dataIndex: "areas" },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={1500}
            title="Capability Matrix"
            footer={[
                <Button key="close" onClick={onClose}>
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
            {/* BASIC */}
            <div className="grid grid-cols-3 gap-2 mb-4">

                <Select
                    placeholder="Machine"
                    value={data.machine}
                    onChange={onMachineChange}
                    options={machines.map(m => ({
                        label: m.machine_num,
                        value: m.machine_num,
                    }))}
                />

                <Input
                    value={data.machine_brand}
                    readOnly
                    placeholder="Brand"
                />

                <Select
                    placeholder="Device"
                    value={data.devicename || undefined}
                    onChange={fetchDeviceData}
                    options={packages.map(p => ({
                        label: p.devicename,
                        value: p.devicename,
                    }))}
                />

                <Input value={data.package} readOnly />
                <Input value={data.dimensions} readOnly />

                <Select
                    placeholder="Customer"
                    value={data.customer}
                    onChange={(v) => setData("customer", v)}
                    options={customers.map(c => ({
                        label: c.customer_name,
                        value: c.customer_name,
                    }))}
                />

                <Select
                    placeholder="Areas"
                    value={data.areas}
                    onChange={(v) => setData("areas", v)}
                    options={areas.map(a => ({
                        label: a.productline,
                        value: a.productline,
                    }))}
                />
            </div>

            {/* YES NO SAMPLE */}
            <div className="grid grid-cols-4 gap-2">
                {["d3", "d2", "crack", "chipout"].map(f => (
                    <div key={f}>
                        <label>{f}</label>
                        {renderYesNo(f)}
                    </div>
                ))}
            </div>

            {/* ADD */}
            <div className="mt-4 flex justify-end">
                <Button
                    type="dashed"
                    onClick={addToCart}
                >
                    <DiamondPlus className="w-4 h-4" /> Add
                </Button>
            </div>

            {/* CART TABLE */}
            <Table
                dataSource={cart}
                rowKey={(_, i) => i}
                pagination={{ pageSize: 5 }}
                columns={[
                    ...cartColumns,
                    {
                        title: "Action",
                        render: (_, __, index) => (
                            <Button
                                danger
                                onClick={() => removeItem(index)}
                            >
                                Remove
                            </Button>
                        ),
                    },
                ]}
            />
        </Modal>
    );
}