import { Task } from "@/types";
import { NotificationManager } from "./notifications";

export const checkReminders = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        if (task.status === 'COMPLETED') return;

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Only check for tasks due today
        if (dueDate.getTime() === today.getTime()) {
            NotificationManager.showInfo(`Task "${task.title}" is due today!`);
        }
    });
}