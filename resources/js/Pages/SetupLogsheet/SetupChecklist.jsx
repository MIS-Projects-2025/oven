import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState, useEffect } from "react";
import { Select } from "antd";
export default function SetupChecklist({
  tableData,
  tableFilters,
  emp_data,
  machineList,
  setupChecklistItems,
  positiveLogsheet
}) {

  const empDept = emp_data?.emp_dept?.trim();

  const equipmentTech = ["Equipment Engineering"].includes(empDept);

  const productions = ["Production", "Production / Non - TNR"].includes(empDept);

  const canCreateChecklist = 
  ["Equipment Engineering"].includes(emp_data?.emp_dept) && 
  !["superadmin", "admin"].includes(emp_data?.emp_system_role);

  const QADept = ["Quality Assurance", "Quality Management System"].includes(emp_data?.emp_dept);

  const EEProdDept = [productions];

  const [selectedSetup, setSelectedSetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPositiveModal, setShowPositiveModal] = useState(false);
  const [editablePositiveAnswers, setEditablePositiveAnswers] = useState([]);
  const [editingIndexes, setEditingIndexes] = useState({});

  // Find matched positive logsheet
  const matchedPositive = selectedSetup
    ? positiveLogsheet.filter(
        (p) => p.setup_log_id === selectedSetup.setup_log_id
      )
    : [];



  // Parse Setup answers
  const setupAnswers = selectedSetup
    ? JSON.parse(selectedSetup.answers || "[]")
    : [];

  // Open Positive Modal and initialize editable state
  const openPositiveModal = () => {
    if (matchedPositive.length > 0) {
      setEditablePositiveAnswers(
        JSON.parse(matchedPositive[0].answers || "[]")
      );
      setShowPositiveModal(true);
    }
  };





  // Handle PE editing result
const handleResultChange = (index, value) => {
  setEditablePositiveAnswers((prev) => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      result: value,
    };
    return updated;
  });

  // Clear previous timer if exists
  if (editingIndexes[index]?.timeoutId) {
    clearTimeout(editingIndexes[index].timeoutId);
  }

  // Determine if value is no longer N/A → start 10s timer
  if (value !== "N/A") {
    const timeoutId = setTimeout(() => {
      setEditingIndexes((prev) => ({
        ...prev,
        [index]: { locked: true, timeoutId: null },
      }));
    }, 60000); // 10 seconds

    setEditingIndexes((prev) => ({
      ...prev,
      [index]: { locked: false, timeoutId },
    }));
  } else {
    // Still N/A → editable immediately
    setEditingIndexes((prev) => ({
      ...prev,
      [index]: { locked: false, timeoutId: null },
    }));
  }
};

  // Handle QA Verification
const handleVerifyPassed = () => {
  if (!selectedSetup?.setup_log_id) {
    console.log("No setup_log_id");
    return;
  }

  router.put(
    route("logsheet.qape.verify.passed", selectedSetup.setup_log_id),
    {},
    {
      preserveScroll: true,
      onSuccess: () => {
        console.log("✅ Success verify"),
        window.location.reload();
      },
      
      onError: (err) => {
        console.log("Error:", err);
      }
    }
  );
};


const handleSavePositive = () => {
  const isConfirmed = confirm("⚠ Are you sure you want to save the changes?");

  if (!isConfirmed) return;

  router.put(
    route("logsheet.eeprod.update", matchedPositive[0].setup_log_id),
    {
      updated_answers: editablePositiveAnswers,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        alert("✅ Changes saved successfully.");
        setShowPositiveModal(false);
        window.location.reload();
      },
      onError: () => alert("Failed to save changes."),
    }
  );
};

  


      /* =========================
      DATE / SHIFT / WW
  ========================== */
 const getCurrentWorkweek = () => {
  const start = new Date("2024-11-03T19:00:00"); // MUST be Sunday 7PM reference
  const now = new Date();

  // Find the most recent Sunday 19:00 relative to now
  const currentWeekStart = new Date(now);

  // Move to this week's Sunday
  const dayOfWeek = currentWeekStart.getDay(); // 0 = Sunday
  currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
  currentWeekStart.setHours(19, 0, 0, 0); // Set to 7PM

  // If now is BEFORE Sunday 7PM, move back 1 week
  if (now < currentWeekStart) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  }

  const diffDays = Math.floor(
    (currentWeekStart - start) / (1000 * 60 * 60 * 24)
  );

  const totalWeeks = Math.floor(diffDays / 7);

  const cycle = Math.floor(totalWeeks / 52);
  const weekInCycle = (totalWeeks % 52) + 1;

  const base = 501 + cycle * 100;

  return `WW${base + (weekInCycle - 1)}`;
};



 const today = new Date();
  const todayDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate()
  ).padStart(2, "0")}/${today.getFullYear()}`;

 const currentShift =
  today.getHours() >= 7 && today.getHours() <= 18 ? "A" : "C";

const currentTime = `${String(today.getHours()).padStart(2, "0")}:${String(
  today.getMinutes()
).padStart(2, "0")}`;

    const value = `${currentShift}/ ${currentTime}`;

   
     

    const [checklistAnswers, setChecklistAnswers] = useState({});
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
    machine_num: "",
    ww: getCurrentWorkweek(),
    fill_type: "",
    machine_type: "",
    machine_model: "",

    date: todayDate || "",
    shift_time: value || "",
    package_type: "",
    lot_id: "",
    process_type: "",
    customer_name: "",
    badge: emp_data?.emp_id || "",
    mark_type: "",
    remarks: "",
  });

    const answers = setupChecklistItems.map((item) => ({
      item_check: item.check_item,
      frequency: item.frequency,
      responsible: item.responsible,
      result: checklistAnswers[item.id] || "N/A",
    }));

     const machine_Options = [
    ...new Map(
      machineList.map((item) => [
        item.machine_num,
        { value: item.machine_num, label: item.machine_num },
      ])
    ).values(),
  ];

useEffect(() => {
  if (!formData.fill_type) return;

  const autoAnswers = {};

  setupChecklistItems.forEach((item) => {
    // Normalize frequency text
    const freq = item.frequency
      .toLowerCase()
      .replace(/-/g, "")       // remove dash (Set-up → Setup)
      .replace(/\s+/g, " ")    // normalize spaces
      .trim();

    const hasStart = freq.includes("start of shift");
    const hasSetup = freq.includes("setup");

    // BOTH (Every start of shift & Every Setup)
    if (hasStart && hasSetup) {
      autoAnswers[item.id] = "✔";
    }

    // START OF SHIFT selected
    else if (formData.fill_type === "Start of Shift") {
      autoAnswers[item.id] = hasStart ? "✔" : "N/A";
    }

    // SETUP selected
    else if (formData.fill_type === "Setup") {
      autoAnswers[item.id] = hasSetup ? "✔" : "N/A";
    }
  });

  setChecklistAnswers(autoAnswers);
}, [formData.fill_type]);


  // ---------- DataTable Action ----------
const dataWithAction = tableData.data.map((r) => ({
  ...r,
  fill_type: (
  <span
    className={`px-2 py-1 text-xs font-semibold border-2 rounded-md ${
      r.fill_type === "Setup"
        ? "text-blue-600 bg-blue-200 border-blue-400"
        : r.fill_type === "Start of Shift"
        ? "text-green-600 bg-green-200 border-green-400"
        : "text-red-600 bg-red-200 border-red-400"
    }`}
  >
    {r.fill_type || "-"}
  </span>
),

verifier: r.verifier && r.fill_type === 'Setup' ? (
    <div className="text-left w-16 h-16">
        {/* Outer Circle */}
        <div className="w-full h-full rounded-full border border-indigo-800 flex items-center justify-center relative">

            {/* Top Text */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
                PASSED
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
                TSPI
            </div>

            {/* Center Value */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 text-blue-600 font-semibold text-md px-1">
                {r.verifier}
            </div>
        </div>
    </div>
) : null,


  action: (
    <div className="flex gap-2">
      <button
        className="px-3 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-700 border-2 border-white"
        onClick={() => {
          setSelectedSetup(r);
          setShowSetupModal(true);
        }}
      >
        <i className="fas fa-eye"></i> View
      </button>
    </div>
    
  ),
}));


  
  return (
    <AuthenticatedLayout>
      <Head title="Setup Checklist" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-stone-500">
        <h1 className="text-2xl font-bold">
          <i className="fa-solid fa-clipboard"></i> Control Logsheet List
        </h1>
      

{canCreateChecklist && (
  <button
    className="p-2 rounded-md text-white bg-stone-500 border border-stone-500 hover:bg-stone-600"
    onClick={() => setShowModal(true)}
  >
    <i className="fa-solid fa-plus"></i> New Checklist
  </button>
)}
      </div>

      {/* Existing DataTable */}
      <DataTable
        columns={[
          { key: "machine_num", label: "Machine #" },
          { key: "ww", label: "Workweek" },
          { key: "date", label: "Date" },
          { key: "shift_time", label: "Shift/Time" },
          { key: "badge", label: "Badge" },
          { key: "fill_type", label: "Fillup Type" },
          { key: "verifier", label: "Verifier" },
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
        routeName={route("setup-new.checklist.index")}
        filters={tableFilters}
        rowKey="id"
        showExport={false}
      />

            {/* ---------- Modal for Setup Checklist ---------- */}
{/* ---------- Modal for Setup Checklist ---------- */}
{showModal && (
  <div className="fixed inset-0 z-50 flex">
    <div
      className="flex-1 bg-black/40"
      onClick={() => {
        setShowModal(false);
        setFormData({ ...formData, fill_type: "" });
      }}
    />
    <div className="w-[1300px] bg-white h-full p-6 overflow-y-auto">

      {/* ================= HEADER ================= */}
      <h1 className="text-lg font-bold text-emerald-600 mb-6">
        {formData.fill_type ? "Setup Control Log" : "Select Fill Type"}
      </h1>

      {/* =====================================================
          STEP 1 : SELECT FILL TYPE
      ====================================================== */}
      {!formData.fill_type && (
  <div className="flex flex-col items-center mt-20">
    <p
  className="text-indigo-800 mb-10 text-2xl font-medium font-bold"
  style={{ fontFamily: "'Patrick Hand', cursive" }}
>
  Please select checklist type !
</p>

    <div className="grid grid-cols-2 gap-12">
      
      {/* START OF SHIFT CARD */}
      <div
        onClick={() =>
          setFormData({ ...formData, fill_type: "Start of Shift" })
        }
        className="cursor-pointer w-72 p-8 bg-white border-2 border-green-500 rounded-2xl shadow-md
                   hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300
                   hover:border-green-600 animate-fade-in-up hover:bg-green-100"
      >
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl mb-4 text-green-600 animate-pulse">
            <i className="fa-solid fa-clock"></i>
          </div>

          <h2 className="text-xl font-bold text-green-600 mb-2">
            Start of Shift
          </h2>

          <p className="text-gray-500 text-sm">
            Perform required checks at the beginning of the shift.
          </p>
        </div>
      </div>

      {/* SETUP CARD */}
      <div
        onClick={() =>
          setFormData({ ...formData, fill_type: "Setup" })
        }
        className="cursor-pointer w-72 p-8 bg-white border-2 border-blue-500 rounded-2xl shadow-md
                   hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300
                   hover:border-blue-600 animate-fade-in-up hover:bg-blue-100"
      >
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl mb-4 text-blue-600 animate-pulse">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>

          <h2 className="text-xl font-bold text-blue-600 mb-2">
            Setup
          </h2>

          <p className="text-gray-500 text-sm">
            Perform machine validation during setup operation.
          </p>
        </div>
      </div>

    </div>
  </div>
)}

      {/* =====================================================
          STEP 2 : CHECKLIST FORM
      ====================================================== */}
      {formData.fill_type && (
        <>
          {/* Back / Change Fill Type */}
<button
  className="mb-6 flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
  onClick={() => setFormData({ ...formData, fill_type: "" })}
>
  {/* Arrow / action indicator */}
  <span className="text-rose-600 font-bold text-lg animate-pulse">
    ←
  </span>

  {/* Main text */}
  <span className="text-stone-600 text-sm">
    Change Fill Type?
  </span>

  {/* Current selection */}
  <span
    className={`font-semibold text-sm px-2 py-1 rounded-full ${
      formData.fill_type === "Start of Shift"
        ? "bg-green-100 text-green-700"
        : "bg-blue-100 text-blue-700"
    }`}
  >
    {formData.fill_type}
  </span>
</button>

          <table className="w-full border border-gray-300 table-auto mb-6">
            <thead>
              <tr>
                <th colSpan="4" className="border px-2 py-2">
                  <Select
                    showSearch
                    className="w-60 border border-gray-500 p-2 rounded-md text-gray-500"
                    placeholder="Select Oven..."
                    options={machine_Options}
                    value={formData.machine_num || undefined}
                    onChange={(value) =>
                      setFormData({ ...formData, machine_num: value })
                    }
                  />
                </th>
              </tr>

              <tr>
                <th rowSpan={3} colSpan={2} className="border px-2 py-1">
                  <label className="text-stone-500">Workweek: </label>
                  <input
                    type="text"
                    className="border-none p-2 rounded w-24 text-center text-gray-500"
                    value={formData.ww || ""}
                    readOnly
                  />
                </th>
                <th className="text-left border px-2 py-1">
                  <label className="text-stone-500">Date:</label>
                </th>
                <th className="text-left border px-2 py-1">
                  <input
                    type="text"
                    className="border-gray-400 p-2 rounded w-full text-gray-500"
                    value={formData.date || ""}
                    readOnly
                  />
                </th>
              </tr>

              <tr>
                <th className="text-left border px-2 py-1">
                  <label className="text-stone-500">Shift/ Time:</label>
                </th>
                <th className="text-left border px-2 py-1">
                  <input
                    type="text"
                    className="border-gray-400 p-2 rounded w-full text-gray-500"
                    value={formData.shift_time || ""}
                    readOnly
                  />
                </th>
              </tr>

              <tr>
                <th className="text-left border px-2 py-1">
                  <label className="text-stone-500">Badge:</label>
                </th>
                <th className="text-left border px-2 py-1">
                  <input
                    type="text"
                    className="border-gray-400 p-2 rounded w-full text-gray-500"
                    value={formData.badge || ""}
                    readOnly
                  />
                </th>
              </tr>

              <tr className="bg-gray-100 text-stone-500">
                <th className="border px-2 py-1">Item to Check</th>
                <th className="border px-2 py-1">Frequency</th>
                <th className="border px-2 py-1">Responsible</th>
                <th className="border px-2 py-1"></th>
              </tr>
            </thead>

            <tbody className="text-stone-500">
              {setupChecklistItems.length > 0 ? (
                setupChecklistItems
                  .filter((item) => {
                    const responsible = item.responsible.toLowerCase();

                    if (productions) {
                      return responsible.includes("operator");
                    }

                    if (equipmentTech) {
                      return responsible.includes("technician");
                    }

                    return true;
                  })
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-1">{item.check_item}</td>
                      <td className="border px-2 py-1">{item.frequency}</td>
                      <td className="border px-2 py-1">{item.responsible}</td>
                      <td className="border px-2 py-1 text-center">
                        <select
  className="border w-30 text-center"
  value={checklistAnswers[item.id] || ""}
  onChange={(e) =>
    setChecklistAnswers({
      ...checklistAnswers,
      [item.id]: e.target.value,
    })
  }
>
  <option value="" disabled>
    Select
  </option>
  <option value="✔">✔</option>
  <option value="N/A">N/A</option>
</select>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-red-500 font-medium"
                  >
                    No checklist available.
                  </td>
                </tr>
              )}

              <tr>
                <td className="border px-2 py-1 text-right">
                  <label>Remarks:</label>
                </td>
                <td colSpan={3} className="border px-2 py-1">
                  <textarea
                    rows="3"
                    className="border-gray-400 p-2 rounded w-full text-gray-500"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remarks: e.target.value,
                      })
                    }
                    value={formData.remarks || ""}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ================= SUBMIT BUTTON ================= */}
          <div className="flex justify-end">
            <button
              disabled={!formData.machine_num || !formData.fill_type}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={async () => {
                try {
                  const payload = {
                    machine_num: formData.machine_num,
                    ww: formData.ww,
                    date: formData.date,
                    shift_time: formData.shift_time,
                    badge: formData.badge,
                    fill_type: formData.fill_type,
                    remarks: formData.remarks || "",
                    answers: JSON.stringify(answers),
                  };

                  router.post(route("setup.checklist.store"), payload, {
                    onError: (errors) => {
                      if (errors.duplicate) {
                        alert(errors.duplicate);
                        window.location.reload();
                      } else {
                        alert("Failed to save checklist.");
                      }
                    },
                    onSuccess: () => {
                      alert("✅ Checklist saved successfully!");
                      setShowModal(false);
                      setFormData({
                        ...formData,
                        fill_type: "",
                        machine_num: "",
                        remarks: "",
                      });
                      setChecklistAnswers({});
                    },
                  });
                } catch (error) {
                  console.error("Failed to save checklist:", error);
                }
              }}
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

{/* ================= SETUP MODAL ================= */}
      {showSetupModal && selectedSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full p-6 overflow-auto max-h-[90vh] relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowSetupModal(false)}
            >
              <i className="fa-solid fa-xmark text-red-500 hover:text-red-600 px-4 py-2"></i>
            </button>
            <div className="flex justify-between mt-4">
              <h2 className="text-lg font-bold text-emerald-600 mb-4">
                Setup Control Logsheet
              </h2>
                <p className="text-stone-600">
  Reference ID:{" "}
  {selectedSetup.setup_log_id ? (
    selectedSetup.setup_log_id
  ) : (
    <span className="text-red-600 font-semibold">No Reference ID</span>
  )}
</p>
            </div>
            
            {matchedPositive.length > 0 && (
              <div className="text-right mb-4">
                <button
                  className="px-3 py-2 bg-blue-500 text-white rounded"
                  onClick={openPositiveModal}
                >
                 <i className="fa-solid fa-magnifying-glass"></i> View Positive Logsheet
                </button>
              </div>
            )}
            <table className="w-full border mb-6">
              <thead className="text-stone-500">
                 <tr>
                <td colSpan={4} className="border px-2 py-1 text-center">
                  <label>Machine #: </label>{selectedSetup.machine_num || "N/A"}
                </td>
              </tr>
              <tr>
                <td colSpan={2} rowSpan={3} className="border px-2 py-1 text-center">
                  <label>Workweek: </label>{selectedSetup.ww || "N/A"}
                </td>
                <td className="border px-2 py-1 font-semibold">Date</td>
                <td className="border px-2 py-1">{selectedSetup.date || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Shift</td>
                <td className="border px-2 py-1">{selectedSetup.shift_time || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Badge</td>
                <td className="border px-2 py-1">{selectedSetup.badge || "N/A"}</td>
              </tr>
                <tr className="bg-gray-100">
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Frequency</th>
                  <th className="border p-2">Responsible</th>
                  <th className="border p-2">Result</th>
                </tr>
              </thead>
              <tbody className="text-stone-500">
                {setupAnswers.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.item_check}</td>
                    <td className="border p-2">{item.frequency}</td>
                    <td className="border p-2">{item.responsible}</td>
                    <td className="border p-2 text-center">
                      {item.result}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border p-4 font-semibold text-right">Remarks:</td>
                  <td colSpan={3} className="p-4  border">{selectedSetup.remarks}</td>
                </tr>
                {selectedSetup.setup_log_id && selectedSetup.fill_type === "Setup" &&  (
                <tr>
                  <td className="border p-3 font-semibold text-right">
                    Setup Verifier:
                  </td>
                  <td colSpan={3} className="border p-3">
  {selectedSetup.verifier ? (
   <div className="text-left w-16 h-16">
      {/* Outer Circle */}
      <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">
        
        {/* Top Text */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
          {selectedSetup.verify_status}
        </div>
        
        {/* Bottom Text (optional) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
          TSPI
        </div>
        
        {/* Center Value */}
        <div className="text-blue-600 font-semibold text-center text-md px-1">
          {selectedSetup.verifier}
        </div>
      </div>
    </div>

) : QADept ? (
  // 🟢 QA can verify
  <div className="flex items-center gap-4">
    
    {/* Stamp */}
    <div className="w-16 h-16 relative ml-4">
      <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">
        
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-indigo-800 font-bold text-[12px]">
          TSPI
        </div>

        <div className="text-blue-600 font-bold text-md px-1">
          {emp_data?.emp_id}
        </div>
      </div>
    </div>

    {/* Verify Button */}
    <button
      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2 transition"
      onClick={handleVerifyPassed}
    >
      <i className="fa-solid fa-check-double"></i>
      <span>Verify</span>
    </button>

  </div>

) : (
  // 🔴 Not QA and not verified
  <span className="text-red-500">
    Pending Verification. Kindly call QA personnel.
  </span>
)}
</td>
                

                </tr>
                  )}
              </tbody>
            </table>

            
          </div>
        </div>
      )}

      {/* ================= POSITIVE MODAL ================= */}
      {showPositiveModal && matchedPositive.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full p-6 overflow-auto max-h-[90vh] relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowPositiveModal(false)}
            >
                <i className="fa-solid fa-xmark text-red-500 hover:text-red-600 px-4 py-2"></i>
            </button>
<div className="flex justify-between mt-4">
              <h2 className="text-lg font-bold text-emerald-600 mb-4">
                Positive Control Logsheet
              </h2>
                Reference ID: {matchedPositive[0].setup_log_id}
            </div>
           <div className="flex justify-between items-center mb-4">
             
            {matchedPositive[0].modified_by &&
            <div className="text-right">
                <label>Modified By:</label> <label className="font-bold">{matchedPositive[0].modified_by}</label><br />
                <label>Reason of Modification: </label><br /> <label className="font-bold">{matchedPositive[0].reason}</label>
            </div>
            }
           </div>

            <table className="w-full border mb-6">
              <thead>
                 <tr>
                <td colSpan={6} className="border px-2 py-1 text-center">
                  <label>Machine #: </label>{matchedPositive[0].machine_num || "N/A"}
                </td>
              </tr>
              <tr>
                <td colSpan={4} rowSpan={7} className="border px-2 py-1 text-center">
                  <label>Workweek: </label>{matchedPositive[0].ww || "N/A"}
                </td>
                <td className="border px-2 py-1 font-semibold">Date</td>
                <td className="border px-2 py-1">{matchedPositive[0].date || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Shift</td>
                <td className="border px-2 py-1">{matchedPositive[0].shift_time || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Package Type</td>
                <td className="border px-2 py-1">{matchedPositive[0].package_type || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Lot ID</td>
                <td className="border px-2 py-1">{matchedPositive[0].lot_id || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Process Type</td>
                <td className="border px-2 py-1">{matchedPositive[0].process_type || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Customer</td>
                <td className="border px-2 py-1">{matchedPositive[0].customer_name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Badge</td>
                <td className="border px-2 py-1">{matchedPositive[0].badge || "N/A"}</td>
              </tr>
                <tr className="bg-gray-100">
                  <th className="border p-2">Input Variable</th>
                  <th className="border p-2">Vision System</th>
                  <th className="border p-2">Control Item</th>
                  <th className="border p-2">Frequency</th>
                  <th className="border p-2">Responsible</th>
                  <th className="border p-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {editablePositiveAnswers.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.input_variable}</td>
                    <td className="border p-2">{item.vision_system}</td>
                    <td className="border p-2">{item.control_item}</td>
                    <td className="border p-2">{item.frequency}</td>
                    <td className="border p-2">{item.responsible}</td>
                    <td className="border p-2 text-center">
{productions &&
 !selectedSetup.verifier &&
 (
   item.frequency?.includes("End of the shift") ||
   item.frequency?.includes("Start of shift") ||
   item.frequency?.includes("Every Setup")
 ) &&
 !editingIndexes[index]?.locked ? (
  <input
    type="text"
    value={item.result === "N/A" ? "" : item.result}
    className="border w-24 text-center rounded-md"
    onChange={(e) => handleResultChange(index, e.target.value)}
  />
) : (
  item.result || "N/A"
)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="border p-4 font-semibold text-right">Remarks:</td>
                  <td colSpan={4} className="p-4  border">{matchedPositive[0].remarks}</td>
                </tr>
                {selectedSetup.setup_log_id && selectedSetup.fill_type === "Setup" &&  (
                <tr>
                  <td colSpan={2} className="border p-3 font-semibold text-right">
                    Setup Verifier:
                  </td>
                  <td colSpan={4} className="border p-3">
                    {selectedSetup.verifier ? (
                      <div className="text-left w-16 h-16">
      {/* Outer Circle */}
      <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">
        
        {/* Top Text */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
          {selectedSetup.verify_status}
        </div>
        
        {/* Bottom Text (optional) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
          TSPI
        </div>
        
        {/* Center Value */}
        <div className="text-blue-600 font-semibold text-center text-md px-1">
          {selectedSetup.verifier}
        </div>
      </div>
    </div>
                    ) : QADept ? (
                       <div className="flex items-center gap-4">
      
      {/* Stamp */}
      <div className="w-16 h-16 relative">
        <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">
          
          

          {/* Bottom Text */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-indigo-800 font-bold text-[12px]">
            TSPI
          </div>

          {/* Center Value */}
          <div className="text-blue-600 font-bold text-md px-1">
            {emp_data?.emp_id }
          </div>
        </div>
      </div>
                      <button
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2 transition"
                        onClick={handleVerifyPassed}
                      >
                       <i className="fa-solid fa-check-double"></i> Verify
                      </button>
                      </div>
                    ) : (
                      <span className="text-red-400">
                        Pending Verification. Kindly call QA personnel.
                      </span>
                    )}
                  </td>
                </tr>
                )}
              </tbody>
            </table>

            {productions &&
 !selectedSetup.verifier &&
 editablePositiveAnswers.some((item, idx) =>
   item.frequency === "End of the shift" && !editingIndexes[idx]?.locked
 ) && (
  <div className="text-right">
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={handleSavePositive}
    >
      Save Changes
    </button>
  </div>
)}
          </div>
        </div>
      )}
       </AuthenticatedLayout>
    );
}

