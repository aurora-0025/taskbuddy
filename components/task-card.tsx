import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    MoreHorizontal,
    PencilLine,
} from "lucide-react";
import { capitalize, cn, relativeDateString } from "@/lib/utils";
import { deleteTask, Task } from "@/firebase/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { EditTaskDialog } from "./edit-task-dialog";
import { TbTrashFilled } from "react-icons/tb";

type TaskCardProps = {
    task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        setActivatorNodeRef,
    } = useSortable({
        id: task.id!,
        data: { parentId: task.status },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [user] = useAuthState(auth);
    const [editOpen, setEditOpen] = useState(false);

    const queryClient = useQueryClient();

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            if (!user) return;
            await deleteTask(user.uid, taskId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
        },
    });
    const handleDelete = () => {
        if (!task.id) return;
        deleteTaskMutation.mutate(task.id);
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "cursor-default rounded-md border bg-white p-2 shadow-sm",
                )}
                {...attributes}
                {...listeners}
            >
                <div
                    ref={setActivatorNodeRef}
                    className="flex h-[80px] cursor-grab flex-col items-center justify-between"
                >
                    <div className="flex w-full items-center justify-between">
                        <h3
                            className={cn(
                                "font-semibold",
                                task.status == "completed" && "line-through",
                            )}
                        >
                            {task.title}
                        </h3>
                        <span>
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
                                <DropdownMenuContent
                                    align="start"
                                    sideOffset={8}
                                >
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
                        </span>
                    </div>
                    <div className="flex w-full justify-between text-xs">
                        <p>{capitalize(task.category.toLowerCase())}</p>
                        <p>{relativeDateString(new Date(task.dueDate))}</p>
                    </div>
                </div>
            </div>
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
