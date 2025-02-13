"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";
import { addDays } from "date-fns";
import { auth } from "@/lib/firebase";
import { getUserTasks, Task, updateTaskStatus } from "@/firebase/tasks";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { TableView } from "@/components/table-view";
import { KanbanView } from "@/components/kanban-view";
import { Rows3, SquareKanban, Search, X, Loader2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(undefined);
    const minDate = useMemo(() => addDays(new Date(), 1), []);

    const [draggedTask, setDraggedTask] = useState<Task | undefined>(undefined);
    const [currentView, setCurrentView] = useState<"table" | "kanban">("table");
    const isDesktop = useIsDesktop(1024);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/signin");
        }
    }, [loading, user, router]);

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ["tasks", user?.uid],
        queryFn: () => (user ? getUserTasks(user.uid) : Promise.resolve([])),
        enabled: !!user,
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (dateFilter) {
                const taskDate = new Date(task.dueDate);
                if (taskDate.toDateString() !== dateFilter.toDateString()) {
                    return false;
                }
            }
            if (selectedCategory) {
                if (
                    task.category.toLowerCase() !==
                    selectedCategory.toLowerCase()
                ) {
                    return false;
                }
            }
            if (query) {
                if (!task.title.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
            }
            return true;
        });
    }, [tasks, dateFilter, selectedCategory, query]);

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
        onMutate: async ({ taskId, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ["tasks", user?.uid] });
            const previousTasks = queryClient.getQueryData<Task[]>([
                "tasks",
                user?.uid,
            ]);
            queryClient.setQueryData<Task[]>(
                ["tasks", user?.uid],
                (oldTasks = []) =>
                    oldTasks.map((task) =>
                        task.id === taskId
                            ? { ...task, status: newStatus }
                            : task,
                    ),
            );
            return { previousTasks };
        },
        onError: (err, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ["tasks", user?.uid],
                    context.previousTasks,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (!active) return;
        const found = tasks.find((t) => t.id === active.id);
        if (found) setDraggedTask(found);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over) return;
        setDraggedTask(undefined);

        const taskId = active.id.toString();
        const newStatus = over.id.toString().toLowerCase();

        const validStatuses = ["todo", "in-progress", "completed"];
        if (validStatuses.includes(newStatus)) {
            const taskChanged = tasks.some(
                (task) => task.id === taskId && task.status !== newStatus,
            );
            if (taskChanged) {
                updateStatusMutation.mutate({ taskId, newStatus });
            }
        } else {
            const oldIndex = tasks.findIndex((t) => t.id === taskId);
            const newIndex = tasks.findIndex((t) => t.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                queryClient.setQueryData(
                    ["tasks", user?.uid],
                    (oldTasks: Task[] | undefined) => {
                        if (!oldTasks) return [];
                        return arrayMove(oldTasks, oldIndex, newIndex);
                    },
                );
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col gap-5">
            <Header />
            <main className="flex flex-1 flex-col px-5 sm:px-20">
                {isDesktop && (
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => setCurrentView("table")}
                            className={`flex cursor-pointer items-center gap-1 pb-1.5 font-semibold ${
                                currentView === "table"
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-400"
                            }`}
                        >
                            <Rows3 className="h-4 w-4" /> List
                        </button>
                        <button
                            onClick={() => setCurrentView("kanban")}
                            className={`flex cursor-pointer items-center gap-1 pb-1.5 font-semibold ${
                                currentView === "kanban"
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-400"
                            }`}
                        >
                            <SquareKanban className="h-4 w-4" /> Board
                        </button>
                    </div>
                )}

                <div className="mt-4 flex w-full flex-col justify-between md:flex-row md:items-center border-b-2 pb-10">
                    <div className="self-end md:hidden">
                        <CreateTaskDialog />
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <p className="mr-2">Filter By:</p>
                        <div className="flex items-center gap-2">
                            <div>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={(val) =>
                                        setSelectedCategory(val)
                                    }
                                >
                                    <SelectTrigger className="w-fit rounded-full">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Category</SelectLabel>
                                            <SelectItem value="work">
                                                Work
                                            </SelectItem>
                                            <SelectItem value="personal">
                                                Personal
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <DateTimePicker
                                    classNames={{
                                        trigger:
                                            "rounded-full [&_svg]:hidden w-fit",
                                    }}
                                    initDisplayValue="Due Date"
                                    value={dateFilter}
                                    onChange={setDateFilter}
                                    min={minDate}
                                    hideTime
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 md:mt-0">
                        <div className="relative w-full max-w-[300px]">
                            <Input
                                type="text"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-9 rounded-full py-1.5 pr-9 pl-9 text-sm"
                            />
                            <div className="pointer-events-none absolute top-[50%] left-0 flex -translate-y-[50%] items-center pl-3">
                                <Search className="h-4 w-4 text-gray-500" />
                            </div>
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                        <div className="hidden md:block">
                            <CreateTaskDialog />
                        </div>
                    </div>
                </div>

                {isLoading || loading ? (
                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 py-10">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    </div>
                ) : !filteredTasks.length ? (
                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 py-10">
                        <Image
                            src="/SearchNotFound.svg"
                            alt="No results"
                            className="h-auto w-40"
                            width={200}
                            height={300}
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            It looks like we can't find any results that match.
                        </p>
                    </div>
                ) : isDesktop ? (
                    currentView === "table" ? (
                        <TableView
                            tasks={filteredTasks}
                            draggedTask={draggedTask}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                        />
                    ) : (
                        <KanbanView
                            tasks={filteredTasks}
                            draggedTask={draggedTask}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                        />
                    )
                ) : (
                    <TableView
                        tasks={filteredTasks}
                        draggedTask={draggedTask}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                    />
                )}
            </main>
        </div>
    );
}
