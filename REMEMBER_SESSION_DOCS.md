# Funcionalidad "Recordar Sesión" - NodoHR

## Resumen

Se ha implementado una funcionalidad completa de "Recordar Sesión" que permite a los usuarios mantener su sesión activa sin necesidad de volver a introducir sus credenciales cada vez que acceden a la aplicación.

## Características Implementadas

### 1. **Checkbox "Recordarme" en Login**
- El usuario puede marcar la opción "Recordarme" en el formulario de login
- Si está marcada, la sesión se mantendrá activa por más tiempo
- Si no está marcada, la sesión se mantendrá solo durante la sesión del navegador

### 2. **Persistencia de Datos del Usuario**
- **Email guardado**: Si el usuario marca "Recordarme", su email se guarda y se pre-llena automáticamente en futuros logins
- **Preferencia recordada**: La aplicación recuerda si el usuario quiere mantener su sesión activa

### 3. **Redirección Automática**
- Si un usuario ya tiene una sesión activa al intentar acceder a:
  - La página principal (`/`)
  - Páginas de autenticación (`/auth/login`, `/auth/register`)
- Será redirigido automáticamente al dashboard (`/dashboard/employees`)

### 4. **Experiencia de Usuario Mejorada**
- **Animación de bienvenida**: Los usuarios con sesión recordada ven una animación especial de "Bienvenido de vuelta"
- **Estados de carga**: Indicadores visuales durante la verificación de autenticación
- **Mensajes informativos**: Feedback claro sobre el estado de la sesión

### 5. **Gestión de Sesiones**
- **Limpieza automática**: Al cerrar sesión se eliminan todas las preferencias guardadas
- **Seguridad**: Las credenciales nunca se almacenan, solo tokens de sesión seguros de Supabase

## Archivos Modificados/Creados

### Nuevos Archivos:
- `src/hooks/useAuth.ts` - Hook personalizado para manejo de autenticación
- `src/hooks/useSignOut.ts` - Hook para cerrar sesión con limpieza completa
- `src/components/AuthRedirect.tsx` - Componente para redirección automática
- `src/components/WelcomeBack.tsx` - Componente de bienvenida animado

### Archivos Modificados:
- `src/lib/supabase.ts` - Configuración mejorada de persistencia de sesión
- `src/app/[locale]/auth/login/page.tsx` - Implementación de "Recordarme"
- `src/app/[locale]/auth/register/page.tsx` - Verificación de autenticación
- `src/app/[locale]/page.tsx` - Redirección automática en página principal
- `src/middleware.ts` - Manejo mejorado de sesiones en middleware
- `src/store/auth.ts` - Store actualizado con nuevas funcionalidades
- `src/app/globals.css` - Estilos para animaciones

## Cómo Funciona

### 1. **Flujo de Login con "Recordarme"**
```
Usuario accede a /login
↓
Completa credenciales + marca "Recordarme"
↓
Sistema autentica y configura persistencia
↓
Guarda email y preferencia en localStorage
↓
Redirige a dashboard
```

### 2. **Flujo de Acceso Posterior**
```
Usuario accede a cualquier página
↓
useAuth hook verifica sesión automáticamente
↓
Si hay sesión activa → Redirección automática a dashboard
↓
Si no hay sesión → Permite acceso normal
```

### 3. **Flujo de Cierre de Sesión**
```
Usuario hace logout
↓
useSignOut limpia tokens de Supabase
↓
Elimina datos guardados en localStorage
↓
Redirige a login
```

## Datos Almacenados

En `localStorage` se guardan:
- `supabase.auth.remember-me`: 'true'/'false' - Preferencia del usuario
- `supabase.auth.last-email`: email del usuario (solo si marcó recordarme)

**Nota de Seguridad**: Solo se almacenan preferencias de UX, nunca contraseñas o datos sensibles.

## Beneficios para el Usuario

1. **Conveniencia**: No necesidad de reintroducir credenciales constantemente
2. **Eficiencia**: Acceso directo al dashboard desde cualquier punto de entrada
3. **Experiencia personalizada**: Mensajes de bienvenida para usuarios recurrentes
4. **Control**: El usuario decide si quiere que se recuerde su sesión

## Configuración de Supabase

La implementación utiliza las capacidades nativas de Supabase para:
- Gestión segura de tokens de sesión
- Renovación automática de tokens expirados
- Almacenamiento seguro en localStorage/sessionStorage según preferencia

## Compatibilidad

- ✅ Compatible con todos los navegadores modernos
- ✅ Funciona en dispositivos móviles y escritorio
- ✅ Respeta las configuraciones de privacidad del navegador
- ✅ Se integra con el sistema de internacionalización existente (ES/EN)

## Testing

Para probar la funcionalidad:

1. **Login con "Recordarme" marcado**:
   - Hacer login marcando el checkbox
   - Cerrar navegador
   - Abrir navegador y acceder a la página principal
   - Verificar redirección automática

2. **Login sin "Recordarme"**:
   - Hacer login sin marcar el checkbox
   - Cerrar navegador
   - Abrir navegador y acceder a la página principal
   - Verificar que requiere login nuevo

3. **Logout completo**:
   - Hacer logout
   - Verificar que se eliminan las preferencias
   - Verificar redirección a login

La funcionalidad está completamente implementada y lista para uso en producción.
