import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { Search, ListFilter, FileText, ListRestart } from "lucide-react";

export default function DataTable({
    columns = [],
    data = [],
    meta = {},
    filters = {},
    routeName = "",
    rowKey = "id",

    selectable = false,
    onSelectionChange = () => {},

    filterConfigs = [],
    actions = [],

    showExport = false,
}) {
    const [selected, setSelected] = useState([]);
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(filters.perPage || 10);
    const [dateFrom, setDateFrom] = useState(
    filters.start || ""
);

const [dateTo, setDateTo] = useState(
    filters.end || ""
);

const handleExport = () => {
    const params = new URLSearchParams({
        ...filters,
        search: searchInput,
        ...filterValues,
        export: 1,
    }).toString();

    window.open(
        route('capability.matrix.export') + '?' + params,
        '_blank'
    );
};

const handleDateFilter = () => {

    router.get(
        routeName,
        {
            ...filters,

            ...filterValues,

            search: searchInput,

            start: dateFrom,

            end: dateTo,
        },
        {
            preserveState: true,
            replace: true,
        }
    );
};

    const [filterValues, setFilterValues] = useState(() => {
        const initial = {};

        filterConfigs.forEach((f) => {
            initial[f.key] = filters[f.key] || "";
        });

        return initial;
    });

    const themeColor =
        localStorage.getItem("theme") === "dark"
            ? "hover:bg-sky-600/20"
            : "hover:bg-sky-50";

    const handleFilterChange = (key, value) => {
        const updated = {
            ...filterValues,
            [key]: value,
        };

        setFilterValues(updated);

        router.get(
            routeName,
            {
                ...filters,
                ...updated,
                search: searchInput,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            routeName,
            {
                ...filters,
                search: searchInput,
                ...filterValues,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSort = (key) => {
        const isSameKey = filters.sortBy === key;

        const direction =
            isSameKey && filters.sortDirection === "asc"
                ? "desc"
                : "asc";

        router.get(
            routeName,
            {
                ...filters,
                search: searchInput,
                ...filterValues,
                sortBy: key,
                sortDirection: direction,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;

        const newSelection = checked ? [...data] : [];

        setSelected(newSelection);

        onSelectionChange(newSelection);
    };

    const handleSelectRow = (row) => {
        const exists = selected.find((r) => r[rowKey] === row[rowKey]);

        const updated = exists
            ? selected.filter((r) => r[rowKey] !== row[rowKey])
            : [...selected, row];

        setSelected(updated);

        onSelectionChange(updated);
    };

    const getFilteredOptions = (filter) => {
        if (!filter.dependsOn) {
            return filter.options;
        }

        const parentValue = filterValues[filter.dependsOn];

        if (!parentValue) {
            return filter.options;
        }

        return filter.options.filter(
            (opt) => opt.parentValue === parentValue
        );
    };


const handleReset = () => {
    router.get(route(routeName), {}, {
        preserveState: false,
        replace: true,
        onSuccess: () => {
            setFilterValues(
                Object.fromEntries(
                    filterConfigs.map(f => [f.key, ""])
                )
            );
            setSearchInput("");
            setPerPage(10);
        }
    });
};



    return (
        <div className="w-full p-4 border rounded-xl border-sky-600/50">

            {/* FILTERS */}
<form
    onSubmit={handleSearch}
    
>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 mb-4">
    {/* DYNAMIC FILTERS */}
    {filterConfigs.map((filter) => (
        <div
            key={filter.key}
            className="w-full"
        >
            <select
                className="select select-sm w-full border-sky-600/50"
                value={filterValues[filter.key]}
                onChange={(e) =>
                    handleFilterChange(
                        filter.key,
                        e.target.value
                    )
                }
            >
                <option value="">
                    All {filter.label}
                </option>

                {getFilteredOptions(filter).map(
                    (opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                        >
                            {opt.label}
                        </option>
                    )
                )}
            </select>
        </div>
    ))}
    </div>

    {/* <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end mb-4">
        <div className="flex gap-2 mt-4">
            <button
    onClick={handleReset}
    className="flex items-center bg-gray-600 text-white hover:bg-gray-700 font-bold py-2 px-4 border border-gray-700 rounded"
>
    <ListRestart className="w-5 h-5 mr-2" />
    Reset Filters
</button>
        </div>
    </div> */}

    <div className="flex flex-col gap-3 mt-2 lg:flex-row lg:items-center lg:justify-start mb-4">
        {/* DATE FROM */}
        <div>
            <label className="m-2 text-md font-semibold text-gray-600">From:</label>
        <input
            type="date"
            className="w-full text-sm text-stone-700 bordered-gray-300 rounded-md p-2"
            value={dateFrom}
            onChange={(e) =>
                setDateFrom(
                    e.target.value
                )
            }
        />
        </div>

        {/* DATE TO */}
        <div>
            <label className="m-2 text-md font-semibold text-gray-600">To:</label>
        <input
            type="date"
            className="w-full text-sm text-stone-700 bordered-gray-300 rounded-md p-2"
            value={dateTo}
            onChange={(e) =>
                setDateTo(
                    e.target.value
                )
            }
        />
        </div>

        {/* FILTER BUTTON */}
        <div className="flex gap-2 mt-4">
            <button
            type="button"
            onClick={handleDateFilter}
            className="flex items-center bg-stone-200 text-stone-700 hover:bg-stone-700 hover:text-white font-bold py-2 px-4 border border-stone-700 rounded"
        >
           <ListFilter className="w-5 h-5 mr-2"/> Filter Date
        </button>
        </div>

        {/* EXPORT */}
        <div className="flex gap-2 mt-4">
        {showExport && (
         
            <button
                type="button"
                onClick={handleExport}
                className="flex items-center bg-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white font-bold py-2 px-4 border border-blue-700 rounded"
            >
               <FileText className="w-5 h-5 mr-2"/> Export CSV
            </button>
        )}
        </div>

        
    </div>

{/* ACTION ROW */}
<div className="flex flex-col gap-3 mt-2 lg:flex-row lg:items-center lg:justify-between border-t-2 pt-4">

    {/* LEFT */}
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

        {/* PER PAGE */}
        <select
            className="select select-sm border-sky-600/50"
            value={perPage}
            onChange={(e) => {

                const value = Number(
                    e.target.value
                );

                setPerPage(value);

                router.get(
                    routeName,
                    {
                        ...filters,

                        perPage: value,

                        ...filterValues,

                        start: dateFrom,

                        end: dateTo,
                    },
                    {
                        preserveState: true,
                    }
                );
            }}
        >
            {[10, 25, 50, 100].map(
                (n) => (
                    <option
                        key={n}
                        value={n}
                    >
                        Show {n}
                    </option>
                )
            )}
        </select>

        
    </div>

    {/* RIGHT */}
    <div className="flex gap-2">

        <input
            type="text"
            placeholder="Search..."
            className="input input-sm input-bordered w-full md:w-[250px]"
            value={searchInput}
            onChange={(e) =>
                setSearchInput(
                    e.target.value
                )
            }
        />

        <button
            type="submit"
            className="btn btn-sm bg-sky-600 text-white"
        >
            <Search className="w-4 h-4" />
        </button>

    </div>

</div>

</form>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            {selectable && (
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selected.length === data.length &&
                                            data.length > 0
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${
                                        col.sortable
                                            ? "cursor-pointer"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        col.sortable &&
                                        handleSort(col.key)
                                    }
                                >
                                    {col.label}

                                    {filters.sortBy === col.key && (
                                        <span className="ml-1 text-xs">
                                            {filters.sortDirection === "asc"
                                                ? "▲"
                                                : "▼"}
                                        </span>
                                    )}
                                </th>
                            ))}

                            {actions.length > 0 && (
                                <th className="text-center">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        actions.length +
                                        (selectable ? 1 : 0)
                                    }
                                    className="text-center"
                                >
                                    No results found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const isSelected = selected.some(
                                    (r) => r[rowKey] === row[rowKey]
                                );

                                return (
                                    <tr
                                        key={`${row[rowKey]}-${index}`}
                                        className={`${themeColor}`}
                                    >
                                        {selectable && (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        handleSelectRow(row)
                                                    }
                                                />
                                            </td>
                                        )}

                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="whitespace-nowrap"
                                            >
                                                {col.render
                                                    ? col.render(row)
                                                    : row[col.key] ?? "-"}
                                            </td>
                                        ))}

                                        {actions.length > 0 && (
                                            <td>
                                                <div className="flex gap-2 justify-center">
                                                    {actions.map(
                                                        (
                                                            action,
                                                            idx
                                                        ) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                className={`btn btn-xs ${action.className}`}
                                                                onClick={() =>
                                                                    action.onClick(
                                                                        row
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    action.label
                                                                }
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {meta?.links?.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-sky-600">
                        Showing {meta.from} to {meta.to}
                        of {meta.total}
                    </div>

                    <div className="join">
                        {meta.links.map((link, idx) => (
                            <button
                                key={idx}
                                className={`join-item btn btn-sm ${
                                    link.active
                                        ? "bg-sky-600 text-white"
                                        : ""
                                }`}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.visit(link.url)
                                }
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}