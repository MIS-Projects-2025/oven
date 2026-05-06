import { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "antd";

export default function PositiveChecklist({ setupId, onBack, onClose }) {
  const [setupData, setSetupData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [positiveChecklistItems, setPositiveChecklistItems] = useState([]);

  // Fetch setup data from backend
  useEffect(() => {
    async function fetchSetupDetails() {
      if (!setupId) return;

      try {
        const response = await axios.get(`/setup-checklist/${setupId}`);
        const data = response.data;
        setSetupData(data);
        setAnswers(JSON.parse(data.answers || "[]"));
      } catch (error) {
        console.error("Failed to fetch setup details:", error);
      }
    }

    fetchSetupDetails();
  }, [setupId]);

  // Fetch all positive checklist items (replace with your API if needed)
  useEffect(() => {
    async function fetchChecklistItems() {
      try {
        const response = await axios.get("/positive-checklist-items");
        setPositiveChecklistItems(response.data || []);
      } catch (error) {
        console.error("Failed to fetch checklist items:", error);
      }
    }
    fetchChecklistItems();
  }, []);

  if (!setupData) return <div>Loading setup details...</div>;

  const {
    machine_num,
    ww,
    date,
    shift_time,
    package_type,
    lot_id,
    process_type,
    customer_name,
    badge,
    machine_type,
    machine_model,
  } = setupData;

  // Filter checklist items based on machine type & model
  const filteredPositiveItems = positiveChecklistItems.filter(
    (item) =>
      item.machine_type === machine_type &&
      item.machine_model === machine_model
  );

  // Merge existing answers
  const itemsWithResults = filteredPositiveItems.map((item) => {
    const existingAnswer = answers.find(
      (a) => a.item_check === item.item_check
    );
    return {
      ...item,
      result: existingAnswer?.result || "",
    };
  });

  // Handle answer change
  const handleAnswerChange = (itemCheck, value) => {
    setAnswers((prev) => {
      const exists = prev.find((a) => a.item_check === itemCheck);
      if (exists) {
        return prev.map((a) =>
          a.item_check === itemCheck ? { ...a, result: value } : a
        );
      } else {
        return [...prev, { item_check: itemCheck, result: value }];
      }
    });
  };

  // Submit updated answers to backend
  const handleSubmit = async () => {
    try {
      await axios.post(`/positive-checklist/${setupId}`, {
        answers: JSON.stringify(answers),
      });
      alert("Checklist saved successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to save checklist:", error);
      alert("Failed to save checklist.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="w-[1200px] bg-white h-full p-6 overflow-y-auto">
        <h1 className="text-lg font-bold text-blue-600 mb-4">
          Positive Checklist
        </h1>

        {/* ===== Header Info ===== */}
        <table className="w-full border border-gray-300 table-auto mb-6">
          <tbody>
            <tr>
              <th className="border px-2 py-1 text-left">Machine No.</th>
              <td className="border px-2 py-1">{machine_num}</td>
              <th className="border px-2 py-1 text-left">Workweek</th>
              <td className="border px-2 py-1">{ww}</td>
            </tr>
            <tr>
              <th className="border px-2 py-1 text-left">Date</th>
              <td className="border px-2 py-1">{date}</td>
              <th className="border px-2 py-1 text-left">Shift / Time</th>
              <td className="border px-2 py-1">{shift_time}</td>
            </tr>
            <tr>
              <th className="border px-2 py-1 text-left">Package Type</th>
              <td className="border px-2 py-1">{package_type}</td>
              <th className="border px-2 py-1 text-left">Lot ID</th>
              <td className="border px-2 py-1">{lot_id}</td>
            </tr>
            <tr>
              <th className="border px-2 py-1 text-left">Process Type</th>
              <td className="border px-2 py-1">{process_type}</td>
              <th className="border px-2 py-1 text-left">Customer</th>
              <td className="border px-2 py-1">{customer_name}</td>
            </tr>
            <tr>
              <th className="border px-2 py-1 text-left">Badge</th>
              <td className="border px-2 py-1">{badge}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>

        {/* ===== Checklist Table ===== */}
        <table className="w-full border border-gray-300 table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Item to Check</th>
              <th className="border px-2 py-1">Frequency</th>
              <th className="border px-2 py-1">Responsible</th>
              <th className="border px-2 py-1">Result</th>
            </tr>
          </thead>

          <tbody>
            {itemsWithResults.length > 0 ? (
              itemsWithResults.map((item) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1">{item.item_check}</td>
                  <td className="border px-2 py-1">{item.frequency}</td>
                  <td className="border px-2 py-1">{item.responsible}</td>
                  <td className="border px-2 py-1 text-center">
                    <select
                      className="border-none w-24 text-center"
                      value={item.result || ""}
                      onChange={(e) =>
                        handleAnswerChange(item.item_check, e.target.value)
                      }
                    >
                      <option value="">—</option>
                      <option value="✔">✔</option>
                      <option value="N/A">N/A</option>
                      <option value="✖">✖</option>
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
                  No positive checklist available for the selected Machine Type and Machine Model.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ===== Footer Buttons ===== */}
        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onBack}
          >
            Back
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
