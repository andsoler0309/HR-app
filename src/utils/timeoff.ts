import { differenceInBusinessDays, parseISO, addDays, isWeekend } from 'date-fns'

export function calculateBusinessDays(startDate: string, endDate: string): number {
  return differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1
}

export function calculateTimeOffDates(startDate: string, endDate: string): Date[] {
  const dates: Date[] = []
  let currentDate = parseISO(startDate)
  const end = parseISO(endDate)

  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      dates.push(currentDate)
    }
    currentDate = addDays(currentDate, 1)
  }

  return dates
}

export function formatTimeOffStatus(status: string): string {
  return {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  }[status] || status
}

export function formatTimeOffType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}