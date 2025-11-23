import { TaskPriority, EisenhowerQuadrant } from '../types';

/**
 * Automatically determines the Eisenhower quadrant based on priority and deadline
 * 
 * Logic:
 * - URGENT: Deadline is within 3 days from now
 * - IMPORTANT: Priority is HIGH or CRITICAL
 * 
 * Quadrants:
 * - URGENT_IMPORTANT: High/Critical priority AND deadline within 3 days
 * - NOT_URGENT_IMPORTANT: High/Critical priority BUT deadline > 3 days or no deadline
 * - URGENT_NOT_IMPORTANT: Low/Medium priority BUT deadline within 3 days
 * - NOT_URGENT_NOT_IMPORTANT: Low/Medium priority AND (deadline > 3 days or no deadline)
 */
export function calculateEisenhowerQuadrant(
  priority: TaskPriority,
  dueDate: Date | null
): EisenhowerQuadrant {
  const isImportant = priority === 'HIGH' || priority === 'URGENT';
  const isUrgent = isTaskUrgent(dueDate);

  if (isUrgent && isImportant) {
    return 'URGENT_IMPORTANT';
  } else if (!isUrgent && isImportant) {
    return 'NOT_URGENT_IMPORTANT';
  } else if (isUrgent && !isImportant) {
    return 'URGENT_NOT_IMPORTANT';
  } else {
    return 'NOT_URGENT_NOT_IMPORTANT';
  }
}

/**
 * Determines if a task is urgent based on its due date
 * A task is considered urgent if the deadline is within 3 days from now
 */
export function isTaskUrgent(dueDate: Date | null): boolean {
  if (!dueDate) {
    return false;
  }

  const now = new Date();
  const deadline = new Date(dueDate);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  return deadline <= threeDaysFromNow;
}

/**
 * Gets a human-readable description of why a task is in a specific quadrant
 */
export function getQuadrantReason(
  priority: TaskPriority,
  dueDate: Date | null
): string {
  const isImportant = priority === 'HIGH' || priority === 'URGENT';
  const isUrgent = isTaskUrgent(dueDate);

  if (isUrgent && isImportant) {
    return 'High priority with urgent deadline - Do First!';
  } else if (!isUrgent && isImportant) {
    return 'High priority but not urgent - Schedule it';
  } else if (isUrgent && !isImportant) {
    return 'Urgent but low priority - Delegate if possible';
  } else {
    return 'Not urgent and low priority - Do later or eliminate';
  }
}

/**
 * Gets the number of days until the deadline
 */
export function getDaysUntilDeadline(dueDate: Date | null): number | null {
  if (!dueDate) {
    return null;
  }

  const now = new Date();
  const deadline = new Date(dueDate);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Gets a formatted string describing the deadline urgency
 */
export function getDeadlineUrgencyText(dueDate: Date | null): string {
  const days = getDaysUntilDeadline(dueDate);

  if (days === null) {
    return 'No deadline set';
  } else if (days < 0) {
    return `Overdue by ${Math.abs(days)} day(s)`;
  } else if (days === 0) {
    return 'Due today!';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else if (days <= 3) {
    return `Due in ${days} days (Urgent)`;
  } else if (days <= 7) {
    return `Due in ${days} days`;
  } else {
    return `Due in ${days} days`;
  }
}

