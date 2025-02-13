import React, { useState } from "react";
import { deleteTask, Task } from "@/firebase/tasks";
import { FaCheckCircle } from "react-icons/fa";
import { cn, relativeDateString } from "@/lib/utils";
import {
    GripVerticalIcon,
    MoreHorizontal,
    PencilLine,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { updateTaskStatus } from "@/firebase/tasks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { EditTaskDialog } from "./edit-task-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { TbTrashFilled } from "react-icons/tb";

export default function TaskRow({
    task,
    status,
    isChecked,
    onToggle,
    className,
}: React.ComponentProps<"li"> & {
    task: Task;
    status: string;
    isChecked: boolean;
    onToggle: (taskId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        setActivatorNodeRef,
    } = useSortable({
        id: task.id ?? "",
        data: { parentId: status },
    });

    const [editOpen, setEditOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(task.status);
    const [user] = useAuthState(auth);
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: async ({
            taskId,
            newStatus,
        }: {
            taskId: string;
            newStatus: string;
        }) => {
            if (!user) return;
            await updateTaskStatus(user.uid, taskId, newStatus);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            if (!user) return;
            await deleteTask(user.uid, taskId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
        },
    });

    const handleStatusChange = async (updatedStatus: string) => {
        setNewStatus(updatedStatus);
        updateStatusMutation.mutate({
            taskId: task.id!,
            newStatus: updatedStatus,
        });
    };

    const handleDelete = () => {
        if (!task.id) return;
        deleteTaskMutation.mutate(task.id);
    };

    const style: React.CSSProperties | undefined = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              transition,
              opacity: isDragging ? 0 : 1,
          }
        : undefined;

    return (
        <>
            <li
                style={style}
                ref={setNodeRef}
                onClick={() => setEditOpen(true)}
                className={cn(
                    className,
                    "z-10 grid grid-cols-1 items-center justify-between p-2 sm:grid-cols-4",
                )}
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Checkbox
                            className="cursor-pointer"
                            checked={isChecked}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onCheckedChange={() => onToggle(task.id!)}
                        />
                        <span
                            ref={setActivatorNodeRef}
                            {...listeners}
                            {...attributes}
                            className="cursor-grab"
                        >
                            <GripVerticalIcon className="w-4 text-gray-400" />
                        </span>
                        <FaCheckCircle
                            className={cn(
                                "w-4",
                                task.status === "completed"
                                    ? "text-green-400"
                                    : "text-gray-400",
                            )}
                        />
                    </div>

                    <span
                        className={cn(
                            "text-sm",
                            task.status === "completed" && "line-through",
                        )}
                    >
                        {task.title}
                    </span>
                </div>

                <div className="hidden sm:block">
                    {relativeDateString(task.dueDate)}
                </div>

                <div className="hidden sm:block">
                    <Select
                        value={newStatus}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="w-auto [&_svg]:hidden">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">TO-DO</SelectItem>
                            <SelectItem value="in-progress">
                                IN-PROGRESS
                            </SelectItem>
                            <SelectItem value="completed">COMPLETED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative hidden items-center sm:flex">
                    <p className="mr-2">{task.category.toUpperCase()}</p>
                    <div className="absolute right-0 z-10 mt-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" sideOffset={8}>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditOpen(true);
                                    }}
                                >
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 hover:!text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                >
                                    <TbTrashFilled className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </li>

            {editOpen && (
                <EditTaskDialog
                    task={task}
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                />
            )}
        </>
    );
}
