import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const manifest = {
    name: 'Nodo - Sistema de Gestión de Recursos Humanos',
    short_name: 'Nodo',
    description: 'Solución completa de gestión de RRHH para empresas modernas. Gestiona empleados, vacaciones, documentos y más.',
    start_url: '/es/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/nodo-logo.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/nodo-logo.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/nodo-logo.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}
