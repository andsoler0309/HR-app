"use client";

import { useTranslations } from "next-intl";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function FAQSection() {
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
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-sunset/5 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
            {t("faqTitle")}
          </h2>
          <p className="text-text-muted text-lg">
            {t("faqSubtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card/80 backdrop-blur-sm border border-card-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <button
                className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-t-xl hover:bg-primary/5"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index ? 'bg-primary/20 rotate-180' : ''
                }`}>
                  {openIndex === index ? (
                    <Minus className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="border-t border-card-border/50 pt-4">
                    <p className="text-text-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
