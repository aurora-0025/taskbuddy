import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./task-card";
import { Task } from "@/firebase/tasks";

type DroppableColumnProps = {
  status: string;
  title: string;
  color: string;
  tasks: Task[]; 
};

export function KanbanColumn({
  status,
  title,
  color,
  tasks,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="w-[300px] min-w-[250px] border rounded-md bg-secondary flex flex-col gap-2 p-2"
    >
      <div className={`rounded-md w-fit text-sm p-2 mb-4 ${color}`}>
        <h2 className="font-semibold">
          {title}
        </h2>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id!)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
            No tasks
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  );
}
