import { redirect } from 'next/navigation'
import { constructMetadata } from '@/lib/metadata'

export const metadata = constructMetadata({
  title: 'NodoHR - Sistema de Gestión de Recursos Humanos',
  description: 'Solución completa de gestión de RRHH para empresas modernas. Gestiona empleados, vacaciones, documentos y más.',
  locale: 'es',
  alternateLanguages: true,
})

export default function RootPage() {
  // Redirect to default locale (Spanish for Colombian market)
  redirect('/es')
}
