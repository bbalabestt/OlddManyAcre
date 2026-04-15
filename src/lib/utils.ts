
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { intervalToDuration, parseISO, isValid, differenceInMinutes } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBookingDuration(startTimeISO: string, endTimeISO: string): string {
  const startDate = parseISO(startTimeISO);
  const endDate = parseISO(endTimeISO);

  if (!isValid(startDate) || !isValid(endDate) || endDate < startDate) { // Allow same start/end for "Brief"
    return 'N/A';
  }

  if (startDate.getTime() === endDate.getTime()) {
    return 'Brief';
  }

  const duration = intervalToDuration({ start: startDate, end: endDate });
  const parts: string[] = [];

  const totalDays = (duration.years || 0) * 365 + (duration.months || 0) * 30 + (duration.days || 0);

  if (totalDays >= 1) {
    if (duration.years && duration.years > 0) parts.push(`${duration.years} year${duration.years > 1 ? 's' : ''}`);
    if (duration.months && duration.months > 0) parts.push(`${duration.months} month${duration.months > 1 ? 's' : ''}`);
    if (duration.days && duration.days > 0) parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
    // Optionally add hours if totalDays is small (e.g., less than 2 days) and there are no larger units like years/months
    if (parts.length > 0 && duration.hours && duration.hours > 0 && totalDays < 2 && !duration.years && !duration.months) {
        parts.push(`${duration.hours} hr${duration.hours > 1 ? 's' : ''}`);
    }
  } else { // Less than a day
    if (duration.hours && duration.hours > 0) parts.push(`${duration.hours} hr${duration.hours > 1 ? 's' : ''}`);
    if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes} min${duration.minutes > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
    // This might happen if duration is only in seconds, or if intervalToDuration has edge cases for very short durations.
    const diffMins = differenceInMinutes(endDate, startDate);
    if (diffMins > 0 && diffMins < 60) { // Check if it's less than an hour but more than 0 minutes
        return `${diffMins} min${diffMins > 1 ? 's' : ''}`;
    }
    return 'Brief'; // Fallback if no larger units and minutes are 0 or not captured by above logic
  }

  return parts.join(', ');
}

export function parseCapacityToNumber(capacityString?: string): number {
  if (!capacityString) return 0;
  const match = capacityString.match(/^(\d+(\.\d+)?)/); // Extracts leading number
  return match ? parseFloat(match[1]) : 0;
}
