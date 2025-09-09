// src/components/time-off/TimeOffRequests.tsx
'use client'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { TimeOffRequest } from '@/types/timeoff'
import { calculateDays } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface TimeOffRequestsProps {
  requests: TimeOffRequest[]
  loading: boolean
  onApprove: (requestId: string) => Promise<void> | void
  onReject: (requestId: string) => Promise<void> | void
}

export default function TimeOffRequests({ 
  requests, 
  loading,
  onApprove,
  onReject 
}: TimeOffRequestsProps) {
  const t = useTranslations('TimeOffPage')
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleStatusChange(requestId: string, status: 'APPROVED' | 'REJECTED') {
    try {
      setProcessingId(requestId)
      
      if (status === 'APPROVED') {
        const request = requests.find(r => r.id === requestId)
        if (request) {
          const overlapping = requests.filter(r => 
            r.status === 'APPROVED' &&
            r.id !== requestId &&
            r.employee_id === request.employee_id &&
            ((new Date(r.start_date) <= new Date(request.end_date) &&
              new Date(r.end_date) >= new Date(request.start_date)))
          )

          if (overlapping.length > 0) {
            alert(t('timeOffRequests.requestCard.alerts.overlap'))
            return
          }
        }
      }

      if (status === 'APPROVED') {
        onApprove(requestId)
      } else {
        onReject(requestId)
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing request:`, error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="p-4">{t('timeOffRequests.loading')}</div>
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING')
  const approvedRequests = requests.filter(r => r.status === 'APPROVED')
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED')

  const RequestCard = ({ request }: { request: TimeOffRequest }) => (
    <div
      className={`bg-card rounded-lg shadow-md p-4 border-l-4 ${
        request.status === 'PENDING' 
          ? 'border-warning'
          : request.status === 'APPROVED'
          ? 'border-success'
          : 'border-error'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-platinum">
            {request.employee?.first_name} {request.employee?.last_name}
          </h3>
          <p className="text-sm text-sunset">
            {request.employee?.department?.name}
          </p>
          <div className="mt-2">
            <p className="text-sm text-sunset">
              <span className="font-medium text-platinum">{t('timeOffRequests.requestCard.fields.type')}:</span> {
                request.policy?.name || 
                (request.type ? request.type.replace('_', ' ') : 'Time Off')
              }
            </p>
            <p className="text-sm text-sunset">
              <span className="font-medium text-platinum">{t('timeOffRequests.requestCard.fields.dates')}:</span>{' '}
              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
            </p>
            
            <p className="text-sm text-sunset">
              <span className="font-medium text-platinum">{t('timeOffRequests.requestCard.fields.totalDays')}:</span>{' '}
              {calculateDays(request.start_date, request.end_date)} {t('units.days')}
            </p>

            {request.reason && (
              <p className="text-sm mt-2 text-sunset">
                <span className="font-medium text-platinum">{t('timeOffRequests.requestCard.fields.reason')}:</span> {request.reason}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium
            ${request.status === 'PENDING' 
              ? 'bg-warning/10 text-warning' 
              : request.status === 'APPROVED'
              ? 'bg-success/10 text-success'
              : 'bg-error/10 text-error'
            }`}
          >
            {t(`timeOffRequests.requestCard.status.${request.status}`)}
          </span>
          {request.status === 'PENDING' && (
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleStatusChange(request.id, 'APPROVED')}
                disabled={processingId === request.id}
                className="px-3 py-1 bg-success text-platinum rounded hover:bg-success/90 disabled:opacity-50"
              >
                {t('timeOffRequests.requestCard.buttons.approve')}
              </button>
              <button
                onClick={() => handleStatusChange(request.id, 'REJECTED')}
                disabled={processingId === request.id}
                className="px-3 py-1 bg-error text-platinum rounded hover:bg-error/90 disabled:opacity-50"
              >
                {t('timeOffRequests.requestCard.buttons.reject')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="pending" className="flex items-center gap-2 text-sunset hover:text-primary data-[state=active]:text-primary">
          {t('timeOffRequests.tabs.pending')}
          {pendingRequests.length > 0 && (
            <span className="bg-warning/10 text-warning text-xs px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2 text-sunset hover:text-primary data-[state=active]:text-primary">
          {t('timeOffRequests.tabs.approved')}
          {approvedRequests.length > 0 && (
            <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full">
              {approvedRequests.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2 text-sunset hover:text-primary data-[state=active]:text-primary">
          {t('timeOffRequests.tabs.rejected')}
          {rejectedRequests.length > 0 && (
            <span className="bg-error/10 text-error text-xs px-2 py-0.5 rounded-full">
              {rejectedRequests.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4 space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-center text-sunset py-4">{t('timeOffRequests.messages.noPending')}</p>
        ) : (
          pendingRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>

      <TabsContent value="approved" className="mt-4 space-y-4">
        {approvedRequests.length === 0 ? (
          <p className="text-center text-sunset py-4">{t('timeOffRequests.messages.noApproved')}</p>
        ) : (
          approvedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>

      <TabsContent value="rejected" className="mt-4 space-y-4">
        {rejectedRequests.length === 0 ? (
          <p className="text-center text-sunset py-4">{t('timeOffRequests.messages.noRejected')}</p>
        ) : (
          rejectedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
