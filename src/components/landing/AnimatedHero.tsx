"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  CheckSquare,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedHeroProps {
  locale: string;
}

export default function AnimatedHero({ locale }: AnimatedHeroProps) {
  const t = useTranslations("landing");

  return (
    <section 
      className="relative pt-28 pb-20 px-6 sm:px-8 overflow-hidden"
      itemScope
      itemType="https://schema.org/SoftwareApplication"
    >
      {/* Structured Data for SEO */}
      <div className="sr-only">
        <h1 itemProp="name">NodoHR - {t("heroTitle")}</h1>
        <p itemProp="description">{t("heroSubtitle")}</p>
        <span itemProp="applicationCategory">Business</span>
        <span itemProp="operatingSystem">Web</span>
        <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price">0</span>
          <span itemProp="priceCurrency">USD</span>
        </span>
      </div>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Background Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-sunset/15 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Geometric Shapes */}
        <motion.div
          className="absolute top-32 left-1/4 w-6 h-6 bg-primary/40 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-8 h-8 bg-sunset/50 rotate-45"
          animate={{
            y: [0, 20, 0],
            rotate: [45, 405, 45],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/5 w-5 h-5 bg-primary/60 rounded-full"
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Hexagon Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-10 h-10"
          animate={{
            rotate: [0, 360],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-sunset/40 clip-hexagon"></div>
        </motion.div>
        
        {/* Animated Lines/Connections */}
        <motion.svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full"
          viewBox="0 0 800 600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        >
          <motion.path
            d="M 100 100 Q 400 50 700 100 T 700 400"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M 50 200 Q 200 150 400 200 T 750 300"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(var(--sunset))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(var(--sunset))" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(var(--sunset))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </motion.svg>
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-primary/50 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-15">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(var(--primary), 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(var(--primary), 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              backgroundPosition: '0 0, 0 0',
            }}
          />
        </div>
        
        {/* Radial Gradient Overlays */}
        <motion.div
          className="absolute top-1/4 right-1/6 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-gradient-radial from-sunset/18 to-transparent rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        
        {/* Morphing Background Blobs */}
        <motion.div
          className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-primary/20 to-sunset/20 morph-shape"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Additional Floating Elements */}
        <motion.div
          className="absolute top-20 left-3/4 w-6 h-6 bg-gradient-to-r from-primary to-sunset rounded-full pulse-glow"
          animate={{
            y: [0, -40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Animated Icons/Symbols */}
        <motion.div
          className="absolute bottom-1/4 right-1/5 w-12 h-12 opacity-40"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary">
            <path
              d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-10 w-10 h-10 opacity-35"
          animate={{
            rotate: [0, -360],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-sunset">
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 1v6m0 8v6m11-7h-6m-8 0H1m15.5-6.5l-4.24 4.24m-8.48 0L7.5 6.5m12.73 12.73l-4.24-4.24m-8.48 0l4.24 4.24" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </motion.div>
        
        {/* DNA Helix Pattern */}
        <motion.svg
          className="absolute top-0 left-0 w-full h-full opacity-20"
          viewBox="0 0 400 600"
          animate={{
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={i}
              cx={200 + Math.sin(i * 0.8) * 50}
              cy={i * 70 + 50}
              r="4"
              fill="rgb(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.svg>
        
        {/* Constellation Pattern */}
        <div className="absolute inset-0 opacity-25">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(6)].map((_, i) => (
              <motion.line
                key={i}
                x1={`${10 + (i * 7) % 80}%`}
                y1={`${15 + (i * 11) % 70}%`}
                x2={`${10 + ((i + 1) * 7) % 80}%`}
                y2={`${15 + ((i + 1) * 11) % 70}%`}
                stroke="rgb(var(--primary))"
                strokeWidth="1"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 1.2,
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Floating UI Elements */}
      <motion.div
        className="absolute top-20 right-10 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div
          className="bg-card/80 backdrop-blur-enhanced border border-card-border rounded-lg p-4 shadow-lg float-animation"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t("productivity")}</p>
              <p className="text-sm font-semibold text-foreground">+40%</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-40 left-10 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          className="bg-card/80 backdrop-blur-enhanced border border-card-border rounded-lg p-4 shadow-lg float-animation-fast"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t("companies")}</p>
              <p className="text-sm font-semibold text-foreground">250+</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <motion.div
          className="bg-card/80 backdrop-blur-enhanced border border-card-border rounded-lg p-3 shadow-lg float-animation"
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
              ))}
            </div>
            <span className="text-xs font-medium text-foreground">5.0</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            {/* <span className="text-sm font-medium text-primary">{t("newFeature")}</span> */}
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span 
            className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            dangerouslySetInnerHTML={{ 
              __html: t("heroTitle").replace(
                "NodoHR", 
                '<span class="bg-gradient-to-r from-primary via-sunset to-primary bg-clip-text text-transparent">NodoHR</span>'
              )
            }}
          />
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-text-muted leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* Enhanced CTA Section */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link
              href={`/${locale}/auth/register`}
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-sunset text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden shimmer glow"
            >
              <span className="relative z-10 flex items-center">
                {t("tryFree")}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
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
              href={`/${locale}/auth/login`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border-2 border-primary text-primary bg-background/50 backdrop-blur-sm font-semibold rounded-xl text-lg hover:bg-primary/10 transition-all duration-300"
            >
              {t("login")}
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-4 text-sm text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {t("heroSubCta")}
        </motion.p>

        {/* Trust Indicators */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-text-muted"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-success" />
            <span>{t("noCard")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-success" />
            <span>{t("freeTrial")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-success" />
            <span>{t("cancelAnytime")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
