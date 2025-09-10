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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-lg sm:text-xl font-bold text-primary tracking-tight">
            NodoHR
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher
              locale={locale}
              onSwitchToEnglish={switchToEnglish}
              onSwitchToSpanish={switchToSpanish}
            />

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
      <header className="pt-28 pb-20 px-6 sm:px-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-16">
          {t("heroTitle")}
          <span className="block text-sunset mt-2">NodoHR</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
          {t("heroSubtitle")}
        </p>
        
        {/* Value highlights */}
        {/*<div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">*/}
        {/*  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">*/}
        {/*    ✅ {t("heroHighlight1")}*/}
        {/*  </span>*/}
        {/*  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">*/}
        {/*    ✅ {t("heroHighlight2")}*/}
        {/*  </span>*/}
        {/*  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">*/}
        {/*    ✅ {t("heroHighlight3")}*/}
        {/*  </span>*/}
        {/*</div>*/}

        <div className="mt-8">
          <Link
            href={`/${locale}/auth/register`}
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-white bg-primary hover:bg-primary transition-colors"
          >
            {t("tryFree")}
          </Link>
          <p className="mt-2 text-sm text-text-muted">{t("heroSubCta")}</p>
        </div>
      </header>

      {/* Social Proof Statistics */}
      {/*<section className="py-12 px-6 sm:px-8 bg-card/30">*/}
      {/*  <div className="max-w-6xl mx-auto">*/}
      {/*    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">*/}
      {/*      <div>*/}
      {/*        <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>*/}
      {/*        <div className="text-sm text-text-muted mt-1">{t("companiesTrust")}</div>*/}
      {/*      </div>*/}
      {/*      <div>*/}
      {/*        <div className="text-2xl sm:text-3xl font-bold text-primary">10k+</div>*/}
      {/*        <div className="text-sm text-text-muted mt-1">{t("employeesManaged")}</div>*/}
      {/*      </div>*/}
      {/*      <div>*/}
      {/*        <div className="text-2xl sm:text-3xl font-bold text-primary">15 min</div>*/}
      {/*        <div className="text-sm text-text-muted mt-1">{t("averageSetup")}</div>*/}
      {/*      </div>*/}
      {/*      <div>*/}
      {/*        <div className="text-2xl sm:text-3xl font-bold text-primary">99.9%</div>*/}
      {/*        <div className="text-sm text-text-muted mt-1">{t("uptime")}</div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* PYME Value Proposition Section */}
      <section className="py-16 px-6 sm:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t("pymeTitle")}
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-text-muted text-lg leading-relaxed">
              {t("pymeSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("pymePoint1Title")}</h3>
              <p className="text-text-muted">{t("pymePoint1Desc")}</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("pymePoint2Title")}</h3>
              <p className="text-text-muted">{t("pymePoint2Desc")}</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("pymePoint3Title")}</h3>
              <p className="text-text-muted">{t("pymePoint3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

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
                  className="block w-full bg-primary text-white text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
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
                  className="block w-full bg-primary text-white text-center px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors"
                >
                  {t("startFreeTrial")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 sm:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {t("faqTitle")}
            </h2>
            <p className="mt-4 text-text-muted text-lg">
              {t("faqSubtitle")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("faq1Question")}</h3>
              <p className="text-text-muted">{t("faq1Answer")}</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("faq2Question")}</h3>
              <p className="text-text-muted">{t("faq2Answer")}</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("faq3Question")}</h3>
              <p className="text-text-muted">{t("faq3Answer")}</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("faq4Question")}</h3>
              <p className="text-text-muted">{t("faq4Answer")}</p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("faq5Question")}</h3>
              <p className="text-text-muted">{t("faq5Answer")}</p>
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
            className="inline-flex items-center px-6 py-3 border border-black text-base font-medium rounded-md text-white bg-primary hover:bg-primary transition-colors"
          >
            {t("signUpNow")}
          </Link>
        </div>
      </section>

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