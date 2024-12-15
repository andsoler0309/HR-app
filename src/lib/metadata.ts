// src/lib/metadata.ts
import { Metadata } from 'next'

const defaultMetadata = {
  title: 'PeoplerHR - Human Resources Management System',
  description: 'Complete HR management solution for modern businesses. Manage employees, time off, documents, and more.',
  applicationName: 'PeoplerHR',
  authors: [{ name: 'PeoplerHR' }],
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
  creator: 'PeoplerHR',
  publisher: 'PeoplerHR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const siteConfig = {
  name: 'PeoplerHR',
  url: 'https://www.peoplerhr.com',
  ogImage: 'https://www.peoplerhr.com/og-image.jpg',
  description: defaultMetadata.description,
  links: {
    twitter: 'https://twitter.com/peoplerhr',
    github: 'https://github.com/peoplerhr',
  },
}

export function constructMetadata({
  title = defaultMetadata.title,
  description = defaultMetadata.description,
  image = siteConfig.ogImage,
  icons = '/logo.svg',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    ...defaultMetadata,
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@peoplerhr',
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