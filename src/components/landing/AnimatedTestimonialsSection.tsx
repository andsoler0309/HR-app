"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function AnimatedTestimonialsSection() {
  const t = useTranslations("landing");

  const testimonials = [
    {
      quote: t("anaQuote"),
      author: "Ana",
      role: t("operationsManager"),
      rating: 5,
      avatar: "A"
    },
    {
      quote: t("juanQuote"),
      author: "Juan",
      role: t("hrDirector"),
      rating: 5,
      avatar: "J"
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 bg-gradient-to-br from-background via-card/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-96 h-96 bg-sunset/3 rounded-full blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 35, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
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
            {t("testimonialsTitle")}
          </motion.h3>
          <motion.p
            className="max-w-3xl mx-auto text-text-muted leading-relaxed text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("testimonialsSubtitle")}
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="group relative"
              initial={{ opacity: 0, y: 50, rotateY: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
            >
              {/* Card */}
              <motion.div
                className="bg-card/80 backdrop-blur-sm border border-card-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Quote decoration */}
                <motion.div
                  className="absolute top-4 right-4 opacity-10"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                >
                  <Quote className="h-12 w-12 text-primary" />
                </motion.div>

                {/* Rating */}
                <motion.div
                  className="flex space-x-1 mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.2 + 0.4 + i * 0.1 
                      }}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 360,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Quote text */}
                <motion.p
                  className="text-text-muted italic text-lg leading-relaxed mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                >
                  {testimonial.quote}
                </motion.p>

                {/* Author */}
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-primary to-sunset rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 360,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <p className="text-foreground font-semibold text-lg">
                      — {testimonial.author}
                    </p>
                    <p className="text-text-muted text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </motion.div>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-sunset/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
