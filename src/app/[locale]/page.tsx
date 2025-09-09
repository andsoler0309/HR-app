"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const t = useTranslations("landing");
  const params = useParams() as { locale: string };
  const router = useRouter();
  const locale = params.locale;

  const switchToEnglish = () => {
    const currentPath = window.location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    segments[0] = "en";
    router.push("/" + segments.join("/"));
  };

  const switchToSpanish = () => {
    const currentPath = window.location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    segments[0] = "es";
    router.push("/" + segments.join("/"));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-card/70 backdrop-blur-sm z-50 border-b border-navbar-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
                    <Link href={`/${locale}`} className="text-xl font-bold text-primary tracking-tight">
            NodoHR
          </Link>

          <div className="flex space-x-4">
            <LanguageSwitcher
              locale={locale}
              onSwitchToEnglish={switchToEnglish}
              onSwitchToSpanish={switchToSpanish}
            />

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center justify-center px-5 py-2 min-w-[120px] border border-primary text-primary bg-background font-semibold rounded-lg text-base hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-none"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex items-center justify-center px-6 py-2 min-w-[160px] bg-primary text-black font-bold rounded-lg text-base shadow-lg hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {t("tryFree")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-28 pb-20 px-6 sm:px-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-16">
          {t("heroTitle")}
          <span className="block text-sunset mt-2">NodoHR</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/auth/register`}
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-black bg-primary hover:bg-primary transition-colors"
          >
            {t("tryFree")}
          </Link>
        </div>
      </header>

      {/* Key Features Section */}
      <section className="bg-rich-black py-12 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {t("fundamentalFeatures")}
          </h3>
          <p className="mt-4 max-w-3xl mx-auto text-text-muted leading-relaxed">
            {t("centralizeOptimize")}
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Basic Employee Management */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">
                {t("basicEmployeeMgmt")}
              </h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("personalInfoStorage")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("importantDocsRegistry")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("simpleDashboard")}</span>
              </li>
            </ul>
          </div>

          {/* Attendance and Time */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">
                {t("manualAttendance")}
              </h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("manualEntryRegistry")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("employeePortal")}</span>
              </li>
            </ul>
          </div>

          {/* Basic Payroll */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">
                {t("basicPayroll")}
              </h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("baseSalaryCalc")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("mandatoryDeductions")}</span>
              </li>
              {/* <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("simplePayslips")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("socialSecuritySupport")}</span>
              </li> */}
            </ul>
          </div>

          {/* Vacations */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">
                {t("vacations")}
              </h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("vacationRequest")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("automaticDaysCalc")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("teamAbsenceCalendar")}</span>
              </li>
            </ul>
          </div>

          {/* Documentation */}
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <div className="flex items-center space-x-3 mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">
                {t("documentation")}
              </h4>
            </div>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("basicTemplates")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("secureStorage")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckSquare className="h-5 w-5 text-success mt-0.5" />
                <span>{t("electronicSignature")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {t("testimonialsTitle")}
          </h3>
          <p className="mt-4 max-w-3xl mx-auto text-text-muted leading-relaxed">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <p className="text-text-muted italic">{t("anaQuote")}</p>
            <div className="mt-4 text-foreground font-semibold">
              — Ana, {t("operationsManager")}
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md border border-card-border">
            <p className="text-text-muted italic">{t("juanQuote")}</p>
            <div className="mt-4 text-foreground font-semibold">
              — Juan, {t("hrDirector")}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 sm:px-8 bg-rich-black">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {t("pricingTitle")}
          </h3>
          <p className="mt-4 text-text-muted max-w-xl mx-auto">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
          {/* Free Plan */}
          <div className="bg-card rounded-lg shadow-lg border border-card-border overflow-hidden flex flex-col">
            <div className="px-6 py-8 flex flex-col h-full">
              <div>
                <h4 className="text-xl font-semibold text-foreground">
                  {t("freePlan")}
                </h4>
                <p className="mt-2 text-text-muted">{t("freePlanDesc")}</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <p className="text-2xl font-bold text-foreground">{t("free")}</p>
                </div>
                <ul className="mt-8 space-y-4 text-text-muted">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("max1Employee")}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("upTo2Documents")}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("basicFunctions")}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Link
                  href={`/${locale}/auth/register`}
                  className="block w-full bg-primary text-black text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
                >
                  {t("tryFree")}
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
                    <h4 className="text-xl font-semibold text-foreground">
                      {t("premiumPlan")}
                    </h4>
                    <p className="mt-2 text-text-muted">
                      {t("premiumPlanDesc")}
                    </p>
                    </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {t("premiumPrice")}
                    </p>
                    <p className="text-text-muted">{t("perMonth")}</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-4 text-text-muted">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("unlimitedEmployees")}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("completeDocsMgmt")}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-success" />
                    <span>{t("advancedVacations")}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Link
                  href={`/${locale}/auth/register`}
                  className="block w-full bg-primary text-black text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
                >
                  {t("startFreeTrial")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 sm:px-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          {t("readyToOptimize")}
        </h3>
        <p className="mt-4 text-text-muted max-w-xl mx-auto leading-relaxed">
          {t("getStartedFree")}
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/auth/register`}
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-black bg-primary hover:bg-primary transition-colors"
          >
            {t("signUpNow")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-navbar-border">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-primary">NodoHR</h1>
          <p className="text-text-muted mt-4 sm:mt-0 text-sm">
            © {new Date().getFullYear()} NodoHR. {t("allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}