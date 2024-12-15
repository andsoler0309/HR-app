export default function SchemaOrg() {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PeoplerHR",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "20000",
              "priceCurrency": "COP",
              "priceValidUntil": "2024-12-31"
            },
            "description": "Complete HR management solution for modern businesses.",
          }),
        }}
      />
    )
  }