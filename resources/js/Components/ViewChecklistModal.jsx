import CancelIcon from "@mui/icons-material/Cancel";
import PreviewTwoToneIcon from "@mui/icons-material/PreviewTwoTone";
import { Eye } from 'lucide-react';

export default function ViewChecklistModal({
  formData,
  setShowModal,
}) {
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const checklistItems = formData.checklistItems || [];

  // backend day (single day only)
  // const backendDay = checklistItems[0]?.day || "";

  const grouped = {};

checklistItems.forEach(item => {
  if (!grouped[item.checklist_item]) {
    grouped[item.checklist_item] = {
      ...item,
      statuses: {}
    };
  }

  grouped[item.checklist_item].statuses[item.day] = item;
});

const rows = Object.values(grouped);


  const allDays = dayOrder;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded shadow overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2 text-indigo-700">
            <Eye className="w-5 h-5" />View Checklist
          </h2>
          <button
            className="text-red-600 text-xl hover:text-red-700 hover:font-bold"
            onClick={() => setShowModal(false)}
          >
            <CancelIcon />
          </button>
        </div>

        <div className="p-4 space-y-4 text-gray-700">
          {/* TABLE */}
          <div className="flex gap-2">
            <label className="font-semibold">TABLE NO:</label>
            <span className="font-semibold">{formData.table || "-"}</span>
          </div>

          {/* SHIFT */}
          <div className="flex gap-10 text-gray-700">
            <label className="font-semibold">SHIFT:</label>
            <span className="font-semibold">{formData.shift || "-"}</span>
          </div>

          {/* AREA */}
          <div className="flex gap-10 text-gray-700">
            <label className="font-semibold">AREA:</label>
            <span className="font-semibold">{formData.area || "-"}</span>
          </div>

          {/* CHECKLIST TABLE */}
          <div className="overflow-x-auto">
            <div className="flex justify-center mb-2 mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 text-stone-700 rounded">
                <div className="text-center">
                  <h5 className="font-semibold pt-2"><i className="fa-solid fa-map-pin"></i> Legend Code</h5>
                  <p className=" text-sm p-2 pb-4 ">
                  &nbsp; &nbsp; &nbsp; &nbsp; <b>Frequency: </b>&nbsp; &nbsp; I = Start of the Shift; M = Middle of the Shift; O = End of the Shift; <br /> <b>Activity: &nbsp; &nbsp; &nbsp; </b>A = Check; B = Clean; C = Visual Inspection; D = Turn On;
                  </p>
                </div>
              </div>
            <table className="w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                {/* Workweek */}
                <tr>
                  <th
                    colSpan={4 + allDays.length}
                    className="border px-1 py-1 text-center"
                  >
                    {formData.workweek}
                  </th>
                </tr>

                {/* Days */}
                <tr>
                  <td colSpan={4} />
                  {allDays.map((d) => (
                    <td key={d} className="text-center border px-1 py-1">
                      {d}
                    </td>
                  ))}
                </tr>

                {/* Performed By */}
<tr>
  <td colSpan={4} className="text-right"><label className="text-right font-semibold mr-2">Performed By: </label></td>
  {allDays.map(d => {
    const item = checklistItems.find(i => i.day === d);
    return (
      <td key={d} className="border px-1 py-1 text-center">
        {item?.performedBy || ""}
      </td>
    );
  })}
</tr>

{/* Date Performed */}
<tr>
  <td colSpan={4} className="text-right"><label className="text-right font-semibold mr-2">Date Performed: </label></td>
  {allDays.map(d => {
    const item = checklistItems.find(i => i.day === d);
    return (
      <td key={d} className="border px-1 py-1 text-center">
        {item?.datePerformed || ""}
      </td>
    );
  })}
</tr>


                {/* Column headers */}
                <tr>
                  <th className="border px-1 py-1">Checklist Item</th>
                  <th className="border px-1 py-1">Requirement</th>
                  <th className="border px-1 py-1">Activity</th>
                  <th className="border px-1 py-1">Frequency</th>
                  {allDays.map((d) => (
                    <th key={d} className="border px-1 py-1 text-center">
                      Status
                    </th>
                  ))}
                </tr>
              </thead>

             <tbody>
  {rows.map((row, index) => (
    <tr key={index}>
      <td className="border px-1 py-1">{row.checklist_item}</td>
      <td className="border px-1 py-1 text-center">{row.requirement}</td>
      <td className="border px-1 py-1 text-center">{row.activity}</td>
      <td className="border px-1 py-1 text-center">{row.frequency}</td>

      {allDays.map((d) => {
        const cell = row.statuses[d];
        return (
          <td key={d} className="border px-1 py-1 text-center">
            {cell
              ? cell.checklistStatus === 1
                ? "✔"
                : "N/A"
              : ""}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Footer */}

          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-white"
              onClick={() => setShowModal(false)}
            >
              <CancelIcon /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
