'use client'
import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import type { TimeOffRequest } from '@/types/timeoff'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TimeOffCalendarProps {
  requests: TimeOffRequest[]
  loading?: boolean
}

export default function TimeOffCalendar({ requests, loading }: TimeOffCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  requests = requests.filter(request => request.status !== 'REJECTED')

  // Transform requests into calendar events
  const events = requests.map(request => ({
    id: request.id,
    title: `${request.employee?.first_name} ${request.employee?.last_name} - ${request.type.replace('_', ' ')}`,
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
      status: request.status,
      type: request.type,
      employee: request.employee,
      reason: request.reason
    }
  }))

  const checkOverlappingEvents = (date: Date | null) => {
    if (!date) return []
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return date >= eventStart && date <= eventEnd
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-sunset">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-flame/20 border-t-flame rounded-full animate-spin" />
          <span>Loading calendar...</span>
        </div>
      </div>
    )
   }
   
   return (
    <div className="space-y-6">
      <style>{`
        .fc {
          font-family: inherit;
        }
        .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 1.5em;
        }
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--platinum);
        }
        .fc .fc-scrollgrid {
            border-bottom-width: 1px;
            border-right-width: 1px;
        }
        .fc .fc-scrollgrid-section-sticky > * {
            background: none;
        }
        .fc .fc-button {
          padding: 0.5rem;
          font-weight: 500;
          background: none;
          border: none;
          box-shadow: none;
        }
        .fc .fc-button:focus {
          box-shadow: none;
        }
        .fc .fc-button:not(.fc-button-active):hover {
          background: rgba(207, 92, 54, 0.1); /* flame with opacity */
        }
        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background: #CF5C36; /* flame */
          border-color: #CF5C36;
        }
        .fc .fc-button-primary {
          color: #EFC88B; /* sunset */
          border-radius: 0.5rem;
        }
        .fc .fc-col-header-cell {
          padding: 1rem 0;
          font-weight: 500;
          color: #EFC88B; /* sunset */
          background-color: #111827;
        }
        .fc .fc-daygrid-day-number {
          padding: 0.5rem;
          color: #D3D5D7; /* platinum */
        }
        .fc .fc-daygrid-day-frame {
          padding: 0.25rem;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(207, 92, 54, 0.1); /* flame with opacity */
        }
        .fc td, .fc th {
          border-color: rgba(207, 92, 54, 0.2); /* flame with opacity */
        }
        .fc .fc-toolbar.fc-header-toolbar {
          padding: 1rem;
          margin: 0;
        }
        .fc .fc-toolbar-chunk:first-child .fc-button-group {
          border: 1px solid rgba(207, 92, 54, 0.2);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .fc .fc-toolbar-chunk:first-child .fc-button {
          border-radius: 0;
          padding: 0.5rem 0.75rem;
        }
        .fc .fc-toolbar-chunk:last-child .fc-button-group {
          border: 1px solid rgba(207, 92, 54, 0.2);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .fc .fc-toolbar-chunk:last-child .fc-button {
          border-radius: 0;
          padding: 0.5rem 1rem;
        }
        .fc .fc-toolbar-chunk .fc-today-button {
          text-transform: lowercase;
          border: 1px solid rgba(207, 92, 54, 0.2);
          border-radius: 0.5rem;
          margin-left: 0.5rem;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(207, 92, 54, 0.2);
        }
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
            const overlappingCount = checkOverlappingEvents(arg.event.start).length
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
            )
        }}
        eventDidMount={(info) => {
            tippy(info.el, {
            content: `
                <div class="p-3">
                <div class="font-medium mb-1">${info.event.title}</div>
                <div class="text-sunset text-sm">
                    ${info.event.extendedProps.employee?.department?.name}<br>
                    ${new Date(info.event.start!).toLocaleDateString()} - 
                    ${new Date(info.event.end!).toLocaleDateString()}<br>
                    Status: ${info.event.extendedProps.status}<br>
                    ${info.event.extendedProps.reason ? `Reason: ${info.event.extendedProps.reason}` : ''}
                </div>
                </div>
            `,
            allowHTML: true,
            theme: 'dark',
            placement: 'top',
            interactive: true
            })
        }}
        />
      </div>
   
      {selectedDate && (
        <div className="bg-card rounded-lg border border-card-border shadow-md p-6">
          <h3 className="text-lg font-semibold text-platinum mb-4">
            Time Off on {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-3">
            {checkOverlappingEvents(selectedDate).map((event) => (
              <div 
                key={event.id}
                className={`p-4 rounded-lg ${
                  event.extendedProps.status === 'APPROVED' 
                    ? 'bg-success/10 border border-success/20' 
                    : event.extendedProps.status === 'PENDING'
                    ? 'bg-warning/10 border border-warning/20'
                    : 'bg-error/10 border border-error/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-platinum">{event.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    event.extendedProps.status === 'APPROVED' 
                      ? 'bg-success/20 text-success' 
                      : event.extendedProps.status === 'PENDING'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                  }`}>
                    {event.extendedProps.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-sunset space-y-1">
                  <p>{new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}</p>
                  {event.extendedProps.employee?.department?.name && (
                    <p>Department: {event.extendedProps.employee.department.name}</p>
                  )}
                  {event.extendedProps.reason && (
                    <p className="mt-2">{event.extendedProps.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
   )
}