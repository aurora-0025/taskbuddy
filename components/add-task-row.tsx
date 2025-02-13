import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { addTask } from "@/firebase/tasks";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { CornerDownLeft, PlusIcon } from "lucide-react";
import { addDays } from "date-fns";
import { DateTimePicker } from "@/components/ui/datetime-picker";

type InlineAddTaskProps = {
    onCancel: () => void;
};

export function InlineAddTask({ onCancel }: InlineAddTaskProps) {
    const queryClient = useQueryClient();
    const [user] = useAuthState(auth);

    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const statusOptions = ["ToDo", "In-Progress", "Completed"];
    const categoryOptions = ["Work", "Personal"];
    const [statusOpen, setStatusOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);

    const minDate = addDays(new Date(), 0);
    const addTaskMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("User not logged in");
            const taskData = {
                title,
                description: "",
                category,
                status,
                dueDate: date?.toISOString() || "",
                createdAt: new Date().toISOString(),
            };
            await addTask(user.uid, taskData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
            setTitle("");
            setStatus("");
            setCategory("");
            setDate(null);
            onCancel();
        },
    });

    const handleAddTask = () => {
        if (!title || !status || !date) return;
        addTaskMutation.mutate();
    };

    return (
        <div className="my-2 flex flex-col items-start gap-2 border-b py-3">
            <div className="grid w-full grid-cols-1 items-start justify-between p-2 sm:grid-cols-4">
                <input
                    placeholder="Task Title"
                    className="w-full border-none outline-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="w-fit">
                    <DateTimePicker
                        initDisplayValue="Add Date"
                        value={date || undefined}
                        onChange={(val) => setDate(val!)}
                        min={minDate}
                        hideTime
                    />
                </div>
                <div className="w-fit">
                    <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 rounded-full bg-transparent cursor-pointer"
                            >
                                {status.length == 0 ? (
                                    <PlusIcon />
                                ) : (
                                    status.toUpperCase()
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-2">
                            <div className="flex flex-col">
                                {statusOptions.map((option) => (
                                    <Button
                                        key={option}
                                        variant={"ghost"}
                                        className="w-full justify-start"
                                        onClick={() => {
                                            setStatus(option.toLowerCase());
                                            setStatusOpen(false);
                                        }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="w-fit">
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 rounded-full bg-transparent cursor-pointer"
                            >
                                {category.length == 0 ? (
                                    <PlusIcon />
                                ) : (
                                    category.toUpperCase()
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-2">
                            <div className="flex flex-col">
                                {categoryOptions.map((option) => (
                                    <Button
                                        key={option}
                                        variant={"ghost"}
                                        className="w-full justify-start"
                                        onClick={() => {
                                            setCategory(
                                                option.toLowerCase() as
                                                    | "work"
                                                    | "personal",
                                            );
                                            setCategoryOpen(false);
                                        }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="mt-1 flex gap-2 sm:mt-0">
                <Button
                    variant="default"
                    onClick={handleAddTask}
                    disabled={addTaskMutation.isPending}
                >
                    {addTaskMutation.isPending ? <>Adding...</> : <>Add <CornerDownLeft/></> }
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
