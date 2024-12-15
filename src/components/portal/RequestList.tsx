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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-platinum">
                  {request.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-sunset">
                  {t('submittedOn')} {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.type === 'TIME_OFF' && (
                  <div className="mt-1 text-sm">
                    <p className="text-sunset">
                      {t('timeOffRange', {
                        start: request.data.start_date,
                        end: request.data.end_date,
                      })}
                    </p>
                    <p className="text-sunset/70">{request.data.reason}</p>
                  </div>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
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
          </li>
        ))}
      </ul>
    </div>
  );
}
