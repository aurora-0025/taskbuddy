import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerPropType {placeholder?: string; date: Date; setDate: Dispatch<SetStateAction<Date>> }

export default function DatePicker({placeholder, date, setDate}: DatePickerPropType) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(!date && "text-muted-foreground")}
                >
                    <CalendarIcon />
                    {date ? (
                        format(date, "dd/MM/yyyy")
                    ) : (
                        <span>{placeholder ?? "Pick a date"}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate as (date: Date | undefined) => void} 
                    autoFocus
                    disabled={(date: Date) => date < new Date()}
                />
            </PopoverContent>
        </Popover>
    );
}
