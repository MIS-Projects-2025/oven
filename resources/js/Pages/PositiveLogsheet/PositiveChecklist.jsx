import { m } from "framer-motion";
import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { Steps, Select } from "antd";

export default function PositiveChecklist({
  setupData,
  setupId,
  onClose,
  emp_data,
  positiveChecklistItems = [],
}) {

  // console.log(emp_data);

  const [loading, setLoading] = useState(false);
  const [checklistAnswers, setChecklistAnswers] = useState({});

  const empDept = emp_data?.emp_dept?.trim();

  const equipmentTech = ["Equipment Engineering"].includes(empDept);

  const productions = ["Production", "Production / Non - TNR"].includes(empDept);

  if (!setupData) return <div>Loading setup details...</div>;



  const {
    id,
    machine_num,
    ww,
    date,
    shift_time,
    package_type,
    lot_id,
    process_type,
    customer_name,
    badge,
    fill_type,
    machine_type,
    mark_type,
  } = setupData;

  const [formData, setFormData] = useState({
    setup_log_id: id || "",
    machine_num: machine_num || "",
    ww: ww || "",
    fill_type: fill_type || "",
    date: date || "",
    shift_time: shift_time || "",
    package_type: package_type || "",
    lot_id: lot_id || "",
    process_type: process_type || "",
    customer_name: customer_name || "",
    badge: badge || "",
    remarks: "",
  });

  // ✅ Initialize answers correctly as ARRAY



  // ✅ Fill type matcher (missing before)
  const checkFillTypeMatch = (itemFillType) => {
    if (!itemFillType || !formData.fill_type) return false;
    return itemFillType
      .toLowerCase()
      .includes(formData.fill_type.toLowerCase());
  };

  // ✅ Update single row answer
  const handleAnswerChange = (inputVariable, value) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.input_variable === inputVariable
          ? { ...a, result: value }
          : a
      )
    );
  };

  // ✅ Validation (only required rows)

    
    const answers = positiveChecklistItems.map((item) => ({
      input_variable: item.input_variable,
      vision_system: item.vision_system,
      control_item: item.control_item,
      frequency: item.frequency,
      responsible: item.responsible,
      result: checklistAnswers[item.id] || "N/A",
    }));

    const isRequiredByFillType = (item) => {
  if (!formData.fill_type) return false;

  const freq = item.frequency
    .toLowerCase()
    .replace(/-/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const hasStart = freq.includes("start of shift");
  const hasSetup = freq.includes("setup");

  if (hasStart && hasSetup) return true;

  if (formData.fill_type === "Start of Shift") return hasStart;
  if (formData.fill_type === "Setup") return hasSetup;

  return false;
};

  const handleSubmit = () => {
    

    const payload = {
      setup_log_id: id,
      machine_num: machine_num,
      ww: ww,
      date: date,
      shift_time: shift_time,
      badge : badge,
      remarks: formData.remarks || "",
      fill_type: formData.fill_type || "",
      answers: JSON.stringify(answers),
    };

    router.post(route("positive.checklist.store"), payload, {
      onSuccess: () => {
        alert("✅ Checklist saved successfully!");
        window.location.reload();
      },
      onError: (errors) => {
        alert("Failed to save checklist. Please check your inputs.");
        console.error(errors);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[1300px] bg-white h-full p-6 overflow-y-auto">
        <h1 className="text-lg font-bold text-blue-600 mb-4">
          Positive Control Log
        </h1>
            <p className="inline text-stone-500">You Choose:</p> 
            <p
  className={`inline font-semibold text-lg ${
    formData.fill_type === "Start of Shift"
      ? "text-green-500"
      : formData.fill_type === "Setup"
      ? "text-blue-500"
      : "text-gray-700" // fallback color
  }`}
>
  {formData.fill_type}
</p>
        <table className="w-full border border-gray-300 table-auto mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th colSpan={6} className="border px-2 py-1 text-center">
                <label className="text-gray-500">Oven #: </label>
                <input
                  type="text"
                  value={formData.machine_num || ""}
                  readOnly
                  className="w-[200px] border-none bg-transparent text-left text-stone-500"
                />
              </th>
            </tr>

            <tr className="bg-gray-50">
              <th rowSpan={4} colSpan={4} className="border px-2 py-1 text-center">
                <label className="text-gray-500">Workweek: </label>
                <input
                  type="text"
                  value={formData.ww || ""}
                  readOnly
                  className="w-[100px] border-none bg-transparent text-left text-stone-500"
                />
              </th>
            </tr>

            <tr>
              <th className="border px-2 py-1 text-left text-gray-500">Date</th>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={formData.date || ""}
                  readOnly
                  className="w-[150px] border-none bg-transparent text-left text-stone-500"
                />
              </td>
            </tr>

            <tr>
              <th className="border px-2 py-1 text-left text-gray-500">
                Shift / Time
              </th>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={formData.shift_time || ""}
                  readOnly
                  className="w-[120px] border-none bg-transparent text-left text-stone-500"
                />
              </td>
            </tr>

            <tr>
              <th className="border px-2 py-1 text-left text-gray-500">
                Badge
              </th>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={formData.badge || ""}
                  readOnly
                  className="border-none bg-transparent text-left w-full text-stone-500"
                />
              </td>
            </tr>

            <tr className="bg-gray-100 text-stone-500">
              <th className="border px-2 py-1">Input Variable</th>
              <th className="border px-2 py-1">
                Vision System/MC/Part/MC Feature
              </th>
              <th className="border px-2 py-1">Control Item</th>
              <th className="border px-2 py-1">Frequency</th>
              <th className="border px-2 py-1">Responsible</th>
              <th className="border px-2 py-1">Result</th>
            </tr>

            {machine_type === "GRAVITY" && (
              <tr className="bg-white text-stone-500">
                <td
                  colSpan={5}
                  className="border px-2 py-1 text-right text-gray-800"
                >
                  Type of Mark Attribute (Laser/ Ink)
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    value={mark_type || ""}
                    readOnly
                    className="w-32 border-none bg-transparent text-center"
                  />
                </td>
              </tr>
            )}
          </thead>

          <tbody className="text-stone-500">
{positiveChecklistItems.length > 0 ? (
  positiveChecklistItems
    .filter((item) => {
      const responsible = item.responsible?.toLowerCase().trim() || "";

      if (productions) {
        return responsible.includes("operator");
      }

      if (equipmentTech) {
        return responsible.includes("technician");
      }

      return true; // fallback for other departments
    })
    .map((item) => (
      <tr key={item.id || item.input_variable}>
        <td className="border px-2 py-1">{item.input_variable}</td>
        <td className="border px-2 py-1">{item.vision_system}</td>
        <td className="border px-2 py-1">{item.control_item}</td>
        <td className="border px-2 py-1">{item.frequency}</td>
        <td className="border px-2 py-1">{item.responsible}</td>
        <td className="border px-2 py-1 text-center">
<input
  type="text"
  className="border w-30 text-center"
  value={
    !isRequiredByFillType(item)
      ? "N/A"
      : checklistAnswers[item.id] || ""
  }
  disabled={!isRequiredByFillType(item)}
  onChange={(e) => {
    if (!isRequiredByFillType(item)) return;

    const inputVar = item.input_variable;
    let val = e.target.value;

    if (val === "") {
      setChecklistAnswers({ ...checklistAnswers, [item.id]: "" });
      return;
    }

    const upperVal = val.toUpperCase();
    if (upperVal === "N") {
      setChecklistAnswers({ ...checklistAnswers, [item.id]: "N" });
      return;
    } else if (upperVal === "N/") {
      setChecklistAnswers({ ...checklistAnswers, [item.id]: "N/" });
      return;
    } else if (upperVal === "N/A") {
      setChecklistAnswers({ ...checklistAnswers, [item.id]: "N/A" });
      return;
    }

    if (val.startsWith("N")) {
      setChecklistAnswers({ ...checklistAnswers, [item.id]: "" });
      return;
    }

    if (!/^\d*$/.test(val)) return;

    let numVal = Number(val);

    if (inputVar === "Baking Temperature Requirement") {
      if (numVal < 120 || numVal > 155) return;
    } else if (inputVar === "Over Temp. Protection") {
      if (numVal < 5 || numVal > 10) return;
    }

    if (inputVar === "Baking Time Requirement") {
      const allowed = [6, 8, 12, 18, 24, 48];
      if (numVal < allowed[0]) numVal = allowed[0];
      if (numVal > allowed[allowed.length - 1])
        numVal = allowed[allowed.length - 1];

      numVal = allowed.reduce((prev, curr) =>
        Math.abs(curr - numVal) < Math.abs(prev - numVal) ? curr : prev
      );
    }

    setChecklistAnswers({
      ...checklistAnswers,
      [item.id]: numVal.toString(),
    });
  }}
  placeholder="Enter number"
/>
        </td>
      </tr>
    ))
) : (
  <tr>
    <td colSpan={6} className="text-center py-4 text-red-500 font-medium">
      No checklist available.
    </td>
  </tr>
)}

            <tr>
              <td
                colSpan={3}
                className="border px-2 py-1 text-right text-gray-800"
              >
                Remarks
              </td>
              <td colSpan={3} className="border px-2 py-1 text-center">
                <textarea
                  value={formData.remarks}
                  placeholder="Place your Remarks here..."
                  className="w-full h-32 bg-transparent rounded-md resize-none outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value,
                    })
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}