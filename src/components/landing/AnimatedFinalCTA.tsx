"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedFinalCTAProps {
  locale: string;
}

export default function AnimatedFinalCTA({ locale }: AnimatedFinalCTAProps) {
  const t = useTranslations("landing");

  return (
    <section className="py-20 px-6 sm:px-8 text-center bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-56 h-56 bg-sunset/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -35, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-sunset/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-primary">¡Únete a 250+ empresas exitosas!</span>
          </motion.div>

          <motion.h3
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-primary via-sunset to-primary bg-clip-text text-transparent">
              {t("readyToOptimize")}
            </span>
          </motion.h3>
          
          <motion.p
            className="text-text-muted max-w-2xl mx-auto leading-relaxed text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {t("getStartedFree")}
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-text-muted"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </motion.div>
                ))}
              </div>
              <span>5.0 • 150+ reseñas</span>
            </motion.div>
            <div className="w-px h-4 bg-card-border"></div>
            <span>✅ Setup en 15 minutos</span>
            <div className="w-px h-4 bg-card-border"></div>
            <span>✅ Soporte en español</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link
              href={`/${locale}/auth/register`}
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-sunset text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden shimmer"
            >
              <span className="relative z-10 flex items-center">
                {t("signUpNow")}
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sunset to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="#features"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border-2 border-primary/30 text-primary bg-background/50 backdrop-blur-sm font-semibold rounded-xl text-lg hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              Ver características
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <motion.div
            className="text-text-muted/60 text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨ Más de 250 empresas ya optimizaron sus procesos de RRHH
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
