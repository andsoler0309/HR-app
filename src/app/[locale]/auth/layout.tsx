import React from "react"
import { constructMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const isSpanish = params.locale === 'es';
  
  return constructMetadata({
    title: isSpanish 
      ? 'Autenticación - PeoplerHR'
      : 'Authentication - PeoplerHR',
    description: isSpanish
      ? 'Inicia sesión o regístrate en PeoplerHR para gestionar tu equipo y procesos de RRHH.'
      : 'Sign in or register to PeoplerHR to manage your team and HR processes.',
    locale: params.locale,
    noIndex: true, // Auth pages shouldn't be indexed
  });
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-16 px-6 sm:px-8 lg:px-10">
      <div className="max-w-lg w-full space-y-10"> {/* Changed from max-w-md to max-w-lg */}
        {children}
      </div>
    </div>
  )
}
