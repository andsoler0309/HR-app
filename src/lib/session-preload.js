// Script inline para pre-cargar la sesión de Supabase lo antes posible
// Esto se ejecuta antes de que React se hidrate

(function() {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return;

  // Verificar si ya tenemos tokens en localStorage
  const hasSupabaseTokens = Object.keys(localStorage).some(key => 
    key.startsWith('sb-') && key.includes('auth-token')
  );

  if (hasSupabaseTokens) {
    // Mostrar un indicador visual inmediato de que hay sesión
    const style = document.createElement('style');
    style.textContent = `
      .auth-preload {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: hsl(var(--background));
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .auth-preload-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid hsl(var(--muted));
        border-top: 3px solid hsl(var(--primary));
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    const preloader = document.createElement('div');
    preloader.className = 'auth-preload';
    preloader.innerHTML = `
      <div>
        <div class="auth-preload-spinner"></div>
        <p style="margin-top: 12px; color: hsl(var(--muted-foreground)); font-size: 14px;">
          Cargando...
        </p>
      </div>
    `;
    
    document.body.appendChild(preloader);

    // Remover el preloader cuando React se monte
    setTimeout(() => {
      if (preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 2000);
  }
})();
