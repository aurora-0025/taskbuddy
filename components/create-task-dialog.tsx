import React, { useMemo, useState } from "react";
import {
    BtnBold,
    BtnBulletList,
    BtnItalic,
    BtnNumberedList,
    BtnStrikeThrough,
    Editor,
    EditorProvider,
    Toolbar,
} from "react-simple-wysiwyg";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { DateTimePicker } from "./ui/datetime-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTask } from "@/firebase/tasks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export function CreateTaskDialog() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState("work");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("");
    const [description, setDescription] = useState("");
    const minDate = useMemo(() => addDays(new Date(), 1), []);
    const [user] = useAuthState(auth);

    const handleDescriptionChange = (e: { target: { value: string } }) => {
        const plainText = e.target.value.replace(/<[^>]*>/g, ""); // Strip HTML tags
        if (plainText.length <= 300) {
            setDescription(e.target.value);
        }
    };

    const addTaskMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("User not logged in");

            const taskData = {
                title,
                description,
                category,
                status,
                dueDate: date?.toISOString() || "",
                createdAt: new Date().toISOString(),
                activity: [
                    {
                        type: "created",
                        message: "Task created",
                        timestamp: new Date().toISOString(),
                        userId: user.uid,
                    },
                ],
            };

            await addTask(user.uid, taskData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
            setOpen(false);
        },
    });

    const handleSubmit = () => {
        if (!title || !status || !date) return;
        addTaskMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full" variant="default">Add Task</Button>
            </DialogTrigger>
            <DialogContent className="w-full p-0 sm:max-w-[500px]">
                <DialogHeader className="rounded-t-md border-b-2 bg-gray-50 p-4">
                    <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 p-1 sm:p-4">
                    <div className="space-y-2">
                        <Input
                            id="title"
                            placeholder="Task title"
                            className="h-11"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="relative space-y-2">
                        <EditorProvider>
                            <div className="rounded-lg border border-gray-200">
                                <Editor
                                    placeholder="Description"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                ></Editor>
                                <Toolbar
                                    style={{
                                        backgroundColor: "transparent",
                                        border: 0,
                                    }}
                                >
                                    <BtnBold />
                                    <BtnItalic />
                                    <BtnStrikeThrough />
                                    <BtnBulletList />
                                    <BtnNumberedList />
                                </Toolbar>
                            </div>
                        </EditorProvider>
                        <div
                            className={cn(
                                "absolute right-2 bottom-3 text-gray-300",
                                description.replace(/<[^>]*>/g, "").length ===
                                    300 && "text-red-300",
                            )}
                        >
                            {description.replace(/<[^>]*>/g, "").length}/300
                        </div>
                    </div>

                    <div className="grid grid-cols-1 justify-items-start gap-4 p-1 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="text-gray-500">
                                Task Category*
                            </Label>
                            <ToggleGroup
                                className="flex gap-1"
                                type="single"
                                value={category}
                                onValueChange={setCategory}
                            >
                                <ToggleGroupItem
                                    style={{
                                        borderRadius: "calc(infinity * 1px)",
                                    }}
                                    value="work"
                                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-[70px] border text-xs"
                                >
                                    Work
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    style={{
                                        borderRadius: "calc(infinity * 1px)",
                                    }}
                                    value="personal"
                                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-[70px] rounded-full border text-xs"
                                >
                                    Personal
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-500">Due on*</Label>
                            <DateTimePicker
                                value={date}
                                onChange={setDate}
                                min={minDate}
                                hideTime
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-500">
                                Task Status*
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-500">Attachments</Label>
                        <div className="rounded-lg border-2 border-dashed p-4 text-center">
                            <input
                                type="file"
                                multiple
                                // onChange={handleFileUpload}
                                className=""
                            ></input>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <div className="bg-secondary flex w-full items-center justify-end gap-2 p-2">
                        <Button
                            variant={"outline"}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={addTaskMutation.isPending}
                            variant={"default"}
                        >
                            {addTaskMutation.isPending
                                ? "Creating..."
                                : "Create"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
