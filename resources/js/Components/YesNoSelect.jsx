import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function YesNoSelect({ value, onChange, label }) {
    const [open, setOpen] = useState(false);

    const options = [
        { value: "Y", label: "Yes (Y)" },
        { value: "N", label: "No (N)" },
    ];

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium">
                {label}
            </label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                    >
                        {value
                            ? options.find(
                                  (o) => o.value === value
                              )?.label
                            : "Select Y / N"}

                        <ChevronsUpDown className="w-4 h-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search Y / N..." />
                        <CommandEmpty>No result</CommandEmpty>

                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.value}
                                    onSelect={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${
                                            value === opt.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}