"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
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
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-sunset/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
            {t("testimonialsTitle")}
          </h3>
          <p className="max-w-3xl mx-auto text-text-muted leading-relaxed text-lg">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="group relative"
            >
              {/* Card */}
              <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Quote decoration */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="h-12 w-12 text-primary" />
                </div>

                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-text-muted italic text-lg leading-relaxed mb-6">
                  {testimonial.quote}
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-sunset rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-lg">
                      — {testimonial.author}
                    </p>
                    <p className="text-text-muted text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-sunset/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
