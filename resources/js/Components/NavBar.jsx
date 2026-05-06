import { Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";

export default function NavBar() {
    const { emp_data } = usePage().props;

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = route("logout");
        }, 500);
    };
            const getGreeting = () => {
                const hour = new Date().getHours();
                if (hour < 12) return "Good morning";
                if (hour < 18) return "Good afternoon";
                return "Good evening";
            };
    return (
        <nav className="bg-blue-600 shadow-md">
            <div className="px-4 mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-end h-[50px] ">
                    <div className="items-center hidden mr-5 space-x-1 font-semibold md:flex">
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="flex items-center m-1 space-x-2 cursor-pointer select-none text-white"
                            >
                                <i className="fa-regular fa-circle-user text-2xl"></i>
                                <span className="mt-[3px]">
                                    Hello, {getGreeting()} {emp_data?.emp_firstname}
                                </span>
                                <i className="fa-solid fa-caret-down"></i>
                            </div>

                            <ul
                                tabIndex={0}
                                className="p-2 shadow-md dropdown-content menu bg-base-100 rounded-box z-1 w-52"
                            >
                                <li>
                                    <a href={route("profile.index")}>
                                        <i className="fa-regular fa-address-card"></i>
                                        <span className="mt-[3px]">
                                            Profile
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <button onClick={logout}>
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                        <span className="mt-[3px]">
                                            Log out
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
