export default function SchemaOrg() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PeoplerHR",
    "alternateName": "PEOPLER",
    "url": "https://www.peoplerhr.com",
    "logo": "https://www.peoplerhr.com/logo.svg",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, and more.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@peoplerhr.com"
    },
    "sameAs": [
      "https://twitter.com/peoplerhr",
      "https://github.com/peoplerhr"
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PeoplerHR",
    "alternateName": "PEOPLER",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.peoplerhr.com",
    "description": "Complete HR management solution for modern businesses. Manage employees, time off, documents, payroll, and more.",
    "creator": {
      "@type": "Organization",
      "name": "PeoplerHR"
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
    "screenshot": "https://www.peoplerhr.com/logo.svg",
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