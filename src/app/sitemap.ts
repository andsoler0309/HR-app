// src/app/sitemap.ts
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.peoplerhr.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://www.peoplerhr.com/dashboard',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.peoplerhr.com/dashboard/employees',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Add other important routes
  ]
}