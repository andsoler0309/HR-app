import { useTranslations } from 'next-intl';
import type { PortalRequest } from '@/types/portal';

interface RequestListProps {
  requests: PortalRequest[];
  loading: boolean;
}

export default function RequestList({ requests, loading }: RequestListProps) {
  const t = useTranslations('RequestList');

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (requests.length === 0) {
    return <div>{t('noRequests')}</div>;
  }

  return (
    <div className="bg-card shadow-md rounded-lg border border-card-border">
      <ul className="divide-y divide-card-border">
        {requests.map((request) => (
          <li key={request.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-platinum">
                  {request.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-sunset">
                  {t('submittedOn')} {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.type === 'TIME_OFF' && (
                  <div className="mt-1 text-sm space-y-1">
                    <p className="text-sunset">
                      {t('timeOffRange', {
                        start: request.data.start_date,
                        end: request.data.end_date,
                      })}
                    </p>
                    <p className="text-sunset/70 line-clamp-2">{request.data.reason}</p>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-block
                    ${
                      request.status === 'PENDING'
                        ? 'bg-warning/10 text-warning'
                        : request.status === 'APPROVED'
                        ? 'bg-success/10 text-success'
                        : 'bg-error/10 text-error'
                    }`}
                >
                  {t(request.status.toLowerCase())}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
