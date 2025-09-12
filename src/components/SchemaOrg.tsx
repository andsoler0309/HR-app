export default function SchemaOrg() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nodo",
    "alternateName": "Nodo System",
    "url": "https://nodohr.com",
    "logo": "https://nodohr.com/nodo-logo.png",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, and more.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@nodohr.com"
    },
    "sameAs": [
      "https://twitter.com/nodohr",
      "https://github.com/nodohr"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nodo",
    "author": {
      "@type": "Organization",
      "name": "Nodo"
    },
    "url": "https://nodohr.com",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, payroll, and more.",
    "publisher": {
      "@type": "Organization",
      "name": "Nodo"
    }
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nodo",
    "alternateName": "NODO",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nodohr.com",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, payroll, and more.",
    "creator": {
      "@type": "Organization",
      "name": "Nodo"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Up to 1 employee, basic features"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan", 
        "price": "20000",
        "priceCurrency": "COP",
        "priceValidUntil": "2025-12-31",
        "description": "Unlimited employees, complete HR management"
      }
    ],
    "featureList": [
      "Employee Management",
      "Time Off Tracking", 
      "Document Management",
      "Payroll Processing",
      "HR Analytics",
      "Multi-language Support"
    ],
    "screenshot": "https://nodohr.com/nodo-logo.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
    </>
  )
}