import React from "react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { X } from "lucide-react";
import { RiCheckboxMultipleFill } from "react-icons/ri";

type FloatingBarProps = {
    count: number;
    onDelete: () => void;
    onUpdateStatus: (status: string) => void;
    onClearAll: () => void;
};

export function FloatingBar({
    count,
    onDelete,
    onUpdateStatus,
    onClearAll,
}: FloatingBarProps) {
    return (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between gap-3 rounded-xl bg-[#1A1C20] p-3 text-white shadow-lg w-[400px]">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border-[0.2px] px-4 py-2">
                    <p className="text-sm">{count} selected</p>
                    <X
                        className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={onClearAll}
                    />
                </div>
                <RiCheckboxMultipleFill
                    className="w-4 h-4"
/>
            </div>

            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="rounded-full bg-[#8d8a8a22] hover:bg-[#8D8A8A]"
                            variant="outline"
                        >
                            Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" sideOffset={4} className="bg-[#1a1c20]">
                        <DropdownMenuItem className="bg-[#1a1c20] hover:bg-red text-white"
                            onClick={() => onUpdateStatus("todo")}
                        >
                            To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem className="bg-[#1a1c20] hover:bg-red text-white"
                            onClick={() => onUpdateStatus("in-progress")}
                        >
                            In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem className="bg-[#1a1c20] hover:bg-red text-white"
                            onClick={() => onUpdateStatus("completed")}
                        >
                            Completed
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    className="rounded-full border border-[#E13838] bg-[#FF353522] text-[#E13838] hover:bg-[#ff353592] hover:text-white"
                    variant="destructive"
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
