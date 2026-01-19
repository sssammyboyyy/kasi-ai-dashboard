"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Target, Users, MapPin, Phone, Mail, Building, MessageCircle, Star } from "lucide-react";
import { assetPath } from "@/lib/basePath";
import { analytics } from "@/components/analytics/GoogleAnalytics";
import { config } from "@/lib/config";

/**
 * CRO-Optimized Lead Generation Survey
 * 
 * Principles Applied:
 * 1. Progressive Disclosure - One question at a time
 * 2. Micro-Commitments - Easy first questions build momentum
 * 3. Value-First - Show benefit previews between sections
 * 4. Qualification - Identify high-intent leads
 * 5. Onboarding - Collect info needed to start immediately
 */

interface SurveyData {
    // Section 1: Easy Starters (Build Momentum)
    businessName: string;
    yourName: string;
    businessType: string;

    // Section 2: Pain Points (Qualify Intent)
    currentLeadSource: string;
    biggestChallenge: string;
    monthlyBudget: string;

    // Section 3: Goals (Show We Understand)
    monthlyContractsGoal: string;
    idealClientType: string;
    location: string;

    // Section 4: Onboarding (Ready to Start)
    whatsappNumber: string;
    email: string;
    preferredContact: string;

    // Section 5: Commitment (Seal the Deal)
    timeline: string;
    heardAboutUs: string;
    readyToStart: string;
}

const initialData: SurveyData = {
    businessName: "",
    yourName: "",
    businessType: "",
    currentLeadSource: "",
    biggestChallenge: "",
    monthlyBudget: "",
    monthlyContractsGoal: "",
    idealClientType: "",
    location: "",
    whatsappNumber: "",
    email: "",
    preferredContact: "",
    timeline: "",
    heardAboutUs: "",
    readyToStart: ""
};

const questions = [
    // === SECTION 1: EASY STARTERS ===
    {
        id: "businessName",
        section: 1,
        question: "What's your business name?",
        subtext: "This helps us personalize your leads package",
        type: "text",
        image: assetPath("/icon_verified_shield.png"),
        icon: Building,
        placeholder: "e.g., CleanPro Services"
    },
    {
        id: "yourName",
        section: 1,
        question: "And your name?",
        subtext: "So we know who to address",
        type: "text",
        image: assetPath("/icon_contact_info.png"),
        icon: Users,
        placeholder: "e.g., Thabo"
    },
    {
        id: "businessType",
        section: 1,
        question: "What type of cleaning do you specialize in?",
        subtext: "We'll match you with businesses that need exactly this",
        type: "select",
        image: assetPath("/icon_cleaning_services.png"),
        icon: Sparkles,
        options: [
            "Commercial Office Cleaning",
            "Industrial Cleaning",
            "Residential Cleaning",
            "Deep Cleaning & Sanitization",
            "Window & Facade Cleaning",
            "All of the Above"
        ]
    },
    // === VALUE BREAK: Show what they'll get ===

    // === SECTION 2: PAIN POINTS ===
    {
        id: "currentLeadSource",
        section: 2,
        question: "How do you currently find new clients?",
        subtext: "We'll show you an easier way",
        type: "select",
        image: assetPath("/icon_realtime_extraction.png"),
        icon: Target,
        options: [
            "Word of mouth only",
            "Facebook/Social Media Ads",
            "Door-to-door visits",
            "Tender websites",
            "I struggle to find clients",
            "Other"
        ]
    },
    {
        id: "biggestChallenge",
        section: 2,
        question: "What's your biggest challenge right now?",
        subtext: "Be honest - we've heard it all",
        type: "select",
        image: assetPath("/icon_growth_chart.png"),
        icon: Target,
        options: [
            "Finding new clients",
            "Getting decision-maker contact info",
            "Competing with bigger companies",
            "Inconsistent work/income",
            "Not enough time to market",
            "All of the above"
        ]
    },
    {
        id: "monthlyBudget",
        section: 2,
        question: "What could you afford to invest in leads monthly?",
        subtext: "We have plans from R399 - most clients see ROI in week 1",
        type: "select",
        image: assetPath("/icon_finance_budget.png"),
        icon: Target,
        options: [
            "Less than R500/month",
            "R500 - R1,000/month",
            "R1,000 - R2,000/month",
            "R2,000+/month",
            "I need to see results first"
        ]
    },

    // === SECTION 3: GOALS ===
    {
        id: "monthlyContractsGoal",
        section: 3,
        question: "How many new contracts would you like per month?",
        subtext: "Dream big - we'll help you get there",
        type: "select",
        image: assetPath("/icon_growth_chart.png"),
        icon: Sparkles,
        options: [
            "1-2 new contracts",
            "3-5 new contracts",
            "5-10 new contracts",
            "10+ new contracts",
            "As many as possible!"
        ]
    },
    {
        id: "idealClientType",
        section: 3,
        question: "Who's your ideal client?",
        subtext: "We'll target exactly these businesses for you",
        type: "select",
        image: assetPath("/icon_cleaning_services.png"),
        icon: Building,
        options: [
            "Small offices (1-20 employees)",
            "Medium offices (20-100 employees)",
            "Large corporate buildings",
            "Retail stores & malls",
            "Warehouses & factories",
            "Any business that needs cleaning"
        ]
    },
    {
        id: "location",
        section: 3,
        question: "Where do you service?",
        subtext: "We'll only send leads in your area",
        type: "text",
        image: assetPath("/icon_realtime_extraction.png"),
        icon: MapPin,
        placeholder: "e.g., Johannesburg, Sandton, Midrand"
    },

    // === SECTION 4: ONBOARDING ===
    {
        id: "whatsappNumber",
        section: 4,
        question: "What's your WhatsApp number?",
        subtext: "We'll send your first 25 FREE leads here instantly",
        type: "tel",
        image: assetPath("/icon_whatsapp_scripts.png"),
        icon: Phone,
        placeholder: "+27 82 555 1234"
    },
    {
        id: "email",
        section: 4,
        question: "And your best email?",
        subtext: "For your lead reports and dashboard access",
        type: "email",
        image: assetPath("/icon_contact_info.png"),
        icon: Mail,
        placeholder: "you@yourbusiness.co.za"
    },
    {
        id: "preferredContact",
        section: 4,
        question: "How do you prefer we contact you?",
        subtext: "We respect your time",
        type: "select",
        image: assetPath("/icon_contact_info.png"),
        icon: Phone,
        options: [
            "WhatsApp (recommended)",
            "Phone call",
            "Email",
            "Any method is fine"
        ]
    },

    // === SECTION 5: COMMITMENT ===
    {
        id: "timeline",
        section: 5,
        question: "When do you want to start getting leads?",
        subtext: "We can have you set up in 24 hours",
        type: "select",
        image: assetPath("/icon_calendar_clock.png"),
        icon: Target,
        options: [
            "Immediately - I need clients now",
            "This week",
            "This month",
            "Just exploring for now"
        ]
    },
    {
        id: "heardAboutUs",
        section: 5,
        question: "How did you hear about Kasi AI?",
        subtext: "Helps us know what's working",
        type: "select",
        image: assetPath("/icon_whatsapp_scripts.png"),
        icon: Users,
        options: [
            "Google search",
            "Facebook/Instagram",
            "A friend referred me",
            "LinkedIn",
            "Other"
        ]
    },
    {
        id: "readyToStart",
        section: 5,
        question: "Are you ready to get your first 25 FREE leads?",
        subtext: "No card required - just click below and we'll send them",
        type: "select",
        image: assetPath("/icon_verified_shield.png"),
        icon: CheckCircle2,
        options: [
            "Yes! Send me my free leads now",
            "Yes, but I have questions first",
            "I need to think about it"
        ]
    }
];

const sectionBreaks = [
    { afterQuestion: 2, title: "Great start! 🎉", message: "You're about to unlock verified leads sent directly to your WhatsApp." },
    { afterQuestion: 5, title: "We feel you! 💪", message: "85% of our clients had the same challenges. Let's fix that." },
    { afterQuestion: 8, title: "Almost there! 🚀", message: "Just a few more details and your first 25 FREE leads are on the way." },
    { afterQuestion: 11, title: "One more step! ✨", message: "Let's make sure we send you the right leads." }
];

export function LeadSurvey() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [data, setData] = useState<SurveyData>(initialData);
    const [showBreak, setShowBreak] = useState(false);
    const [breakContent, setBreakContent] = useState({ title: "", message: "" });
    const [isComplete, setIsComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [npsScore, setNpsScore] = useState<number | null>(null);
    const [npsSubmitted, setNpsSubmitted] = useState(false);

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    // Submit form data to Formspree
    const submitForm = async (formData: SurveyData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(config.formspree.getEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    submittedAt: new Date().toISOString(),
                    source: 'lead_survey'
                }),
            });
            if (response.ok) {
                analytics.surveyCompleted(formData.businessName);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit NPS score
    const submitNps = async (score: number) => {
        setNpsScore(score);
        setNpsSubmitted(true);
        analytics.npsSubmitted(score);
        try {
            await fetch(config.formspree.getEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    npsScore: score,
                    businessName: data.businessName,
                    email: data.email,
                    type: 'nps_feedback'
                }),
            });
        } catch (error) {
            console.error('NPS submission error:', error);
        }
    };

    // Generate WhatsApp deeplink
    const getWhatsAppLink = () => {
        const message = `Hi! I just signed up for Kasi AI.\n\nBusiness: ${data.businessName}\nName: ${data.yourName}\nLocation: ${data.location}\n\nI'm ready for my 25 free leads!`;
        return config.whatsapp.getLink(message);
    };

    const handleNext = () => {
        const breakPoint = sectionBreaks.find(b => b.afterQuestion === currentQuestion);
        if (breakPoint && !showBreak) {
            setBreakContent(breakPoint);
            setShowBreak(true);
            return;
        }

        setShowBreak(false);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            analytics.surveyStep(currentQuestion + 1, question.id);
        } else {
            // Submit form on completion
            submitForm(data);
            setIsComplete(true);
        }
    };

    const handleBack = () => {
        if (showBreak) {
            setShowBreak(false);
            return;
        }
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleInputChange = (value: string) => {
        setData(prev => ({ ...prev, [question.id]: value }));
    };

    const isCurrentAnswered = () => {
        const value = data[question.id as keyof SurveyData];
        return value && value.trim() !== "";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && isCurrentAnswered()) {
            handleNext();
        }
    };

    if (isComplete) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                <Logo className="mb-8" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center w-full max-w-md"
                >
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="font-outfit text-3xl font-bold text-gray-900">You're All Set, {data.yourName}! 🎉</h1>
                    <p className="mt-4 text-base text-gray-600">
                        Your first 25 FREE leads are being prepared for {data.businessName}.
                    </p>

                    {/* WhatsApp CTA - MAIN ACTION */}
                    <a
                        href={getWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-6"
                    >
                        <Button className="w-full h-14 bg-green-600 font-bold text-lg hover:bg-green-700 gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Get Leads on WhatsApp Now
                        </Button>
                    </a>
                    <p className="mt-2 text-xs text-gray-400">
                        Click to message us directly and receive your leads instantly
                    </p>

                    {/* NPS Feedback Widget */}
                    {!npsSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 p-5 rounded-2xl bg-white shadow-lg border border-gray-100"
                        >
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Quick feedback: How likely are you to recommend Kasi AI?
                            </p>
                            <div className="flex justify-center gap-1">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                    <button
                                        key={score}
                                        onClick={() => submitNps(score)}
                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all hover:scale-110 ${score <= 6 ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                                                score <= 8 ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' :
                                                    'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                                <span>Not likely</span>
                                <span>Very likely</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 p-4 rounded-xl bg-green-50 border border-green-200"
                        >
                            <div className="flex items-center justify-center gap-2 text-green-700">
                                <Star className="h-5 w-5 fill-green-500" />
                                <span className="font-medium">Thanks for your feedback!</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Viral Referral Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl border border-blue-100"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                                    <Image src={assetPath("/icon_referral_gift.png")} alt="Gift" width={48} height={48} className="h-full w-full object-contain" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm uppercase tracking-wide opacity-90">Bonus Offer</p>
                                    <p className="font-bold text-lg leading-tight">Want R500 Lead Credit?</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 text-left">
                            <p className="text-sm text-gray-600 mb-4">
                                Refer a business friend. When they sign up, you both get <strong>R500 free credit</strong>.
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500 truncate select-all">
                                    kasi.ai/ref/{data.yourName.toLowerCase().replace(/\s/g, '')}
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    <Link href="/" className="block mt-4">
                        <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                            Go to Home Page
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gray-200">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question Counter */}
            <div className="fixed top-4 right-6 z-50 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-md">
                {currentQuestion + 1} / {questions.length}
            </div>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {showBreak ? (
                        <motion.div
                            key="break"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-lg text-center"
                        >
                            <h2 className="font-outfit text-4xl font-bold text-gray-900">{breakContent.title}</h2>
                            <p className="mt-4 text-xl text-gray-600">{breakContent.message}</p>
                            <Button
                                onClick={handleNext}
                                className="mt-8 h-14 bg-blue-600 px-8 text-lg font-bold hover:bg-blue-700"
                            >
                                Continue <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-xl"
                        >
                            <div className="mb-8 flex justify-center">
                                {question.image ? (
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="h-24 w-24 drop-shadow-xl"
                                    >
                                        <Image
                                            src={question.image}
                                            alt={question.question}
                                            width={96}
                                            height={96}
                                            className="h-full w-full object-contain"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                                        <question.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-center font-outfit text-3xl font-bold text-gray-900 md:text-4xl">
                                {question.question}
                            </h2>
                            <p className="mt-3 text-center text-gray-500">{question.subtext}</p>

                            <div className="mt-10">
                                {question.type === "select" ? (
                                    <div className="grid gap-3">
                                        {question.options?.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleInputChange(option)}
                                                className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${data[question.id as keyof SurveyData] === option
                                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={question.type}
                                        placeholder={question.placeholder}
                                        value={data[question.id as keyof SurveyData]}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 text-lg font-medium text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                    />
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="mt-10 flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    className={`text-gray-500 hover:text-gray-700 transition-opacity ${currentQuestion === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={!isCurrentAnswered()}
                                    className="h-12 bg-blue-600 px-6 text-base font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {currentQuestion === questions.length - 1 ? "Get My Free Leads" : "Next"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trust Footer */}
            <div className="p-6 text-center text-sm text-gray-400">
                🔒 Your information is secure and will never be shared.
            </div>
        </div>
    );
}
