// src/lib/metadata.ts
import { Metadata } from 'next'

const defaultMetadata = {
  title: 'NodoHR - Human Resources Management System',
  description: 'Complete HR management solution for modern businesses. Manage employees, time off, documents, and more.',
  applicationName: 'NodoHR',
  authors: [{ name: 'NodoHR' }],
  keywords: [
    'HR software',
    'HR management',
    'employee management',
    'time off tracking',
    'human resources',
    'personnel management',
    'HR analytics',
    'workforce management'
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
  ogImage: 'https://nodohr.com/logo.svg',
  description: defaultMetadata.description,
  links: {
    twitter: 'https://twitter.com/nodohr',
    github: 'https://github.com/nodohr',
  },
}

export function constructMetadata({
  title = defaultMetadata.title,
  description = defaultMetadata.description,
  image = siteConfig.ogImage,
  icons = '/logo.svg',
  noIndex = false,
  locale = 'en',
  alternateLanguages = true,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  locale?: string
  alternateLanguages?: boolean
} = {}): Metadata {
  
  const canonical = locale === 'en' 
    ? siteConfig.url 
    : `${siteConfig.url}/${locale}`;

  const alternates = alternateLanguages ? {
    canonical,
    languages: {
      'en': siteConfig.url,
      'es': `${siteConfig.url}/es`,
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