"use client";

import { useTranslations } from "next-intl";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AnimatedFAQSection() {
  const t = useTranslations("landing");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t("faq1Question"),
      answer: t("faq1Answer")
    },
    {
      question: t("faq2Question"),
      answer: t("faq2Answer")
    },
    {
      question: t("faq3Question"),
      answer: t("faq3Answer")
    },
    {
      question: t("faq4Question"),
      answer: t("faq4Answer")
    },
    {
      question: t("faq5Question"),
      answer: t("faq5Answer")
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 sm:px-8 bg-gradient-to-br from-card/20 via-background to-card/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-sunset/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("faqTitle")}
          </motion.h2>
          <motion.p
            className="text-text-muted text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("faqSubtitle")}
          </motion.p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-card/80 backdrop-blur-sm border border-card-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
            >
              <motion.button
                className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-t-xl"
                onClick={() => toggleFAQ(index)}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                transition={{ duration: 0.2 }}
              >
                <motion.h3
                  className="text-lg font-semibold text-foreground pr-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                >
                  {faq.question}
                </motion.h3>
                <motion.div
                  className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                  animate={{ 
                    backgroundColor: openIndex === index ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                    rotate: openIndex === index ? 180 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "rgba(59, 130, 246, 0.2)"
                  }}
                >
                  {openIndex === index ? (
                    <Minus className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                </motion.div>
              </motion.button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="px-6 pb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="border-t border-card-border/50 pt-4">
                        <p className="text-text-muted leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
