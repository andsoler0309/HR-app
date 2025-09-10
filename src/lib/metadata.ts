// src/lib/metadata.ts
import { Metadata } from 'next'

const defaultMetadata = {
  title: 'NodoHR - Sistema de Gestión de Recursos Humanos',
  description: 'Solución completa de gestión de RRHH para empresas modernas. Gestiona empleados, vacaciones, documentos y más.',
  applicationName: 'NodoHR',
  authors: [{ name: 'NodoHR' }],
  keywords: [
    'software RRHH',
    'gestión recursos humanos',
    'gestión empleados',
    'seguimiento vacaciones',
    'recursos humanos',
    'gestión personal',
    'analíticas RRHH',
    'gestión fuerza laboral',
    'HR software',
    'HR management',
    'employee management',
    'time off tracking'
  ],
  creator: 'NodoHR',
  publisher: 'NodoHR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const siteConfig = {
  name: 'NodoHR',
  url: 'https://nodohr.com',
  ogImage: 'https://nodohr.com/nodo-logo.png',
  description: defaultMetadata.description,
  links: {
    twitter: 'https://twitter.com/nodohr',
    github: 'https://github.com/nodohr',
    instagram: 'https://www.instagram.com/nodohr',
    facebook: 'https://www.facebook.com/profile.php?id=61580547090254'
  },
}

export function constructMetadata({
  title = defaultMetadata.title,
  description = defaultMetadata.description,
  image = siteConfig.ogImage,
  icons = {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/nodo-logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/nodo-logo.png', type: 'image/png', sizes: '192x192' }
    ],
    apple: '/nodo-logo.png',
    shortcut: '/nodo-logo.png'
  },
  noIndex = false,
  locale = 'es',
  alternateLanguages = true,
}: {
  title?: string
  description?: string
  image?: string
  icons?: any
  noIndex?: boolean
  locale?: string
  alternateLanguages?: boolean
} = {}): Metadata {
  
  const canonical = locale === 'es' 
    ? siteConfig.url 
    : `${siteConfig.url}/${locale}`;

  const alternates = alternateLanguages ? {
    canonical,
    languages: {
      'es': siteConfig.url,
      'en': `${siteConfig.url}/en`,
      'x-default': siteConfig.url,
    }
  } : undefined;

  return {
    ...defaultMetadata,
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@nodohr',
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}