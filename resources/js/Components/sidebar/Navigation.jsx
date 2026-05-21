import { usePage } from "@inertiajs/react";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { LayoutDashboard, Award, Webhook } from "lucide-react";
import Dropdown from "./DropDown";

export default function NavLinks({ isSidebarOpen }) {
    const { emp_data } = usePage().props;

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("dashboard")}
                label="Dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />

            <Dropdown
                icon={<Award className="w-5 h-5"/>}
                label="Qualification"
                isSidebarOpen={isSidebarOpen}
                links={[
                    {
                        // href: route("package.history.index"),
                        label: "Machine",
                    },
                    {
                        // href: route("partnames.index"),
                        label: "Partname",
                    },
                    {
                        // href: route("ovenlist.index"),
                        label: "Material",
                    },
                ]}
            />
             <SidebarLink
                href={route("capability.matrix.index")}
                label="Capability Matrix"
                icon={<Webhook className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />

        </nav>
    );
}
