export default function ViewPositiveChecklistModal({ positiveData = [], setShowModal }) {
  // Safely parse answers from each positive checklist item if needed
  // Assuming each positiveData item has a JSON 'answers' field
  const firstItem = positiveData[0] || {}; // For header info
  const answers = firstItem.answers ? JSON.parse(firstItem.answers) : [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={() => setShowModal(false)} />
      <div className="w-[1300px] bg-white h-full p-6 overflow-y-auto">
        <div className="flex justify-end mb-2">
             <button
              className="px-4 py-2 text-red-600 hover:text-red-700"
              onClick={() => setShowModal(false)}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        <div className="flex justify-between text-stone-500">
                <h2 className="text-lg font-bold text-emerald-600 mb-4">
            Positive Control Logsheet
          </h2>
          Reference ID: {firstItem.setup_log_id}
            </div>

        {positiveData.length > 0 ? (
          <table className="w-full border border-gray-300 table-auto mb-6 text-stone-500">
            <thead>
              <tr>
                <td colSpan={6} className="border px-2 py-1 text-center">
                  <label>Machine #: </label>{firstItem.machine_num || "N/A"}
                </td>
              </tr>
              <tr>
                <td colSpan={4} rowSpan={7} className="border px-2 py-1 text-center">
                  <label>Workweek: </label>{firstItem.ww || "N/A"}
                </td>
                <td className="border px-2 py-1 font-semibold">Date</td>
                <td className="border px-2 py-1">{firstItem.date || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Shift</td>
                <td className="border px-2 py-1">{firstItem.shift_time || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Package Type</td>
                <td className="border px-2 py-1">{firstItem.package_type || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Lot ID</td>
                <td className="border px-2 py-1">{firstItem.lot_id || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Process Type</td>
                <td className="border px-2 py-1">{firstItem.process_type || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Customer</td>
                <td className="border px-2 py-1">{firstItem.customer_name || "N/A"}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Badge</td>
                <td className="border px-2 py-1">{firstItem.badge || "N/A"}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Input Variable</th>
                <th className="border px-2 py-1">Vision System/MC/Part/MC Feature</th>
                <th className="border px-2 py-1">Control Item</th>
                <th className="border px-2 py-1">Frequency</th>
                <th className="border px-2 py-1">Responsible</th>
                <th className="border px-2 py-1">Result</th>
              </tr>
              {firstItem.machine_type === 'GRAVITY' && (
              <tr className="bg-white">
                <td colSpan={5} className="border px-2 py-1 text-right text-gray-800"><p>Type of Mark Attribute (Laser/ Ink)</p></td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    value={firstItem.mark_type || undefined}
                    readOnly
                    className="w-32 border-none bg-transparent text-center"
                  />
                </td>
              </tr>
            )}
            </thead>
            <tbody>
              {answers.length > 0 ? (
                answers.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{item.input_variable}</td>
                    <td className="border p-2 text-center">{item.vision_system}</td>
                    <td className="border p-2">{item.control_item}</td>
                    <td className="border p-2">{item.frequency}</td>
                    <td className="border p-2">{item.responsible}</td>
                    <td className="border px-2 py-1 text-center">{item.result || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500 font-medium">
                    No positive checklist items found.
                  </td>
                </tr>
              )}
               <tr>
                <td colSpan={2} className="border p-4 font-semibold text-right">Remarks:</td>
                <td colSpan={4} className="p-4  border">{firstItem.remarks}</td>
              </tr>
             {firstItem.fill_type === "Setup" && (
  <tr>
    <td colSpan={2} className="border p-4 font-semibold text-right">
      Setup Verifier:
    </td>
  <td colSpan={4} className="p-4 border">
  {firstItem.verifier ? (
    <div className="text-left w-16 h-16">
      {/* Outer Circle */}
      <div className="w-full h-full rounded-full border-2 border-indigo-800 flex items-center justify-center relative">
        
        {/* Top Text */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-green-500 font-bold text-xs tracking-widest">
          PASSED
        </div>
        
        {/* Bottom Text (optional) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-indigo-800 font-semibold text-[10px]">
          TSPI
        </div>
        
        {/* Center Value */}
        <div className="text-blue-600 font-semibold text-center text-md px-1">
          {firstItem.verifier}
        </div>
      </div>
    </div>
  ) : (
    <span className="font-semibold text-red-400 cursor-not-allowed">
      Pending Verification. Kindly call the attention of QA personnel.
    </span>
  )}
</td>



  </tr>
)}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-red-500 font-medium">
            No positive checklist data available.
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => setShowModal(false)}
          >
            <i className="fa fa-close"></i> Close
          </button>
        </div>
      </div>
    </div>
  );
}
