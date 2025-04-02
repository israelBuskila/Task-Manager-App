import { Task } from "@/types";
import { NotificationManager } from "./notifications";

// Keep track of shown reminders to prevent duplicates
const shownReminders = new Set<string>();

// Define reminder intervals (in hours)
const REMINDER_INTERVALS = {
    URGENT: 1,      // 1 hour before
    SOON: 24,       // 1 day before
    UPCOMING: 72    // 3 days before
};

// Helper to get reminder message based on hours until reminder
const getReminderMessage = (hoursUntil: number): string => {
    if (hoursUntil <= REMINDER_INTERVALS.URGENT) {
        return `URGENT: Task reminder is in less than an hour!`;
    } else if (hoursUntil <= REMINDER_INTERVALS.SOON) {
        return `Task reminder is in ${Math.ceil(hoursUntil)} hour(s)`;
    } else {
        return `Upcoming task reminder is in ${Math.ceil(hoursUntil / 24)} days`;
    }
};

export const checkReminders = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return;

    const now = new Date();
    
    tasks.forEach(task => {
        if (task.status === 'COMPLETED') return;
        
        const taskId = task.id || task._id;
        if (!taskId) return;

        const reminderDate = new Date(task.reminderDate);
        const hoursUntilReminder = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Generate unique keys for different reminder stages
        const urgentKey = `${taskId}-urgent`;
        const soonKey = `${taskId}-soon`;
        const upcomingKey = `${taskId}-upcoming`;
        
        // Only show reminders for future dates
        if (hoursUntilReminder <= 0) return;

        // Check different reminder intervals
        if (hoursUntilReminder <= REMINDER_INTERVALS.URGENT && !shownReminders.has(urgentKey)) {
            NotificationManager.showTaskReminder(
                { ...task, title: "🚨 " + task.title }, // Add urgency indicator
                getReminderMessage(hoursUntilReminder)
            );
            shownReminders.add(urgentKey);
        } 
        else if (hoursUntilReminder <= REMINDER_INTERVALS.SOON && !shownReminders.has(soonKey)) {
            NotificationManager.showTaskReminder(
                task,
                getReminderMessage(hoursUntilReminder)
            );
            shownReminders.add(soonKey);
        }
        else if (hoursUntilReminder <= REMINDER_INTERVALS.UPCOMING && !shownReminders.has(upcomingKey)) {
            NotificationManager.showTaskReminder(
                task,
                getReminderMessage(hoursUntilReminder)
            );
            shownReminders.add(upcomingKey);
        }
    });
    
    // Clear shown reminders at midnight
    const clearShownReminders = () => {
        const currentDay = new Date().toDateString();
        const lastCheck = localStorage.getItem('lastReminderCheck');
        
        if (lastCheck !== currentDay) {
            shownReminders.clear();
            localStorage.setItem('lastReminderCheck', currentDay);
        }
    };
    
    clearShownReminders();
}