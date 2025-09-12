import '@/app/globals.css'
import { Analytics } from "@vercel/analytics/next"
import { constructMetadata } from '@/lib/metadata'

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}