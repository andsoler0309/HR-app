'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { PortalUser } from '@/types/portal';

export default function PortalLogin() {
  const t = useTranslations('PortalLogin');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: accessData, error: accessError } = await supabase
        .from('employee_portal_access')
        .select('*')
        .match({ 
          email: email.trim().toLowerCase(),
          access_token: token.trim()
        });

      if (accessError || !accessData?.length) {
        throw new Error('Invalid credentials');
      }

      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          company_id,
          position,
          department:department_id(
            id,
            name
          )
        `)
        .eq('id', accessData[0].employee_id)
        .single();

      if (employeeError || !employeeData) {
        throw new Error('Employee not found');
      }

      const portalUser: PortalUser = {
        id: accessData[0].id,
        employee_id: accessData[0].employee_id,
        email: accessData[0].email,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        company_id: employeeData.company_id,
        department: employeeData.department as unknown as { id: string; name: string },
        position: employeeData.position,
      };

      localStorage.setItem('portal_user', JSON.stringify(portalUser));

      await supabase
        .from('employee_portal_access')
        .update({ 
          last_login: new Date().toISOString() 
        })
        .eq('id', accessData[0].id);

      router.push('/portal/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(t('errorInvalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-platinum">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-sunset">
            {t('subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-error/10 text-error p-4 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-md -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="input-base appearance-none rounded-none relative block w-full px-3 py-2 border-card-border text-platinum placeholder-sunset/70 rounded-t-md focus:ring-flame/20 focus:border-flame sm:text-sm"
                placeholder={t('emailPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="token" className="sr-only">
                {t('tokenLabel')}
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                className="input-base appearance-none rounded-none relative block w-full px-3 py-2 border-card-border text-platinum placeholder-sunset/70 rounded-b-md focus:ring-flame/20 focus:border-flame sm:text-sm"
                placeholder={t('tokenPlaceholder')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group relative w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? t('signInLoading') : t('signInButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
