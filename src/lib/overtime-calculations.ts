export type OvertimeType = 'REGULAR' | 'NIGHT' | 'SUNDAY' | 'HOLIDAY'

interface OvertimeRate {
  type: OvertimeType
  rate: number
  description: string
}

// Colombian overtime rates
export const OVERTIME_RATES: OvertimeRate[] = [
  { type: 'REGULAR', rate: 1.25, description: 'Hora Extra Diurna' },
  { type: 'NIGHT', rate: 1.75, description: 'Hora Extra Nocturna' },
  { type: 'SUNDAY_HOLIDAY', rate: 2.00, description: 'Hora Extra Dominical/Festivo Diurna' },
  { type: 'NIGHT_SUNDAY_HOLIDAY', rate: 2.50, description: 'Hora Extra Dominical/Festivo Nocturna' }
]

export interface OvertimeEntry {
  type: OvertimeType
  hours: number
  date: string
}

export function calculateOvertimePay(baseSalary: number, entries: OvertimeEntry[]): number {
  const hourlyRate = baseSalary / 240 // Colombian monthly hours (30 days * 8 hours)
  
  return entries.reduce((total, entry) => {
    const rate = OVERTIME_RATES.find(r => r.type === entry.type)?.rate || 1
    return total + (hourlyRate * rate * entry.hours)
  }, 0)
}