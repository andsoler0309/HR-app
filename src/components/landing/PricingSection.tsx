"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { CheckSquare, Sparkles, Crown } from "lucide-react";

interface PricingSectionProps {
  locale: string;
}

export default function PricingSection({ locale }: PricingSectionProps) {
  const t = useTranslations("landing");

  const plans = [
    {
      name: t("freePlan"),
      description: t("freePlanDesc"),
      price: t("free"),
      isPopular: false,
      features: [
        t("max1Employee"),
        t("upTo2Documents"),
        t("basicFunctions")
      ],
      cta: t("tryFree"),
      icon: Sparkles
    },
    {
      name: t("premiumPlan"),
      description: t("premiumPlanDesc"),
      price: t("premiumPrice"),
      period: t("perMonth"),
      isPopular: true,
      features: [
        t("unlimitedEmployees"),
        t("completeDocsMgmt"),
        t("advancedVacations")
      ],
      cta: t("startFreeTrial"),
      icon: Crown
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 bg-gradient-to-br from-rich-black via-card/5 to-rich-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-sunset/5 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
            {t("pricingTitle")}
          </h3>
          <p className="text-text-muted max-w-xl mx-auto text-lg">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group ${plan.isPopular ? 'transform scale-105' : ''}`}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-primary to-sunset text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✨ Popular
                  </div>
                </div>
              )}

              <div
                className={`bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border overflow-hidden flex flex-col h-full relative ${
                  plan.isPopular 
                    ? 'border-primary/50 shadow-xl ring-2 ring-primary/20' 
                    : 'border-card-border hover:border-primary/30'
                } transition-all duration-300`}
              >
                {/* Gradient overlay for popular plan */}
                {plan.isPopular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sunset/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="px-6 py-8 flex flex-col h-full relative z-10">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            plan.isPopular 
                              ? 'bg-gradient-to-br from-primary/20 to-sunset/20' 
                              : 'bg-primary/10'
                          }`}
                        >
                          <plan.icon className={`h-6 w-6 ${
                            plan.isPopular ? 'text-primary' : 'text-primary'
                          }`} />
                        </div>
                        <h4 className="text-xl font-semibold text-foreground">
                          {plan.name}
                        </h4>
                      </div>
                      
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            plan.isPopular ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {plan.price}
                        </p>
                        {plan.period && (
                          <p className="text-text-muted text-sm">{plan.period}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-grow mb-6">
                    <ul className="space-y-3 text-text-muted">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <CheckSquare className="h-5 w-5 text-success flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Link
                      href={`/${locale}/auth/register`}
                      className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-primary to-sunset text-white shadow-lg hover:shadow-xl'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
