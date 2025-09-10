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
import { motion } from "framer-motion";

export default function AnimatedFeaturesSection() {
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
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-sunset/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          className="mb-12"
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
            {t("fundamentalFeatures")}
          </motion.h3>
          <motion.p
            className="max-w-3xl mx-auto text-text-muted leading-relaxed text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("centralizeOptimize")}
          </motion.p>
        </motion.div>

        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-card-border group hover:shadow-xl transition-all duration-300 hover:border-primary/30"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                className="flex items-center space-x-3 mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
              >
                <motion.div
                  className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.3 }
                  }}
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h4>
              </motion.div>
              
              <motion.ul
                className="space-y-3 text-text-muted"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
              >
                {feature.items.map((item, itemIndex) => (
                  <motion.li
                    key={itemIndex}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + itemIndex * 0.1 + 0.6 
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckSquare className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
