'use client';

import { useEffect } from 'react';

export default function SessionPreloader() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const hasSupabaseTokens = Object.keys(localStorage).some(key => 
      key.startsWith('sb-') && key.includes('auth-token')
    );
    
    if (hasSupabaseTokens) {
      const style = document.createElement('style');
      style.id = 'auth-preload-style';
      style.textContent = `
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
      `;
      
      document.head.appendChild(style);
      
      const preloader = document.createElement('div');
      preloader.className = 'auth-preload';
      preloader.id = 'auth-preloader';
      preloader.innerHTML = '<div><div class="auth-preload-spinner"></div><p style="margin-top: 12px; color: #666; font-size: 14px;">Cargando...</p></div>';
      
      document.body.appendChild(preloader);
      
      const cleanup = setTimeout(() => {
        const existingPreloader = document.getElementById('auth-preloader');
        const existingStyle = document.getElementById('auth-preload-style');
        
        if (existingPreloader?.parentNode) {
          existingPreloader.parentNode.removeChild(existingPreloader);
        }
        if (existingStyle?.parentNode) {
          existingStyle.parentNode.removeChild(existingStyle);
        }
      }, 1500);
      
      return () => {
        clearTimeout(cleanup);
      };
    }
  }, []);

  return null;
}
