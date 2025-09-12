import '@/app/globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Analytics } from "@vercel/analytics/next"
import { constructMetadata } from '@/lib/metadata'
import Script from 'next/script'

export const metadata = constructMetadata()

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="session-preload" strategy="beforeInteractive">
          {`
            (function() {
              if (typeof window === 'undefined') return;
              const hasSupabaseTokens = Object.keys(localStorage).some(key => 
                key.startsWith('sb-') && key.includes('auth-token')
              );
              if (hasSupabaseTokens) {
                const style = document.createElement('style');
                style.textContent = \`
                  .auth-preload {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: white; display: flex; align-items: center;
                    justify-content: center; z-index: 9999;
                  }
                  .auth-preload-spinner {
                    width: 24px; height: 24px; border: 2px solid #e5e5e5;
                    border-top: 2px solid #3b82f6; border-radius: 50%;
                    animation: spin 1s linear infinite;
                  }
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                \`;
                document.head.appendChild(style);
                const preloader = document.createElement('div');
                preloader.className = 'auth-preload';
                preloader.innerHTML = '<div><div class="auth-preload-spinner"></div><p style="margin-top: 12px; color: #666; font-size: 14px;">Cargando...</p></div>';
                document.body.appendChild(preloader);
                setTimeout(() => {
                  if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
                  if (style.parentNode) style.parentNode.removeChild(style);
                }, 1500);
              }
            })();
          `}
        </Script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}