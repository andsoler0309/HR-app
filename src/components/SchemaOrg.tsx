export default function SchemaOrg() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NodoHR",
    "alternateName": "NodoHR System",
    "url": "https://nodohr.com",
    "logo": "https://nodohr.com/logo.svg",
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
    "name": "NodoHR",
    "author": {
      "@type": "Organization",
      "name": "NodoHR"
    },
    "url": "https://nodohr.com",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, payroll, and more.",
    "publisher": {
      "@type": "Organization",
      "name": "NodoHR"
    }
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NodoHR",
    "alternateName": "NODO",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://nodohr.com",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, payroll, and more.",
    "creator": {
      "@type": "Organization",
      "name": "NodoHR"
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
    "screenshot": "https://nodohr.com/logo.svg",
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