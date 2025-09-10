import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Calendar,
  FileText,
  PieChart,
  CheckSquare,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import AnimatedHero from "@/components/landing/AnimatedHero";
import AnimatedPymeSection from "@/components/landing/AnimatedPymeSection";
import AnimatedFeaturesSection from "@/components/landing/AnimatedFeaturesSection";
import AnimatedTestimonialsSection from "@/components/landing/AnimatedTestimonialsSection";
import AnimatedPricingSection from "@/components/landing/AnimatedPricingSection";
import AnimatedFAQSection from "@/components/landing/AnimatedFAQSection";
import AnimatedFinalCTA from "@/components/landing/AnimatedFinalCTA";

interface LandingPageProps {
  params: {
    locale: string;
  };
}

export default function LandingPage({ params: { locale } }: LandingPageProps) {
  const t = useTranslations("landing");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-card/70 backdrop-blur-sm z-50 border-b border-navbar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-lg sm:text-xl font-bold text-primary tracking-tight">
            NodoHR
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* SEO-friendly language selector */}
            <div className="relative group">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-md transition-colors border border-card-border cursor-pointer">
                <span className="text-lg">
                  {locale === 'es' ? '🇪🇸' : '🇺🇸'}
                </span>
                <span className="hidden sm:block">
                  {locale === 'es' ? 'Español' : 'English'}
                </span>
                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg ring-1 ring-card-border border border-card-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    href="/es"
                    className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      locale === 'es' ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="text-lg">🇪🇸</span>
                    <span>Español</span>
                    {locale === 'es' && (
                      <svg className="h-4 w-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Link>
                  <Link
                    href="/en"
                    className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      locale === 'en' ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                    {locale === 'en' && (
                      <svg className="h-4 w-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center justify-center px-3 sm:px-5 py-2 border border-primary text-primary bg-background font-semibold rounded-lg text-sm sm:text-base hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-none"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex items-center justify-center px-3 sm:px-6 py-2 bg-primary text-white font-bold rounded-lg text-sm sm:text-base shadow-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="hidden sm:inline">{t("tryFree")}</span>
                <span className="sm:hidden">{t("tryFree")}</span>
                <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <AnimatedHero locale={locale} />

      {/* PYME Value Proposition Section */}
      <AnimatedPymeSection />

      {/* Key Features Section */}
      <AnimatedFeaturesSection />

      {/* Why Choose NodoHR Section */}
      <section className="py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t("whyChooseTitle")}
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-text-muted text-lg">
              {t("whyChooseSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t("benefit1Title")}</h3>
                  <p className="text-text-muted">{t("benefit1Desc")}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t("benefit2Title")}</h3>
                  <p className="text-text-muted">{t("benefit2Desc")}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t("benefit3Title")}</h3>
                  <p className="text-text-muted">{t("benefit3Desc")}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t("benefit4Title")}</h3>
                  <p className="text-text-muted">{t("benefit4Desc")}</p>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <h4 className="text-xl font-semibold text-foreground mb-4">{t("competitionTitle")}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t("traditionalSolutions")}</span>
                    <span className="text-destructive">❌</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t("complexSoftware")}</span>
                    <span className="text-destructive">❌</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">{t("expensiveSolutions")}</span>
                    <span className="text-destructive">❌</span>
                  </div>
                  <hr className="border-primary/20" />
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">NodoHR</span>
                    <span className="text-success">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <AnimatedTestimonialsSection />

      {/* Pricing */}
      <AnimatedPricingSection locale={locale} />

      {/* FAQ Section */}
      <AnimatedFAQSection />

      {/* Final CTA */}
      <AnimatedFinalCTA locale={locale} />

      {/* Footer */}
      <footer className="bg-card border-t border-navbar-border">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <h1 className="text-xl font-bold text-primary">NodoHR</h1>
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.instagram.com/nodohr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-primary transition-colors duration-200"
                  aria-label="Síguenos en Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.017 0C8.396 0 7.852.025 6.684.072 5.517.119 4.672.278 3.927.598a5.938 5.938 0 0 0-2.148 1.39A5.938 5.938 0 0 0 .389 4.115C.069 4.86-.09 5.705-.137 6.872-.184 8.04-.209 8.584-.209 12.205s.025 4.165.072 5.333c.047 1.167.206 2.012.526 2.757a5.938 5.938 0 0 0 1.39 2.148 5.938 5.938 0 0 0 2.178 1.39c.745.32 1.59.479 2.757.526 1.168.047 1.712.072 5.333.072s4.165-.025 5.333-.072c1.167-.047 2.012-.206 2.757-.526a5.938 5.938 0 0 0 2.148-1.39 5.938 5.938 0 0 0 1.39-2.148c.32-.745.479-1.59.526-2.757.047-1.168.072-1.712.072-5.333s-.025-4.165-.072-5.333c-.047-1.167-.206-2.012-.526-2.757a5.938 5.938 0 0 0-1.39-2.148A5.938 5.938 0 0 0 19.882.598C19.137.278 18.292.119 17.125.072 15.957.025 15.413 0 11.792 0h.225zm-.092 1.982c3.55 0 3.97.016 5.378.061 1.298.059 2.003.275 2.472.457.621.242 1.064.531 1.53.997.466.466.755.909.997 1.53.182.469.398 1.174.457 2.472.045 1.408.061 1.828.061 5.378s-.016 3.97-.061 5.378c-.059 1.298-.275 2.003-.457 2.472-.242.621-.531 1.064-.997 1.53-.466.466-.909.755-1.53.997-.469.182-1.174.398-2.472.457-1.408.045-1.828.061-5.378.061s-3.97-.016-5.378-.061c-1.298-.059-2.003-.275-2.472-.457-.621-.242-1.064-.531-1.53-.997-.466-.466-.755-.909-.997-1.53-.182-.469-.398-1.174-.457-2.472-.045-1.408-.061-1.828-.061-5.378s.016-3.97.061-5.378c.059-1.298.275-2.003.457-2.472.242-.621.531-1.064.997-1.53.466-.466.909-.755 1.53-.997.469-.182 1.174-.398 2.472-.457 1.408-.045 1.828-.061 5.378-.061z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" clipRule="evenodd" />
                  </svg>
                </a>
                
                <a
                  href="https://www.facebook.com/nodohr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-primary transition-colors duration-200"
                  aria-label="Síguenos en Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <p className="text-text-muted mt-4 sm:mt-0 text-sm">
              © {new Date().getFullYear()} NodoHR. {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}