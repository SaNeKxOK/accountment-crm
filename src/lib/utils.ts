import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date and report utilities
export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  const due = new Date(dueDate);

  // Set time to start of day for fair comparison
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  // Report is overdue only AFTER the due date has passed
  return due < today;
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "очікується":
      return "bg-yellow-100 text-yellow-800";
    case "в_роботі":
      return "bg-blue-100 text-blue-800";
    case "подано":
      return "bg-green-100 text-green-800";
    case "сплачено":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatPeriod(period: string): string {
  // Handle different period formats
  if (period.includes("Q")) {
    return period; // Already formatted like "Q1 2024"
  }

  if (period.match(/^\d{4}$/)) {
    return period; // Year format like "2024"
  }

  // Month format like "March 2024"
  return period;
}
