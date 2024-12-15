import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { supabase } from '@/lib/supabase';
import type { TimeOffRequest } from '@/types/timeoff';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  created_at: string;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  description: string | null;
}

interface CombinedCalendarProps {
  timeOffRequests: TimeOffRequest[];
  user: any;
  loading?: boolean;
}

export default function CombinedCalendar({ timeOffRequests, user, loading }: CombinedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    if (user?.employee_id) {
      fetchAttendanceRecords();
      fetchHolidays();
    }
  }, [user]);

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', user.employee_id)
        .gte('clock_in', new Date(new Date().getFullYear(), 0, 1).toISOString())
        .order('clock_in', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('company_holidays')
        .select('*')
        .eq('company_id', user.company_id)
        .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString());

      if (error) throw error;
      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  // Transform all events into calendar events
  const events = [
    // Time off requests
    ...timeOffRequests.map(request => ({
      id: request.id,
      title: `Time Off: ${request.type.replace('_', ' ')}`,
      start: request.start_date,
      end: request.end_date,
      backgroundColor: 
        request.status === 'APPROVED' ? '#16A34A' :
        request.status === 'PENDING' ? '#FEF3C7' :
        '#FEE2E2',
      textColor:
        request.status === 'APPROVED' ? '#FFFFFF' :
        request.status === 'PENDING' ? '#92400E' :
        '#991B1B',
      borderColor: 'transparent',
      classNames: ['rounded-md', 'px-2', 'py-1', 'text-sm'],
      extendedProps: {
        type: 'timeoff',
        status: request.status,
        requestType: request.type,
        reason: request.reason
      }
    })),

    // Attendance records
    ...attendanceRecords.map(record => ({
      id: record.id,
      title: record.clock_out ? 'Full Day' : 'Clock In',
      start: record.clock_in,
      end: record.clock_out || record.clock_in,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      borderColor: 'transparent',
      classNames: ['rounded-md', 'px-2', 'py-1', 'text-sm'],
      extendedProps: {
        type: 'attendance',
        clockIn: record.clock_in,
        clockOut: record.clock_out
      }
    })),

    // Holidays
    ...holidays.map(holiday => ({
      id: holiday.id,
      title: `Holiday: ${holiday.name}`,
      start: holiday.date,
      end: holiday.date,
      backgroundColor: '#CF5C36',
      textColor: '#FFFFFF',
      borderColor: 'transparent',
      classNames: ['rounded-md', 'px-2', 'py-1', 'text-sm'],
      extendedProps: {
        type: 'holiday',
        description: holiday.description
      }
    }))
  ];

  const checkOverlappingEvents = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return date >= eventStart && date <= eventEnd;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-sunset">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-flame/20 border-t-flame rounded-full animate-spin" />
          <span>Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reuse your existing styles here */}
      <style>{`
        /* Your existing styles from TimeOffCalendar */
      `}</style>

      <div className="bg-card rounded-lg shadow-md border border-card-border">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={(info) => setSelectedDate(info.event.start)}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          dayMaxEventRows={true}
          eventDisplay="block"
          displayEventTime={false}
          eventContent={(arg) => {
            const overlappingCount = checkOverlappingEvents(arg.event.start).length;
            return (
              <div className="p-1">
                <div className="text-xs truncate">
                  {arg.event.title}
                </div>
                {overlappingCount > 1 && (
                  <div className="text-xs opacity-75">
                    +{overlappingCount - 1} more
                  </div>
                )}
              </div>
            );
          }}
          eventDidMount={(info) => {
            let tooltipContent = '';
            
            switch (info.event.extendedProps.type) {
              case 'timeoff':
                tooltipContent = `
                  <div class="p-3">
                    <div class="font-medium mb-1">Time Off Request</div>
                    <div class="text-sunset text-sm">
                      Type: ${info.event.extendedProps.requestType}<br>
                      Status: ${info.event.extendedProps.status}<br>
                      ${info.event.extendedProps.reason ? `Reason: ${info.event.extendedProps.reason}` : ''}
                    </div>
                  </div>
                `;
                break;
              case 'attendance':
                tooltipContent = `
                  <div class="p-3">
                    <div class="font-medium mb-1">Attendance Record</div>
                    <div class="text-sunset text-sm">
                      Clock In: ${new Date(info.event.extendedProps.clockIn).toLocaleTimeString()}<br>
                      ${info.event.extendedProps.clockOut ? `Clock Out: ${new Date(info.event.extendedProps.clockOut).toLocaleTimeString()}` : 'Not clocked out'}
                    </div>
                  </div>
                `;
                break;
              case 'holiday':
                tooltipContent = `
                  <div class="p-3">
                    <div class="font-medium mb-1">${info.event.title}</div>
                    <div class="text-sunset text-sm">
                      ${info.event.extendedProps.description || ''}
                    </div>
                  </div>
                `;
                break;
            }

            tippy(info.el, {
              content: tooltipContent,
              allowHTML: true,
              theme: 'dark',
              placement: 'top',
              interactive: true
            });
          }}
        />
      </div>

      {selectedDate && (
        <div className="bg-card rounded-lg border border-card-border shadow-md p-6">
          <h3 className="text-lg font-semibold text-platinum mb-4">
            Events on {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-3">
            {checkOverlappingEvents(selectedDate).map((event) => (
              <div 
                key={event.id}
                className="p-4 rounded-lg bg-background/50 border border-card-border"
                style={{
                  backgroundColor: `${event.backgroundColor}20`
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-platinum">{event.title}</h4>
                  <span className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: event.backgroundColor,
                      color: event.textColor
                    }}>
                    {event.extendedProps.type.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-sunset space-y-1">
                  {event.extendedProps.type === 'attendance' && 'clockIn' in event.extendedProps && (
                    <>
                      <p>Clock In: {new Date(event.extendedProps.clockIn).toLocaleTimeString()}</p>
                      {'clockOut' in event.extendedProps && event.extendedProps.clockOut && (
                        <p>Clock Out: {new Date(event.extendedProps.clockOut).toLocaleTimeString()}</p>
                      )}
                    </>
                  )}
                  {event.extendedProps.type === 'timeoff' && 'status' in event.extendedProps && (
                    <>
                      <p>Status: {event.extendedProps.status}</p>
                      {'reason' in event.extendedProps && event.extendedProps.reason && <p>Reason: {event.extendedProps.reason}</p>}
                    </>
                  )}
                  {event.extendedProps.type === 'holiday' && 'description' in event.extendedProps && (
                    <p>{event.extendedProps.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}