"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { YearlyToggle } from "@/components/pricing/YearlyToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd, schemas } from "@/components/seo/JsonLd";
import { ChevronDown, ChevronUp, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { assetPath } from "@/lib/basePath";

export default function PricingPage() {
    const [yearly, setYearly] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const tiers = [
        {
            name: "Starter",
            price: 399,
            description: "For new hustlers - 50 verified B2B leads with email and phone numbers",
            credits: 50,
            features: [
                "50 Verified Leads",
                "Email & Phone Numbers",
                "Basic WhatsApp Scripts",
                "Lead Export (CSV)"
            ],
            popular: false
        },
        {
            name: "Growth",
            price: 799,
            description: "For growing businesses - 150 verified leads with priority scoring",
            credits: 150,
            features: [
                "150 Verified Leads",
                "Priority Lead Scoring",
                "Personalized Scripts",
                "WhatsApp Support",
                "Custom Niches"
            ],
            popular: true
        },
        {
            name: "Scale",
            price: 1499,
            description: "For agencies - 500 verified leads with API access and white-label",
            credits: 500,
            features: [
                "500 Verified Leads",
                "Dedicated Account Manager",
                "API Access",
                "White-label Reports",
                "Unlimited Niches"
            ],
            popular: false
        }
    ];

    return (
        <main className="min-h-screen bg-[#F4F9FF] font-sans">
            {/* Product Schema for each tier */}
            {tiers.map((tier) => (
                <JsonLd key={tier.name} data={schemas.product(tier)} />
            ))}
            {/* Breadcrumb Schema */}
            <JsonLd data={schemas.breadcrumb([
                { name: "Home", url: "https://kasi.ai" },
                { name: "Pricing", url: "https://kasi.ai/pricing" }
            ])} />
            {/* Sticky Promo Banner */}
            <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-md animate-in slide-in-from-top duration-500">
                <Gift className="h-4 w-4 text-yellow-300" />
                <span>Limited Offer: Get your first 25 leads <span className="font-bold underline text-yellow-300">FREE</span> when you sign up today!</span>
            </div>

            {/* Nav */}
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src={assetPath("/logo.png")} alt="Kasi AI" width={180} height={60} className="h-10 w-auto hover:opacity-80 transition-opacity" />
                    </Link>
                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Back to Home</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Content */}
            <section className="pt-20 pb-16 text-center px-4">
                <ScrollReveal>
                    <p className="mb-4 font-bold text-blue-600 uppercase tracking-widest text-xs">Plans & Pricing</p>
                    <h1 className="mx-auto max-w-3xl font-outfit text-4xl font-bold text-gray-900 md:text-5xl leading-tight">
                        Your best leads are just a click away.
                        <br />
                        <span className="text-gray-500">Close your next deal today.</span>
                    </h1>

                    {/* Social Proof */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <div className="flex -space-x-3 hover:space-x-0 transition-all duration-300">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 w-12 rounded-full border-2 border-white bg-gray-200 shadow-md transition-transform hover:scale-110 hover:z-10">
                                    <Image src={assetPath(`/pricing_profile_${i}.png`)} alt="User" width={48} height={48} className="h-full w-full rounded-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex text-yellow-400 gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                            <p className="text-xs font-medium text-gray-600 mt-1">"Triple-verified numbers mean I don't waste a cent."</p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <div className="mt-14">
                        <YearlyToggle yearly={yearly} setYearly={setYearly} />
                    </div>
                </ScrollReveal>
            </section>

            {/* Pricing Cards */}
            <div className="mx-auto max-w-6xl px-6 pb-24 pt-20">
                <ScrollReveal>
                    <div className="grid gap-10 md:grid-cols-3 md:items-start pt-10">
                        {tiers.map((tier) => (
                            <PricingCard
                                key={tier.name}
                                {...tier}
                                yearly={yearly}
                            />
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="#" className="inline-block text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-0.5">
                            UNLOCK SEAMLESS COMMUNICATION: EXPLORE OUR EXCLUSIVE PHONE-ONLY PLANS HERE!
                        </Link>
                    </div>
                </ScrollReveal>
            </div>

            {/* Comparison Section */}
            <section className="bg-white py-24 border-t border-gray-100">
                <div className="mx-auto max-w-4xl px-6">
                    <ScrollReveal>
                        <h2 className="mb-14 text-center font-outfit text-3xl font-bold text-gray-900">
                            Why real hustlers choose Kasi AI vs Ads
                        </h2>
                        <ComparisonTable />
                    </ScrollReveal>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-gray-50 py-24 px-6 border-t border-gray-100">
                <div className="mx-auto max-w-2xl">
                    <ScrollReveal>
                        <h2 className="mb-10 text-center font-outfit text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: "Is the first 25 leads really free?", a: "Yes. No credit card required. Just sign up, verify your WhatsApp, and we send them instantly." },
                                { q: "How fresh is the data?", a: "We scrape in real-time. Unlike databases that rot for months, our data is rarely older than 24 hours." },
                                { q: "Can I upgrade or downgrade?", a: "Absolutely. You can switch plans or cancel at any time from your dashboard." },
                                { q: "What if I get a bad lead?", a: "We have a 98% accuracy guarantee. If you get a bounced email or disconnected phone, we credit it back to your account." }
                            ].map((faq, i) => (
                                <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-200">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="flex w-full items-center justify-between p-5 text-left font-medium text-gray-900 focus:outline-none"
                                    >
                                        {faq.q}
                                        {openFaq === i ? <ChevronUp className="h-5 w-5 text-blue-500" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                            } overflow-hidden`}
                                    >
                                        <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Referral Program */}
            <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <ScrollReveal>
                        <div className="pt-8 w-full">
                            <motion.div
                                className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl p-4"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Image
                                    src={assetPath("/icon_referral_gift.png")}
                                    alt="Gift"
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-contain"
                                />
                            </motion.div>
                            <div className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-bold text-white mb-6">
                                🎁 Referral Program
                            </div>
                            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white mb-4">
                                Refer a Friend, Get R500 Credit
                            </h2>
                            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                                Know another cleaning business owner? When they sign up and make their first purchase, you both get R500 in lead credits. No limits.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href="/get-started">
                                    <Button className="h-14 px-8 bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 shadow-xl">
                                        Start Referring Now
                                    </Button>
                                </Link>
                                <p className="text-sm text-blue-200">
                                    Unlimited referrals • Instant credits • No expiry
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );
}
