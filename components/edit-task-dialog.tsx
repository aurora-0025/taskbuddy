import React, { useEffect, useMemo, useState } from "react";
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
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { addDays, format } from "date-fns";
import { DateTimePicker } from "./ui/datetime-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityEntry, Task, updateTask } from "@/firebase/tasks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface EditTaskDialogProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

export function EditTaskDialog({ task, open, onClose }: EditTaskDialogProps) {
    const queryClient = useQueryClient();
    const [user] = useAuthState(auth);

    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [category, setCategory] = useState(task.category);
    const [status, setStatus] = useState(task.status);
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task.dueDate ? new Date(task.dueDate) : undefined,
    );

    const minDate = useMemo(() => addDays(new Date(), 1), []);

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
        setCategory(task.category);
        setStatus(task.status);
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }, [task]);

    const handleDescriptionChange = (e: { target: { value: string } }) => {
        const plainText = e.target.value.replace(/<[^>]*>/g, "");
        if (plainText.length <= 300) {
            setDescription(e.target.value);
        }
    };

    const updateTaskMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("User not logged in");

            const newActivity: ActivityEntry[] = [];
            const oldTask = task;

            if (oldTask.title !== title) {
                newActivity.push({
                    type: "title-changed",
                    message: `Title changed from "${oldTask.title}" to "${title}"`,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }
            if (oldTask.description !== description) {
                newActivity.push({
                    type: "description-changed",
                    message: `Description changed`,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }
            if (oldTask.category !== category) {
                newActivity.push({
                    type: "category-changed",
                    message: `Category changed from "${oldTask.category}" to "${category}"`,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }
            if (oldTask.status !== status) {
                newActivity.push({
                    type: "status-changed",
                    message: `Status changed from "${oldTask.status}" to "${status}"`,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }
            const oldDue = oldTask.dueDate ? new Date(oldTask.dueDate) : null;
            if (oldDue?.toISOString() !== dueDate?.toISOString()) {
                newActivity.push({
                    type: "dueDate-changed",
                    message: `Due date changed from "${format(oldDue || 0, "PPP")}" to "${format(dueDate || 0, "PPP")}"`,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }

            const updatedData = {
                title,
                description,
                category,
                status,
                dueDate: dueDate?.toISOString() || "",
            };

            await updateTask(user.uid, task.id!, updatedData, newActivity);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
            onClose();
        },
    });

    const handleSave = () => {
        if (!title || !status || !dueDate) return;
        updateTaskMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full p-0 sm:max-w-[500px]">
                <DialogHeader className="border-b-2 bg-secondary p-7 rounded-t-md">
                    <DialogTitle className="hidden">Edit/View</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details">
                    <TabsList className="mt-2 w-full justify-between gap-4 bg-transparent">
                        <TabsTrigger
                            className="w-full rounded-full border data-[state=active]:bg-black data-[state=active]:text-white"
                            value="details"
                        >
                            Details
                        </TabsTrigger>
                        <TabsTrigger
                            className="w-full rounded-full border data-[state=active]:bg-black data-[state=active]:text-white"
                            value="activity"
                        >
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Task title"
                                className="h-11"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="relative mt-4 space-y-2">
                            <EditorProvider>
                                <div className="rounded-lg border border-gray-200">
                                    <Editor
                                        placeholder="Description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                    />
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
                                    description.replace(/<[^>]*>/g, "")
                                        .length === 300 && "text-red-300",
                                )}
                            >
                                {description.replace(/<[^>]*>/g, "").length}/300
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 justify-items-start gap-4 p-1 sm:grid-cols-3">
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
                                        value="work"
                                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-[70px] border text-xs"
                                    >
                                        Work
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="personal"
                                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-[70px] border text-xs"
                                    >
                                        Personal
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-500">Due on*</Label>
                                <DateTimePicker
                                    value={dueDate}
                                    onChange={setDueDate}
                                    min={minDate}
                                    hideTime
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-500">
                                    Task Status*
                                </Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">
                                            To Do
                                        </SelectItem>
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
                    </TabsContent>

                    <TabsContent value="activity" className="p-4">
                        {task.activity && task.activity.length > 0 ? (
                            <ul className="space-y-2">
                                {task.activity.map((entry, idx) => (
                                    <li key={idx} className="pb-2 flex justify-between">
                                        <p className="text-sm">
                                            {entry.message}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {format(
                                                new Date(entry.timestamp),
                                                "PPpp",
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No activity yet.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <div className="bg-secondary flex w-full items-center justify-end gap-2 p-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateTaskMutation.isPending}
                            variant="default"
                        >
                            {updateTaskMutation.isPending
                                ? "Saving..."
                                : "Update"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
