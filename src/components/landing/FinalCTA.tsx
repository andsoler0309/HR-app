"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";

interface FinalCTAProps {
  locale: string;
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  const t = useTranslations("landing");

  return (
    <section className="py-20 px-6 sm:px-8 text-center bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl opacity-30" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-sunset/10 rounded-full blur-2xl opacity-20" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-sunset/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">¡Únete a 250+ empresas exitosas!</span>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-sunset to-primary bg-clip-text text-transparent">
              {t("readyToOptimize")}
            </span>
          </h3>
          
          <p className="text-text-muted max-w-2xl mx-auto leading-relaxed text-lg mb-8">
            {t("getStartedFree")}
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-text-muted">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <span>5.0 • 150+ reseñas</span>
            </div>
            <div className="w-px h-4 bg-card-border"></div>
            <span>✅ Setup en 15 minutos</span>
            <div className="w-px h-4 bg-card-border"></div>
            <span>✅ Soporte en español</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/auth/register`}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-sunset text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {t("signUpNow")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-sunset to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="#features"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border-2 border-primary/30 text-primary bg-background/50 backdrop-blur-sm font-semibold rounded-xl text-lg hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            Ver características
          </Link>
        </div>

        {/* Bottom decoration */}
        <div className="mt-12 flex justify-center">
          <div className="text-text-muted/60 text-sm">
            ✨ Más de 250 empresas ya optimizaron sus procesos de RRHH
          </div>
        </div>
      </div>
    </section>
  );
}
