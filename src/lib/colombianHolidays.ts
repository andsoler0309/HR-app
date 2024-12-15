// utils/colombianHolidays.ts
interface Holiday {
    date: Date;
    name: string;
    type: 'fixed' | 'movable';
  }
  
  function getColombianHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [
      { date: new Date(year, 0, 1), name: 'Año Nuevo', type: 'fixed' },
      { date: new Date(year, 0, 6), name: 'Día de los Reyes Magos', type: 'movable' },
      { date: new Date(year, 2, 19), name: 'Día de San José', type: 'movable' },
      // Semana Santa - dates need to be calculated based on Easter
      { date: new Date(year, 4, 1), name: 'Día del Trabajo', type: 'fixed' },
      { date: new Date(year, 5, 29), name: 'San Pedro y San Pablo', type: 'movable' },
      { date: new Date(year, 6, 20), name: 'Día de la Independencia', type: 'fixed' },
      { date: new Date(year, 7, 7), name: 'Batalla de Boyacá', type: 'fixed' },
      { date: new Date(year, 7, 15), name: 'Asunción de la Virgen', type: 'movable' },
      { date: new Date(year, 9, 12), name: 'Día de la Raza', type: 'movable' },
      { date: new Date(year, 10, 1), name: 'Todos los Santos', type: 'movable' },
      { date: new Date(year, 10, 11), name: 'Independencia de Cartagena', type: 'movable' },
      { date: new Date(year, 11, 8), name: 'Día de la Inmaculada Concepción', type: 'fixed' },
      { date: new Date(year, 11, 25), name: 'Día de Navidad', type: 'fixed' },
    ];
  
    // Adjust movable holidays to next Monday
    return holidays.map(holiday => {
      if (holiday.type === 'movable') {
        const date = holiday.date;
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 1) { // If not Monday
          const daysUntilMonday = (8 - dayOfWeek) % 7;
          date.setDate(date.getDate() + daysUntilMonday);
        }
      }
      return { ...holiday, date: holiday.date };
    });
  }
  
  export function isColombianHoliday(date: Date): { isHoliday: boolean; name?: string } {
    const holidays = getColombianHolidays(date.getFullYear());
    const holiday = holidays.find(h => 
      h.date.getFullYear() === date.getFullYear() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getDate() === date.getDate()
    );
  
    return {
      isHoliday: !!holiday,
      name: holiday?.name
    };
  }