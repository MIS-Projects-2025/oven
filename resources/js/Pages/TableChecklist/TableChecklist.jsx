import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import DataTable from "@/Components/DataTable";
import { useState, useEffect } from "react";
import React from 'react';
import CreateChecklistModal from "@/Components/CreateChecklistModal";
import ViewChecklistModal from "@/Components/ViewChecklistModal";

import CancelIcon from "@mui/icons-material/Cancel";
import SaveTwoToneIcon from "@mui/icons-material/SaveTwoTone";
import PreviewTwoToneIcon from "@mui/icons-material/PreviewTwoTone";
import NewLabelTwoToneIcon from "@mui/icons-material/NewLabelTwoTone";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import TableRestaurantTwoToneIcon from "@mui/icons-material/TableRestaurantTwoTone";
import { Snackbar, Alert } from '@mui/material';

import { Eye } from 'lucide-react';

export default function TableChecklist({
  tableData,
  tableFilters,
  emp_data,
  checklistItems = [],
  tables = [],
  areas = [],
  categories = [],
  shifts = [],
  ww = [],
})
 {


  /* =========================
      DATE / SHIFT / WW
  ========================== */
 const getCurrentWorkweek = () => {
  const start = new Date("2024-11-03"); // starting reference
  const today = new Date();

  // total weeks passed since start
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(diffDays / 7);

  // each cycle is 52 weeks
  const cycle = Math.floor(totalWeeks / 52); // 0,1,2,...
  const weekInCycle = (totalWeeks % 52) + 1; // 1..52

  // base number per cycle (601, 701, 801,...)
  const base = 501 + cycle * 100;

  return `WW${base + (weekInCycle - 1)}`; // e.g., 601..652, 701..752, 801..852
};


  const today = new Date();
  const todayDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate()
  ).padStart(2, "0")}/${today.getFullYear()}`;

  const currentShift = today.getHours() >= 7 && today.getHours() <= 18 ? "A" : "C";
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = DAYS[today.getDay()];

  // Map full day names to short day labels
  const dayShortMap = {
    Sunday: "Sunday",
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
  };

  /* =========================
      STATES
  ========================== */
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create"); // create | view
  const [formData, setFormData] = useState({
    table: "",
    area: "",
    shift: currentShift,
    workweek: getCurrentWorkweek(),
    performedBy: emp_data?.emp_id || "",
    datePerformed: todayDate,
    checklistStatus: {},
    checklistItems: checklistItems,
  });

  /* =========================
      OPEN MODAL
  ========================== */
  const openModal = async (mode = "create", row = null) => {
    setMode(mode);

    if (mode === "view" && row) {
      try {
        const res = await axios.get(route("table.checklist.view"), {
          params: {
            table_name: row.table_name,
            area: row.area,
            shift: row.shift,
            ww: row.ww,
          },
        });

        const data = res.data.checklist || [];

        // Map checklistStatus per item with correct short day
        const statusMap = {};
       const checklistForView = data.map((item, index) => {
  const shortDay = dayShortMap[item.day] || item.day;

  return {
    id: index,
    checklist_item: item.checklist_item,   // ⚠️ ayusin din ang field name
    requirement: item.requirement,
    activity: item.activity,
    frequency: item.frequency,
    day: shortDay,
    performedBy: item.performed_by,
    datePerformed: item.date_performed,
    checklistStatus: Number(item.checklistStatus), // ⭐⭐⭐
  };
});


        setFormData({
          table: row.table_name,
          area: row.area,
          shift: row.shift,
          workweek: row.ww,
          performedBy: checklistForView[0]?.performedBy || emp_data?.emp_id,
          datePerformed: checklistForView[0]?.datePerformed || todayDate,
          checklistStatus: statusMap,
          checklistItems: checklistForView,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch checklist");
      }
    } else {
      // CREATE mode: initialize empty checklistStatus
      const initStatus = {};
      checklistItems.forEach((item) => {
        initStatus[item.id] = {};
        DAYS.forEach((d) => (initStatus[item.id][d] = ""));
      });

      setFormData({
        table: "",
        area: "",
        shift: currentShift,
        workweek: getCurrentWorkweek(),
        performedBy: emp_data?.emp_id || "",
        datePerformed: todayDate,
        checklistStatus: initStatus,
        checklistItems: checklistItems,
      });
    }

    setShowModal(true);
  };



  /* =========================
      SAVE CHECKLIST
  ========================== */
//   const saveChecklist = () => {
//     if (!formData.table || !formData.area) {
//       alert("Please select table and area.");
//       return;
//     }

//     const payload = [];
//     checklistItems.forEach((item) => {
//       const days = formData.checklistStatus[item.id] || {};
//       Object.entries(days).forEach(([day, status]) => {
//         if (status !== "") {
//           payload.push({
//             day,
//             performed_by: formData.performedBy,
//             date_performed: formData.datePerformed,
//             checklist_item: item.checklist_item,
//             requirement: item.requirement,
//             activity: item.activity,
//             frequency: item.frequency,
//             checklistStatus: Number(status),
//           });
//         }
//       });
//     });

//   router.post(route("table.checklist.store"), {
//   table_name: formData.table,
//   area: formData.area,
//   shift: formData.shift,
//   ww: formData.workweek,
//   checklist_item: payload,
// }, {
//   onSuccess: () => {
//     // Just close the modal; the flash alert will handle messages
//     setShowModal(false);
//   },
//   onError: () => {
//     // optional: log errors if needed
//     console.error("Something went wrong saving the checklist.");
//   },
// });


//   };

const saveChecklist = (selectedCategory) => {
  if (!selectedCategory) {
    alert("Please select a category before saving.");
    return;
  }

  const payload = [];

  formData.checklistItems
    .filter(item => item.category === selectedCategory)
    .forEach(item => {
      const days = formData.checklistStatus[item.id] || {};
      Object.entries(days).forEach(([day, status]) => {
        if (status !== "") {
          payload.push({
            day,
            performed_by: formData.performedBy,
            date_performed: formData.datePerformed,
            checklist_item: item.checklist_item,
            requirement: item.requirement,
            activity: item.activity,
            frequency: item.frequency,
            checklistStatus: Number(status),
            category: item.category,
          });
        }
      });
    });

  router.post(route("table.checklist.store"), {
    table_name: formData.table,
    area: formData.area,
    shift: formData.shift,
    ww: formData.workweek,
    checklist_item: payload,
  }, {
    onSuccess: () => setShowModal(false),
    onError: () => console.error("Failed to save checklist"),
  });
};



  /* =========================
      DATATABLE
  ========================== */

  const Colors = [
  { text: "#1E3A8A", bg: "#DBEAFE", border: "#1E3A8A" }, // blue
  { text: "#065F46", bg: "#D1FAE5", border: "#065F46" }, // emerald
  { text: "#B91C1C", bg: "#FEE2E2", border: "#B91C1C" }, // red
  { text: "#78350F", bg: "#FEF3C7", border: "#78350F" }, // amber
  { text: "#6B21A8", bg: "#EDE9FE", border: "#6B21A8" }, // purple
  { text: "#065F46", bg: "#D1FAE5", border: "#065F46" }, // another emerald
];

const assignedColors = {}; // WW → color mapping

function getWWColor(ww) {
  if (!ww) return { text: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" }; // default gray

  // If this WW already has a color, return it
  if (assignedColors[ww]) return assignedColors[ww];

  // Find colors not yet assigned
  const usedColors = Object.values(assignedColors).map(c => Colors.indexOf(c));
  const availableColors = Colors.filter((_, idx) => !usedColors.includes(idx));

  // Pick the first available color
  const color = availableColors.length > 0 ? availableColors[0] : Colors[assignedColors.length % Colors.length];

  // Save for future
  assignedColors[ww] = color;

  return color;
}

function getShiftColor(shift) {
  if (!shift) return { text: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" }; // default gray

  // If this shift already has a color, return it
  if (assignedColors[shift]) return assignedColors[shift];

  // Find colors not yet assigned
  const usedColors = Object.values(assignedColors).map(c => Colors.indexOf(c));
  const availableColors = Colors.filter((_, idx) => !usedColors.includes(idx));

  // Pick the first available color
  const color = availableColors.length > 0 ? availableColors[0] : Colors[assignedColors.length % Colors.length];

  // Save for future
  assignedColors[shift] = color;

  return color;
}




  const dataWithAction = tableData.data.map((r) => ({
    ...r,
    // 🔸 Consigned badge
     shift: (
  <span
    className={`px-2 py-1 text-xs font-semibold border rounded-md`}
    style={{
      color: getShiftColor(r.shift).text,
      backgroundColor: getShiftColor(r.shift).bg,
      borderColor: getShiftColor(r.shift).border,
    }}
  >
    {r.shift || "-"}
  </span>
),
 ww: (
  <span
    className={`px-2 py-1 text-xs font-semibold border rounded-md`}
    style={{
      color: getWWColor(r.ww).text,
      backgroundColor: getWWColor(r.ww).bg,
      borderColor: getWWColor(r.ww).border,
    }}
  >
    {r.ww || "-"}
  </span>
),

    actions: (
      <button
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => openModal("view", r)}
      >
        <Eye className="w-5 h-5 mr-1" /> View
      </button>
    ),
  }));

  const { flash } = usePage().props;
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState('success');

  useEffect(() => {
    if (flash.success) {
      setMessage(flash.success);
      setSeverity('success');
      setOpen(true);
    } else if (flash.error) {
      setMessage(flash.error);
      setSeverity('error');
      setOpen(true);
    }
  }, [flash]);

  /* =========================
      RENDER
  ========================== */
  return (

    <AuthenticatedLayout>

      <Snackbar
  open={open}
  autoHideDuration={5000}
  onClose={() => setOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    onClose={() => setOpen(false)}
    severity={severity}  // ✅ dynamic
    sx={{ width: '100%' }}
  >
    <span dangerouslySetInnerHTML={{ __html: message }} />
  </Alert>
</Snackbar>

      <Head title="Working Table Checklist" />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <TableRestaurantTwoToneIcon /> Working Table Checklist
        </div>
          {!["superadmin", "admin"].includes(emp_data.emp_system_role) &&(
            <button
              className="text-white bg-green-500 border-2 border-emerald-600 btn hover:bg-green-700 hover:text-white flex items-center gap-2"
              onClick={() => openModal("create")}
            >
              <AddCircleTwoToneIcon /> Table Checklist
            </button>
          )}
      </div>

      <DataTable
        columns={[
          { key: "table_name", label: "Table No." },
          { key: "area", label: "Area" },
          { key: "shift", label: "Shift" },
          { key: "ww", label: "Work Week" },
          { key: "actions", label: "Actions" },
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
        routeName={route("table.checklist.index")}
        filters={tableFilters}
        rowKey="id"
      />

 {showModal && mode === "create" && (
  <CreateChecklistModal
    formData={formData}
    setFormData={setFormData}
    DAYS={DAYS}
    tables={tables}
    areas={areas}
    setShowModal={setShowModal}
    saveChecklist={saveChecklist}
    categories={categories} // ✅ pass distinct categories here
  />
)}


{showModal && mode === "view" && (
  <ViewChecklistModal
    formData={formData}
    setFormData={setFormData}
    DAYS={DAYS}
     tables={tables}
    areas={areas}
    emp_data={emp_data}
    setShowModal={setShowModal}
  />
)}



    </AuthenticatedLayout>
  );
}
