import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    orderBy,
    updateDoc,
    arrayUnion,
    deleteDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export type ActivityEntry = {
    type: string;
    message: string;
    timestamp: string;
    userId?: string;
};

export interface Task {
    id?: string;
    title: string;
    description: string;
    category: string;
    status: string;
    dueDate: string;
    createdAt: string;
    activity?: ActivityEntry[];
}

export async function getUserTasks(userId: string): Promise<Task[]> {
    const tasksRef = collection(firestore, "tasks", userId, "list");
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
}

export async function addTask(userId: string, task: Task): Promise<void> {
    const taskRef = doc(collection(firestore, "tasks", userId, "list"));
    await setDoc(taskRef, task);
}

export async function updateTaskStatus(
    userId: string,
    taskId: string,
    newStatus: string,
): Promise<void> {
    const taskRef = doc(firestore, "tasks", userId, "list", taskId);
    await updateDoc(taskRef, { status: newStatus });
}

export async function updateTask(
    userId: string,
    taskId: string,
    updatedData: Record<string, any>,
    newActivity: any[],
) {
    const taskRef = doc(firestore, "tasks", userId, "list", taskId);
    try {
        await updateDoc(taskRef, {
            ...updatedData,
            activity: arrayUnion(...newActivity),
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.log(error);
        
    }   
}

export async function deleteTask(
    userId: string,
    taskId: string,
) {
    const taskRef = doc(firestore, "tasks", userId, "list", taskId);
    try {
        await deleteDoc(taskRef);
    } catch (error) {
        console.log(error);
    }   
}
