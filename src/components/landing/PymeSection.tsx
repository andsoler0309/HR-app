"use client";

import { useTranslations } from "next-intl";
import { Users, PieChart, CheckSquare } from "lucide-react";

export default function PymeSection() {
  const t = useTranslations("landing");

  return (
    <section className="py-16 px-6 sm:px-8 bg-gradient-to-br from-card/30 via-card/50 to-card/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-sunset/5 rounded-full blur-2xl opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
            {t("pymeTitle")}
          </h2>
          <p className="max-w-3xl mx-auto text-text-muted text-lg leading-relaxed">
            {t("pymeSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center group">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint1Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint1Desc")}
            </p>
          </div>
          
          <div className="text-center group">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <PieChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint2Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint2Desc")}
            </p>
          </div>
          
          <div className="text-center group">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint3Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint3Desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
