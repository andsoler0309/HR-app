'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PortalAccessProps {
  employee: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function PortalAccess({ employee }: PortalAccessProps) {
  const t = useTranslations('employees.portalAccess');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const generateAccess = async () => {
    try {
      setLoading(true);
      
      // Generate random token
      const newToken = Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('employee_portal_access')
        .insert({
          employee_id: employee.id,
          email: employee.email,
          access_token: newToken
        });

      if (error) throw error;
      
      setToken(newToken);
    } catch (error) {
      console.error('Error generating access:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">{t('title')}</h3>
      {token ? (
        <div className="mt-2">
          <p className="text-sm text-gray-600">{t('accessToken')}:</p>
          <code className="block p-2 bg-gray-50 rounded mt-1">{token}</code>
          <p className="text-sm text-gray-500 mt-2">
            {t('shareToken')}
          </p>
        </div>
      ) : (
        <Button
          onClick={generateAccess}
          disabled={loading}
          className="mt-2"
        >
          {loading ? <LoadingSpinner className="w-5 h-5" /> : t('generateAccess')}
        </Button>
      )}
    </div>
  );
}
