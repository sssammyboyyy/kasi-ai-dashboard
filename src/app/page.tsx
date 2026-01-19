"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Footer } from "@/components/ui/Footer";
import { JsonLd, schemas } from "@/components/seo/JsonLd";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Star,
  MessageSquare,
  Mail,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Copy,
} from "lucide-react";
import { Hero3D } from "@/components/marketing/Hero3D";
import { TrustMarquee } from "@/components/marketing/TrustMarquee";
import { motion } from "framer-motion";
import { assetPath } from "@/lib/basePath";

// FAQ data for schema markup and potential FAQ section
const FAQ_ITEMS = [
  { question: "How does Kasi AI find leads?", answer: "We use AI to scrape Google Maps and business directories in real-time, extracting verified contact information for businesses in your target area." },
  { question: "Are the leads verified?", answer: "Yes, every lead includes a verified email and phone number. We have a 98% accuracy guarantee." },
  { question: "How quickly do I get my leads?", answer: "Leads are delivered within 24 hours directly to your WhatsApp." },
  { question: "Is there a free trial?", answer: "Yes! Your first 25 leads are completely free, no credit card required." }
];

const TESTIMONIALS = [
  {
    name: "Thabo Molefe",
    role: "CEO at CleanPro Vaal",
    image: assetPath("/kasi_hero_professional_1768835124101.png"),
    quote: "I closed 3 new contracts in my first week. The leads are verified and ready to buy.",
    stat: "R45,000",
    statLabel: "new revenue"
  },
  {
    name: "Naledi Dlamini",
    role: "Founder, Sparkle Solutions",
    image: assetPath("/kasi_hero_woman_1768835238793.png"),
    quote: "No more cold calling. These leads already know they need my services.",
    stat: "12",
    statLabel: "new clients"
  },
  {
    name: "Sipho Nkosi",
    role: "Operations Manager",
    image: assetPath("/kasi_hero_man_2_1768835329601.png"),
    quote: "The WhatsApp scripts save me hours. I just send and they respond.",
    stat: "85%",
    statLabel: "response rate"
  }
];

const PAIN_POINTS = [
  "Spending hours searching Google for potential clients",
  "Cold calling businesses that don't need your services",
  "Wasting money on ads that don't convert",
  "No time to do proper sales outreach"
];

const FEATURES = [
  {
    image: assetPath("/icon_realtime_extraction.png"),
    title: "Real-Time Extraction",
    description: "We scrape Google Maps and business directories in your area. Every lead is fresh, verified, and ready."
  },
  {
    image: assetPath("/icon_contact_info.png"),
    title: "Email + Phone Included",
    description: "No more hunting for contact info. Get direct emails and phone numbers delivered to your inbox."
  },
  {
    image: assetPath("/icon_whatsapp_scripts.png"),
    title: "WhatsApp Scripts Ready",
    description: "Every lead comes with a personalized outreach script. Just copy, paste, and send."
  },
  {
    image: assetPath("/icon_verified_shield.png"),
    title: "Verified Decision Makers",
    description: "We filter out gatekeepers. You get direct access to the people who sign the cheques."
  }
];

export default function LandingPage() {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    alert(`Thank you! We'll send your 25 free leads to ${phone} via WhatsApp.`);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans text-gray-900">
      {/* FAQ Schema for GEO */}
      <JsonLd data={schemas.faq(FAQ_ITEMS)} />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Success Stories</a>
            <Link href="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-700">Pricing</Link>
          </div>
          <Link href="/get-started">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Get Free Leads
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero3D />

      {/* Social Proof Marquee */}
      <div className="border-b border-gray-100 bg-white">
        <TrustMarquee />
      </div>

      {/* Pain Points */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h2 className="font-outfit text-2xl font-bold text-gray-900 md:text-3xl">
              Tired of wasting time on leads that go nowhere?
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {PAIN_POINTS.map((pain, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-5 text-left shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-100">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-600 font-bold">✕</span>
                  <span className="text-gray-700">{pain}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="text-center">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1">How It Works</Badge>
              <h2 className="font-outfit text-3xl font-bold text-gray-900 md:text-4xl">
                From zero to qualified leads in 24 hours
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, i) => (
                <Card key={i} className="group border-gray-200 p-6 transition-all hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 overflow-visible">
                  <motion.div
                    className="mb-6 flex h-16 w-16 items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain drop-shadow-lg"
                    />
                  </motion.div>
                  <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-outfit text-3xl font-bold text-gray-900 md:text-4xl">
                Real results from real businesses
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, i) => (
                <Card key={i} className="border-gray-200 bg-white p-8 transition-all hover:shadow-lg">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-full border border-gray-100">
                      <Image src={testimonial.image} alt={testimonial.name} width={56} height={56} className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="mt-8 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-blue-900">{testimonial.stat}</span>
                    <span className="text-sm text-blue-700/80">{testimonial.statLabel}</span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="font-outfit text-3xl font-bold md:text-5xl">
              25 Free Leads waiting for you.
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              No credit card. No commitment. Just ROI.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 flex justify-center">
              <div className="flex flex-col gap-3 w-full max-w-md sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 py-6 text-lg font-bold shadow-xl transition-transform hover:-translate-y-1"
                  onClick={() => window.location.href = '/get-started'}
                >
                  Claim My Free Leads
                </Button>
              </div>
            </form>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
