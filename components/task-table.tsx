import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import TaskRow from "./task-row";
import { InlineAddTask } from "./add-task-row";
import { useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export default function TaskTable({
    status,
    tasks,
    toggleTaskSelection,
    selectedTaskIds,
}: {
    status: string;
    tasks: any[];
    toggleTaskSelection: (taskId: string) => void;
    selectedTaskIds: Set<string>;
}) {
    const { isOver, setNodeRef } = useDroppable({ id: status });
    const [showInlineForm, setShowInlineForm] = useState(false);
    const statusColors: Record<string, string> = {
        ToDo: "bg-[#FAC3FF]",
        "In-Progress": "bg-[#85D9F1]",
        Completed: "bg-[#CEFFCC]",
    };
    return (
        <AccordionItem ref={setNodeRef} value={status} className="my-2 border-0">
            <AccordionTrigger
                className={`rounded-t-md rounded-b-none data-[state="closed"]:rounded-b-md p-2 ${statusColors[status] || "bg-white"}`}
            >
                {status} ({tasks.length})
            </AccordionTrigger>
            <AccordionContent className="bg-muted flex min-h-[100px] flex-col justify-center rounded-b-2xl">
                {status === "ToDo" && (
                    <div className="border-b px-4 pt-2 last:border-b-0">
                        {!showInlineForm ? (
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => setShowInlineForm(true)}
                            >
                                <Plus className="text-primary" /> Add Task
                            </Button>
                        ) : (
                            <InlineAddTask
                                onCancel={() => setShowInlineForm(false)}
                            />
                        )}
                    </div>
                )}
                <SortableContext
                    items={tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">
                            No tasks found
                        </p>
                    ) : (
                        <ul>
                            {tasks.map((task) => (
                                <TaskRow
                                    className="border-b last:border-b-0"
                                    key={task.id}
                                    task={task}
                                    status={status}
                                    onToggle={() => toggleTaskSelection(task.id)}
                                    isChecked={selectedTaskIds.has(task.id!)}
                                />
                            ))}
                        </ul>
                    )}
                </SortableContext>
            </AccordionContent>
        </AccordionItem>
    );
}
