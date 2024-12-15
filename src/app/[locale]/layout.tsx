import './../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import { constructMetadata } from '@/lib/metadata'
import SchemaOrg from '@/components/SchemaOrg'

export const metadata = constructMetadata()

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const dynamic = 'force-dynamic';


export async function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'es'}];
}

export default async function RootLayout({
  children, 
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string}
}) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <SchemaOrg />
      </head>
      <body className="bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}