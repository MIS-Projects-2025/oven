import Dropdown from "@/Components/sidebar/Dropdown";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { usePage } from "@inertiajs/react";

export default function NavLinks() {
    const { emp_data } = usePage().props;

    const role = emp_data?.emp_system_role?.trim();
    const empDept = emp_data?.emp_dept?.trim();
    const jobTitle = emp_data?.emp_jobtitle?.trim();

    const adminAccess = ["superadmin", "admin"].includes(role);

    const equipmentTech = ["Equipment Engineering"].includes(empDept);

    const productions = ["Production", "Production / Non - TNR"].includes(empDept);

    const canReview = ["Quality Assurance", "Process Engineering", "Quality Management System"].includes(empDept);

    const canAccess = [equipmentTech, productions].includes(empDept) && adminAccess;

    const hasMaintenanceAccess =
    adminAccess ||
     [
     "Production Supervisor",
     "Senior Production Supervisor",
     "Production Section Head",
     "Section Head - Production",
    ].includes(jobTitle);

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("dashboard")}
                label="Dashboard"
                icon={<i className="fa-solid fa-gauge-high"></i>}
            />

            {canAccess && (
                <div>
            <SidebarLink
                href={route("setup-new.checklist.index")}
                label="Control Log E-Forms"
                icon={<i className="fa-solid fa-check"></i>}
            />
            </div>
            )}


            {
                productions && (
                    <div>
                        <Dropdown
                label="Report and Logsheet"
                icon={<i className="fa-solid fa-laptop-file"></i>}
                links={[
                    {
                        href: route("capacity.index"),
                        label: "Magazine Inventory/ Bake Capacity",
                    },
                    {
                        href: route("cleaning.logsheet.index"),
                        label: "Cleaning Loghseet for Magazine",
                    },
                    {
                        href: route("table.checklist.index"),
                        label: "Working Table Checklist",
                    },
                ]}
            />
                    </div>
                )
            }

            {canReview && (
            <div>
            
            <SidebarLink
                href={route("setup.logsheet.qape.index")}
                label="TCM Logsheets"
                icon={<i className="fa-solid fa-clipboard"></i>}
            />

            <SidebarLink
                href={route("cleaning.logsheet.qape.index")}
                label="Loghseet for Magazine"
                icon={<i className="fa-solid fa-broom-ball"></i>}
            />
            </div>
            )}

            


 {adminAccess && (
                <div>
           <Dropdown
  label="Table Management"
  icon={
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icon-tabler-tool"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
    </svg>
  }
  links={[
    {
      // href: route("checklist_item.index"),
      href: route("checklist.item"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-list"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>
      ),
      label: "Table Checklist Item",
    },

      {
      href: route("table.list.index"),
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chair-director"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 21l12 -9" /><path d="M6 12l12 9" /><path d="M5 12h14" /><path d="M6 3v9" /><path d="M18 3v9" /><path d="M6 8h12" /><path d="M6 5h12" /></svg>),
      label: "Table List",
    },

    {
      href: route("location.list.index"),
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-map-pin"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 18l-6 -6l6 -6l6 6l-6 6z" /></svg>),
      label: "Location List",
    },
  ]}
/>
</div>
            )}
                         {hasMaintenanceAccess && (
    <div>
        <Dropdown
            label="Maintenance"
            icon={<i className="fa-solid fa-bars-progress"></i>}
            links={[
                {
                    href: route("check_item.index"),
                    label: "Setup Check Items",
                },
                {
                    href: route("positive.checklist.index"),
                    label: "Positive Check Items",
                }
            ]}
        />
    </div>
)}
            
            {adminAccess && (
            <div>
                    <SidebarLink
                        href={route("admin")}
                        label="Administrators"
                        icon={<i className="fa-solid fa-users-between-lines"></i>}
                    />
                </div>
            )}
        </nav>
    );
}
