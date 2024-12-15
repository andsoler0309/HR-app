import './../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';

export const dynamic = 'force-dynamic';

// Add metadata configuration
export const metadata = {
  title: {
    default: 'PEOPLER',
    template: '%s | Your Site Name'
  },
  icons: {
    icon: '/logo.svg', // This will look for icon.png in the public folder
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  }
}

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
      <body className="bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}