import { formatDistanceToNow, format } from "date-fns";

export function formatRelativeDate(value: Date | string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatFullDate(value: Date | string) {
  return format(new Date(value), "yyyy/MM/dd HH:mm");
}

export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
