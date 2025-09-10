"use client";

import { useTranslations } from "next-intl";
import { Users, PieChart, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function AnimatedPymeSection() {
  const t = useTranslations("landing");

  return (
    <section className="py-16 px-6 sm:px-8 bg-gradient-to-br from-card/30 via-card/50 to-card/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-40 h-40 bg-sunset/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {t("pymeTitle")}
          </motion.h2>
          <motion.p
            className="max-w-3xl mx-auto text-text-muted text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("pymeSubtitle")}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div 
            className="text-center group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint1Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint1Desc")}
            </p>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <PieChart className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint2Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint2Desc")}
            </p>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <CheckSquare className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("pymePoint3Title")}
            </h3>
            <p className="text-text-muted">
              {t("pymePoint3Desc")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
