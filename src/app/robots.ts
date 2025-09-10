import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/*',
          '/api/*',
          '/dashboard/*',
          '/onboarding/*',
          '/portal/*',
        ],
      },
    ],
    sitemap: 'https://nodohr.com/sitemap.xml',
  }
}
