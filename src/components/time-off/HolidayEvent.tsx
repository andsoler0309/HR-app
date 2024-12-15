  
  // components/calendar/HolidayEvent.tsx
  import { FC } from 'react';
  
  interface HolidayEventProps {
    name: string;
  }
  
  export const HolidayEvent: FC<HolidayEventProps> = ({ name }) => {
    return (
      <div className="bg-purple-100 text-purple-800 p-1 text-xs rounded">
        🎉 {name}
      </div>
    );
  };