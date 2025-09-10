"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { CheckSquare, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedPricingSectionProps {
  locale: string;
}

export default function AnimatedPricingSection({ locale }: AnimatedPricingSectionProps) {
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
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-sunset/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("pricingTitle")}
          </motion.h3>
          <motion.p
            className="text-text-muted max-w-xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("pricingSubtitle")}
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative group ${plan.isPopular ? 'transform scale-105' : ''}`}
              initial={{ opacity: 0, y: 50, rotateY: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -10,
                scale: plan.isPopular ? 1.05 : 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="bg-gradient-to-r from-primary to-sunset text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✨ Popular
                  </div>
                </motion.div>
              )}

              <motion.div
                className={`bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border overflow-hidden flex flex-col h-full relative ${
                  plan.isPopular 
                    ? 'border-primary/50 shadow-xl ring-2 ring-primary/20' 
                    : 'border-card-border hover:border-primary/30'
                } transition-all duration-300`}
                whileHover={{
                  boxShadow: plan.isPopular 
                    ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)" 
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
              >
                {/* Gradient overlay for popular plan */}
                {plan.isPopular && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sunset/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                )}

                <div className="px-6 py-8 flex flex-col h-full relative z-10">
                  {/* Header */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className={`p-2 rounded-lg ${
                            plan.isPopular 
                              ? 'bg-gradient-to-br from-primary/20 to-sunset/20' 
                              : 'bg-primary/10'
                          }`}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: 360,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <plan.icon className={`h-6 w-6 ${
                            plan.isPopular ? 'text-primary' : 'text-primary'
                          }`} />
                        </motion.div>
                        <h4 className="text-xl font-semibold text-foreground">
                          {plan.name}
                        </h4>
                      </div>
                      
                      <div className="text-right">
                        <motion.p
                          className={`text-2xl font-bold ${
                            plan.isPopular ? 'text-primary' : 'text-foreground'
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                        >
                          {plan.price}
                        </motion.p>
                        {plan.period && (
                          <p className="text-text-muted text-sm">{plan.period}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    className="flex-grow mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                  >
                    <ul className="space-y-3 text-text-muted">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.2 + featureIndex * 0.1 + 0.7 
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckSquare className="h-5 w-5 text-success flex-shrink-0" />
                          </motion.div>
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    className="mt-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.9 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`/${locale}/auth/register`}
                        className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-primary to-sunset text-white shadow-lg hover:shadow-xl shimmer'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
