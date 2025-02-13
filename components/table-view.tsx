import React, { useState } from "react";
import { deleteTask, Task, updateTaskStatus } from "@/firebase/tasks";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core";
import { Accordion } from "./ui/accordion";
import TaskTable from "./task-table";
import TaskRow from "./task-row";
import { ChevronUp, ChevronDown, ChevronsUpDownIcon } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { FloatingBar } from "./floating-bar";

type SortOrder = "asc" | "desc" | undefined;

export function TableView({
    tasks,
    handleDragStart,
    handleDragEnd,
    draggedTask,
}: {
    tasks: Task[];
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    draggedTask: Task | undefined;
}) {
    const [sortOrder, setSortOrder] = useState<SortOrder>(undefined);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
        new Set(),
    );

    function toggleSort() {
        if (sortOrder === undefined) {
            setSortOrder("asc");
        } else if (sortOrder === "asc") {
            setSortOrder("desc");
        } else {
            setSortOrder(undefined);
        }
    }

    const [user] = useAuthState(auth);
    const queryClient = useQueryClient();

    function sortTasksByDueDate(tasks: Task[], order: SortOrder) {
        if (!order) return tasks; // No sort
        return [...tasks].sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return order === "asc" ? dateA - dateB : dateB - dateA;
        });
    }

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

    function toggleTaskSelection(taskId: string) {
        setSelectedTaskIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }

    function bulkUpdateStatus(newStatus: string) {
        selectedTaskIds.forEach((id) => {
            updateStatusMutation.mutate({ taskId: id, newStatus });
        });
        setSelectedTaskIds(new Set());
    }

    function bulkDelete() {
        selectedTaskIds.forEach((id) => {
            deleteTaskMutation.mutate(id);
        });
        setSelectedTaskIds(new Set());
    }

    const groupedTasks = {
        ToDo: sortTasksByDueDate(
            tasks.filter((t) => t.status === "todo"),
            sortOrder,
        ),
        "In-Progress": sortTasksByDueDate(
            tasks.filter((t) => t.status === "in-progress"),
            sortOrder,
        ),
        Completed: sortTasksByDueDate(
            tasks.filter((t) => t.status === "completed"),
            sortOrder,
        ),
    };

    function onDragEnd(event: DragEndEvent) {
        setSortOrder(undefined);
        handleDragEnd(event);
    }

    return (
        <>
            {selectedTaskIds.size > 0 && (
                <FloatingBar
                    count={selectedTaskIds.size}
                    onDelete={bulkDelete}
                    onUpdateStatus={bulkUpdateStatus}
                    onClearAll={() => setSelectedTaskIds(new Set())}
                />
            )}

            <DndContext onDragStart={handleDragStart} onDragEnd={onDragEnd}>
                <div className="hidden grid-cols-1 items-start justify-between p-2 text-xs font-semibold text-[#000000]/60 sm:grid sm:grid-cols-4">
                    <p>Task name</p>

                    <div
                        className="flex cursor-pointer items-center gap-1"
                        onClick={toggleSort}
                    >
                        <p>Due on</p>
                        {sortOrder === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : sortOrder === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronsUpDownIcon className="h-3 w-3" />
                        )}
                    </div>

                    <p>Task Status</p>
                    <p>Task Category</p>
                </div>

                <Accordion type="multiple">
                    {Object.entries(groupedTasks).map(([status, tasks]) => (
                        <TaskTable
                            key={status}
                            tasks={tasks}
                            status={status}
                            toggleTaskSelection={toggleTaskSelection}
                            selectedTaskIds={selectedTaskIds}
                        />
                    ))}
                </Accordion>

                <DragOverlay dropAnimation={null}>
                    {draggedTask ? (
                        <TaskRow
                            className="rounded-md bg-white"
                            task={draggedTask}
                            status={draggedTask.status}
                            onToggle={() => {}}
                            isChecked={false}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </>
    );
}
