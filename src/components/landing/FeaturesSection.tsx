"use client";

import { useTranslations } from "next-intl";
import {
  Users,
  Calendar,
  FileText,
  CheckSquare,
  Briefcase,
  ClipboardList,
} from "lucide-react";

export default function FeaturesSection() {
  const t = useTranslations("landing");

  const features = [
    {
      icon: Users,
      title: t("basicEmployeeMgmt"),
      items: [
        t("personalInfoStorage"),
        t("importantDocsRegistry"),
        t("simpleDashboard")
      ]
    },
    {
      icon: Calendar,
      title: t("manualAttendance"),
      items: [
        t("manualEntryRegistry"),
        t("employeePortal")
      ]
    },
    {
      icon: Briefcase,
      title: t("basicPayroll"),
      items: [
        t("baseSalaryCalc"),
        t("mandatoryDeductions")
      ]
    },
    {
      icon: FileText,
      title: t("vacations"),
      items: [
        t("vacationRequest"),
        t("automaticDaysCalc"),
        t("teamAbsenceCalendar")
      ]
    },
    {
      icon: ClipboardList,
      title: t("documentation"),
      items: [
        t("basicTemplates"),
        t("secureStorage"),
        t("electronicSignature")
      ]
    }
  ];

  return (
    <section className="bg-gradient-to-br from-rich-black via-rich-black to-card/10 py-16 px-6 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-sunset/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
            {t("fundamentalFeatures")}
          </h3>
          <p className="max-w-3xl mx-auto text-text-muted leading-relaxed text-lg">
            {t("centralizeOptimize")}
          </p>
        </div>

        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-card-border group hover:shadow-xl transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h4>
              </div>
              
              <ul className="space-y-3 text-text-muted">
                {feature.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start space-x-2"
                  >
                    <CheckSquare className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
