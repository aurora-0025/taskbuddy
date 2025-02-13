// components/kanban-board.tsx
import React, { useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { Task } from "@/firebase/tasks";
import { KanbanColumn } from "./kanban-column";
import TaskCard from "./task-card";


const KANBAN_COLUMNS = [
    { id: "todo", title: "TO-DO", color: "bg-[#FAC3FF]" },
    { id: "in-progress", title: "IN-PROGRESS", color: "bg-[#85D9F1]" },
    { id: "completed", title: "COMPLETED", color: "bg-[#CEFFCC]" },
  ];

export function KanbanView({
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

    const tasksByStatus = useMemo(() => {
      const map: Record<string, Task[]> = {
        todo: [],
        "in-progress": [],
        completed: [],
      };
      tasks.forEach((t) => {
        map[t.status]?.push(t);
      });
      return map;
    }, [tasks]);
  
    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-2 overflow-auto p-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
                  key={col.id}
                  title={col.title}
                  color={col.color}
                  tasks={tasksByStatus[col.id] || []} status={col.id}>
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay
          dropAnimation={null}
        >
          {draggedTask ? (
            <TaskCard
              task={draggedTask}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }
