import Link from 'next/link'
import { ArrowRight, Users, Calendar, FileText, PieChart, CheckSquare, Briefcase, ClipboardList } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-card/70 backdrop-blur-sm z-50 border-b border-navbar-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary tracking-tight">PEOPLER</h1>
          <Link 
            href="/auth/register"
            className="inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md text-black bg-primary hover:bg-primary transition-colors"
          >
            Prueba Gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-28 pb-20 px-6 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-16">
          Simplifica la Gestión de tu Talento con
          <span className="block text-sunset mt-2">PEOPLER</span>
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
          Una solución integral de RRHH para gestionar empleados, tiempo, nómina, vacaciones y documentación desde un solo lugar. Diseñado para empresas en crecimiento.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-black bg-primary hover:bg-primary transition-colors"
          >
            Comenzar Prueba Gratis
          </Link>
        </div>
      </header>

      {/* Key Features Section */}
      <section className="bg-rich-black py-12 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Características Fundamentales
          </h3>
          <p className="mt-4 max-w-3xl mx-auto text-text-muted leading-relaxed">
            Centraliza y optimiza la administración de tu equipo con un conjunto completo de herramientas adaptadas al contexto colombiano.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Gestión básica de empleados */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Gestión Básica de Empleados</h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Almacenamiento de información personal y laboral</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Registro de documentos importantes (contratos, certificaciones)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Dashboard simple con conteo de empleados activos/inactivos</span>
              </li>
            </ul>
          </div>

          {/* Asistencia y tiempo */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Asistencia y Tiempo</h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Registro manual de entradas/salidas</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Calendario integrado de días festivos colombianos</span>
              </li>
            </ul>
          </div>

          {/* Nómina básica */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Nómina Básica</h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Cálculo de salario base</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Gestión de deducciones obligatorias (salud, pensión)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Generación de colillas de pago simples</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Soporte para el sistema de seguridad social colombiano</span>
              </li>
            </ul>
          </div>

          {/* Vacaciones */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Vacaciones</h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Solicitud y aprobación de vacaciones</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Cálculo automático de días disponibles</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Calendario de ausencias del equipo</span>
              </li>
            </ul>
          </div>

          {/* Documentación */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Documentación</h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Plantillas básicas de documentos laborales comunes</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Almacenamiento seguro de documentación</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>Función de firma electrónica simple</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Lo Que Dicen Nuestros Clientes
          </h3>
          <p className="mt-4 max-w-3xl mx-auto text-text-muted leading-relaxed">
            PEOPLER impulsa la eficiencia y la satisfacción del equipo en cientos de empresas.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <p className="text-text-muted italic">
              "Gracias a PEOPLER, nuestra gestión de empleados es más transparente y ordenada. Ahorramos tiempo y mejoramos la experiencia interna."
            </p>
            <div className="mt-4 text-foreground font-semibold">— Ana, Gerente de Operaciones</div>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <p className="text-text-muted italic">
              "La integración con el sistema colombiano de seguridad social y la facilidad para manejar vacaciones nos ha hecho la vida mucho más simple."
            </p>
            <div className="mt-4 text-foreground font-semibold">— Juan, Director de RRHH</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 sm:px-8 bg-rich-black">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">Precios Claros y Justos</h3>
          <p className="mt-4 text-text-muted max-w-xl mx-auto">
            Sin costos ocultos. Cancela en cualquier momento.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
          {/* Free Plan */}
          <div className="bg-card rounded-lg shadow-lg border border-card-border overflow-hidden flex flex-col">
            <div className="px-6 py-8 flex flex-col h-full">
              <div>
                <h4 className="text-xl font-semibold text-foreground">Plan Gratuito</h4>
                <p className="mt-2 text-text-muted">Para pequeñas operaciones o prueba inicial</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <p className="text-2xl font-bold text-foreground">GRATIS</p>
                </div>
                <ul className="mt-8 space-y-4 text-text-muted">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>1 empleado máximo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>Hasta 2 documentos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>Funciones básicas</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Link
                  href="/auth/register"
                  className="block w-full bg-primary text-black text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
                >
                  Probar Gratis
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-card rounded-lg shadow-lg border border-card-border overflow-hidden flex flex-col">
            <div className="px-6 py-8 flex flex-col h-full">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">Plan Premium</h4>
                    <p className="mt-2 text-text-muted">Todo lo que necesitas para la gestión de RRHH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">$20,000 COP</p>
                    <p className="text-text-muted">/mes</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-4 text-text-muted">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>Empleados ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>Gestión completa de documentos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>Gestión avanzada de vacaciones</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Link
                  href="/auth/register"
                  className="block w-full bg-primary text-black text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
                >
                  Comenzar Prueba Gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 sm:px-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">¿Listo para Optimizar tu RRHH?</h3>
        <p className="mt-4 text-text-muted max-w-xl mx-auto leading-relaxed">
          Comienza con una prueba gratuita y descubre cómo PEOPLER puede transformar la forma en que gestionas tu equipo.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-black bg-primary hover:bg-primary transition-colors"
          >
            Registrarme Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-navbar-border">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-primary">PEOPLER</h1>
          <p className="text-text-muted mt-4 sm:mt-0 text-sm">
            © 2024 PEOPLER. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
