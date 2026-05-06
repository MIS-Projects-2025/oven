import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DataTable from "@/Components/DataTable";
import { useState } from "react";

export default function Logsheet({ tableData, tableFilters, emp_data, positiveLogsheet, stampNo }) {



  const QADept = ["Quality Assurance", "Quality Management System"].includes(emp_data?.emp_dept);
  const PEDept = emp_data?.emp_dept === "Process Engineering"; // make sure spelling matches DB

  const [selectedSetup, setSelectedSetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPositiveModal, setShowPositiveModal] = useState(false);
  const [editablePositiveAnswers, setEditablePositiveAnswers] = useState([]);

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
  const reason = prompt(
    "Please provide reason/document for modifying the result:"
  );

  if (!reason || reason.trim() === "") {
    alert("Reason is required before saving.");
    return;
  }

  router.put(
  route("logsheet.qape.modify", matchedPositive[0].setup_log_id),
  {
    updated_answers: editablePositiveAnswers,
    reason: reason,
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


  // Add action column
  const dataWithAction = tableData.data.map((r) => ({
    ...r,
    action: (
      <button
        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={() => {
          setSelectedSetup(r);
          setShowSetupModal(true);
        }}
      >
       <i className="fa-solid fa-eye"></i> View
      </button>
    ),
  }));



  return (
    <AuthenticatedLayout>
      <Head title="Setup Logsheet" />

      <DataTable
        columns={[
          { key: "machine_num", label: "Machine" },
          { key: "ww", label: "Workweek" },
          { key: "date", label: "Date" },
          { key: "shift_time", label: "Shift/Time" },
          { key: "badge", label: "Badge" },
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
        routeName={route("setup.logsheet.qape.index")}
        filters={tableFilters}
        rowKey="setup_log_id"
        showExport={false}
      />

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
                {selectedSetup.setup_log_id && (
                <tr>
                  <td className="border p-3 font-semibold text-right">
                    Setup Verifier:
                  </td>
                  
                    
                
                  <td colSpan={3} className="border p-3">
  {selectedSetup.verifier ? (
  // ✅ Already verified
  <span className="text-green-600 font-bold">
    {selectedSetup.verifier}
  </span>

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
                      {PEDept && item.result !== "N/A" ? (
                        <input
                          type="text"
                          value={item.result}
                          className="border w-20 text-center"
                          onChange={(e) =>
                            handleResultChange(index, e.target.value)
                          }
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
                <tr>
                  <td colSpan={2} className="border p-3 font-semibold text-right">
                    Setup Verifier:
                  </td>
                  <td colSpan={4} className="border p-3">
                    {selectedSetup.verifier && !selectedSetup.setup_log_id ? (
                      <span className="text-green-600 font-bold">
                        {selectedSetup.verifier}
                      </span>
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
              </tbody>
            </table>

            {PEDept && !matchedPositive[0].reason &&  (
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
