// src/app/page.tsx
import Link from 'next/link';
import { 
  ArrowRight, Users, Calendar, FileText, PieChart, 
  Shield, Clock, BarChart, Settings, Mail, Phone,
  CheckCircle2, Database, CloudUpload
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Comprehensive employee profiles with custom fields, document storage, and performance tracking."
  },
  {
    icon: Calendar,
    title: "Time Off Management",
    description: "Automated leave requests, holiday calendars, and absence tracking with detailed reporting."
  },
  {
    icon: FileText,
    title: "Document Handling",
    description: "Secure document storage with version control, e-signatures, and automated workflows."
  },
  {
    icon: PieChart,
    title: "Analytics & Reports",
    description: "Real-time dashboards and custom reports for workforce insights and decision making."
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Enterprise-grade security with role-based access control and data encryption."
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Accurate attendance tracking with overtime calculations and shift management."
  },
  {
    icon: BarChart,
    title: "Performance Reviews",
    description: "Structured performance evaluations with customizable review cycles."
  },
  {
    icon: Settings,
    title: "Customizable Workflows",
    description: "Adapt the system to your specific HR processes and requirements."
  }
];

const pricingFeatures = {
  free: [
    "1 employee limit",
    "Basic employee profiles",
    "Time-off management",
    "Document storage (100MB)",
    "Email support"
  ],
  premium: [
    "Unlimited employees",
    "Advanced employee profiles",
    "Complete time-off management",
    "Unlimited document storage",
    "Analytics dashboard",
    "Custom reports",
    "API access",
    "Priority support",
    "Custom branding",
    "Audit logs"
  ]
};

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "HR Director",
    company: "TechCorp",
    image: "/api/placeholder/100/100",
    quote: "Nodo transformed our HR operations. What used to take hours now takes minutes."
  },
  {
    name: "David Chen",
    role: "Operations Manager",
    company: "StartupX",
    image: "/api/placeholder/100/100",
    quote: "The best HR software for growing companies. Simple yet powerful."
  },
  {
    name: "Sarah Johnson",
    role: "CEO",
    company: "InnovateNow",
    image: "/api/placeholder/100/100",
    quote: "Finally, an HR system that our employees actually enjoy using!"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-rich-black">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-md z-50 border-b border-navbar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-primary">Nodo</h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-platinum hover:text-sunset transition-colors">Features</a>
              <a href="#pricing" className="text-platinum hover:text-sunset transition-colors">Pricing</a>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-platinum bg-primary hover:bg-background hover:text-primary transition-colors"
              >
                Try it free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-platinum tracking-tight">
            Next Generation
            <span className="block text-primary mt-2">HR Management</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-sunset">
            Streamline your HR operations with our intuitive, all-in-one platform. 
            Perfect for modern businesses looking to scale.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-3 border-2 border-primary text-base font-medium rounded-md text-platinum bg-primary hover:bg-background hover:text-primary transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center px-8 py-3 border-2 border-sunset text-base font-medium rounded-md text-sunset hover:bg-sunset hover:text-background transition-colors"
            >
              Watch Demo
            </a>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-card p-6 rounded-lg border border-card-border">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-platinum mt-2">Companies Trust Us</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-card-border">
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-platinum mt-2">Employees Managed</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-card-border">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-platinum mt-2">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-platinum">
              Everything you need to manage your team
            </h2>
            <p className="mt-4 text-lg text-sunset">
              Powerful features designed for modern HR management
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border border-card-border hover:border-primary transition-colors">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-platinum">{feature.title}</h3>
                  <p className="text-sunset">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-platinum">
              Trusted by HR Teams Worldwide
            </h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-background p-6 rounded-lg border border-card-border">
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <div className="text-platinum font-semibold">{testimonial.name}</div>
                    <div className="text-sunset text-sm">{testimonial.role}</div>
                    <div className="text-sunset text-sm">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-platinum italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-platinum">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-sunset">Start free, upgrade when you're ready</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Free Plan */}
            <div className="bg-card rounded-lg border border-card-border p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-platinum">Free Plan</h3>
                  <p className="mt-2 text-sunset">Perfect for trying out Nodo</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-platinum">$0</p>
                  <p className="text-sunset">Forever free</p>
                </div>
              </div>
              <ul className="mt-8 space-y-4">
                {pricingFeatures.free.map((feature, index) => (
                  <li key={index} className="flex items-center text-platinum">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-6 py-3 border border-primary text-platinum rounded-md font-medium hover:bg-primary transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-card rounded-lg border border-primary p-8 relative">
              <div className="absolute top-0 right-0 bg-primary text-platinum px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                POPULAR
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-platinum">Premium Plan</h3>
                  <p className="mt-2 text-sunset">For growing businesses</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-platinum">$20,000 COP</p>
                  <p className="text-sunset">/month</p>
                </div>
              </div>
              <ul className="mt-8 space-y-4">
                {pricingFeatures.premium.map((feature, index) => (
                  <li key={index} className="flex items-center text-platinum">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/auth/register?plan=premium"
                  className="block w-full text-center px-6 py-3 bg-primary text-platinum rounded-md font-medium hover:bg-background hover:text-primary border border-primary transition-colors"
                >
                  Start Premium Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-extrabold text-platinum">Get in touch</h2>
              <p className="mt-4 text-lg text-sunset">
                Have questions? We're here to help.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-primary mr-3" />
                  <span className="text-platinum">support@nodohr.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-primary mr-3" />
                  <span className="text-platinum">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            <div className="bg-background rounded-lg p-8 border border-card-border">
              <form className="space-y-6">
                <div>
                  <label className="block text-platinum mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-card border border-card-border rounded-md text-platinum"
                  />
                </div>
                <div>
                  <label className="block text-platinum mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-card border border-card-border rounded-md text-platinum"
                  />
                </div>
                <div>
                  <label className="block text-platinum mb-2">Message</label>
                  <textarea
                    className="w-full px-4 py-2 bg-card border border-card-border rounded-md text-platinum"
                    rows={4}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-platinum rounded-md font-medium hover:bg-background hover:text-primary border border-primary transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
  
        {/* FAQ Section */}
        <div className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-platinum">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-sunset">Everything you need to know about Nodo</p>
            </div>
  
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <div className="bg-card p-6 rounded-lg border border-card-border">
                <h3 className="text-lg font-semibold text-platinum">How secure is my data?</h3>
                <p className="mt-2 text-sunset">We use industry-standard encryption and security measures. Your data is stored in secure servers with regular backups and strict access controls.</p>
              </div>
  
              <div className="bg-card p-6 rounded-lg border border-card-border">
                <h3 className="text-lg font-semibold text-platinum">Can I import data from other systems?</h3>
                <p className="mt-2 text-sunset">Yes, Nodo supports data import from Excel, CSV, and common HR systems. We also provide an API for custom integrations.</p>
              </div>
  
              <div className="bg-card p-6 rounded-lg border border-card-border">
                <h3 className="text-lg font-semibold text-platinum">What's included in the free plan?</h3>
                <p className="mt-2 text-sunset">The free plan includes basic employee management for up to 1 employee, time-off tracking, and document storage up to 100MB.</p>
              </div>
  
              <div className="bg-card p-6 rounded-lg border border-card-border">
                <h3 className="text-lg font-semibold text-platinum">Can I upgrade or downgrade anytime?</h3>
                <p className="mt-2 text-sunset">Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* CTA Section */}
        <div className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-platinum max-w-2xl">
                  Ready to transform your HR management?
                </h2>
                <p className="mt-4 text-lg text-platinum/90 max-w-2xl">
                  Join thousands of companies already using Nodo to streamline their HR operations.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/register"
                    className="inline-flex justify-center items-center px-8 py-3 bg-background text-platinum rounded-md font-medium hover:bg-platinum hover:text-background transition-colors"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex justify-center items-center px-8 py-3 border-2 border-platinum text-platinum rounded-md font-medium hover:bg-platinum hover:text-primary transition-colors"
                  >
                    Schedule Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Footer */}
        <footer className="bg-background border-t border-card-border">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-primary">Nodo</h1>
                <p className="text-sunset">Next generation HR management for modern businesses</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-platinum mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sunset hover:text-primary">Features</a></li>
                  <li><a href="#pricing" className="text-sunset hover:text-primary">Pricing</a></li>
                  <li><a href="#demo" className="text-sunset hover:text-primary">Demo</a></li>
                </ul>
              </div>
  
              <div>
                <h3 className="text-lg font-semibold text-platinum mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#about" className="text-sunset hover:text-primary">About</a></li>
                  <li><a href="#blog" className="text-sunset hover:text-primary">Blog</a></li>
                  <li><a href="#careers" className="text-sunset hover:text-primary">Careers</a></li>
                </ul>
              </div>
  
              <div>
                <h3 className="text-lg font-semibold text-platinum mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#privacy" className="text-sunset hover:text-primary">Privacy Policy</a></li>
                  <li><a href="#terms" className="text-sunset hover:text-primary">Terms of Service</a></li>
                  <li><a href="#security" className="text-sunset hover:text-primary">Security</a></li>
                </ul>
              </div>
            </div>
  
            <div className="mt-12 pt-8 border-t border-card-border">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sunset">© 2024 Nodo. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#twitter" className="text-sunset hover:text-primary">Twitter</a>
                  <a href="#linkedin" className="text-sunset hover:text-primary">LinkedIn</a>
                  <a href="#github" className="text-sunset hover:text-primary">GitHub</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }