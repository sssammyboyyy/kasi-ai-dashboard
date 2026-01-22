"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Target, Users,
    MapPin, Phone, Mail, Building, MessageCircle, Star, Rocket,
    Zap, Clock, DollarSign, TrendingUp, Settings
} from "lucide-react";
import { toast } from "sonner";

/**
 * Free Trial Questionnaire (Glassmorphism Design)
 * 
 * Goals:
 * 1. Get user feedback on pain points
 * 2. Offer personalized free trial
 * 3. Configure lead gen based on answers
 */

interface FreeTrialData {
    // Identity
    businessName: string;
    contactName: string;
    email: string;
    phone: string;

    // Pain Discovery
    currentMethod: string;
    biggestFrustration: string;
    timeSpentProspecting: string;

    // Magic Outcome
    idealOutcome: string;
    monthlyBudget: string;

    // Lead Gen Config
    targetLocation: string;
    targetNiche: string;
    idealCompanySize: string;

    // Commitment
    urgency: string;
    referralSource: string;
}

const questions = [
    // === SECTION 1: IDENTITY ===
    {
        id: "businessName",
        section: 1,
        question: "What's your company name?",
        subtext: "We'll personalize your free trial experience",
        type: "text",
        icon: Building,
        placeholder: "e.g., Rencken Consulting"
    },
    {
        id: "contactName",
        section: 1,
        question: "And your name?",
        subtext: "So we know who to talk to",
        type: "text",
        icon: Users,
        placeholder: "e.g., Sam"
    },

    // === SECTION 2: PAIN DISCOVERY ===
    {
        id: "currentMethod",
        section: 2,
        question: "How do you currently find new leads?",
        subtext: "Be honest - we've seen it all",
        type: "select",
        icon: Target,
        options: [
            "Manual Google searching",
            "Referrals only (unpredictable)",
            "Cold calling random businesses",
            "Buying outdated lead lists",
            "I don't have a system (pain)",
            "Other"
        ]
    },
    {
        id: "biggestFrustration",
        section: 2,
        question: "What frustrates you MOST about prospecting?",
        subtext: "This helps us solve the right problem",
        type: "select",
        icon: Zap,
        options: [
            "Takes too much time",
            "Can't find decision-maker contacts",
            "Data is always outdated/wrong",
            "Low response rates",
            "Don't know who to target",
            "All of the above"
        ]
    },
    {
        id: "timeSpentProspecting",
        section: 2,
        question: "How many hours/week do you spend on lead research?",
        subtext: "We'll show you how to get that time back",
        type: "select",
        icon: Clock,
        options: [
            "Less than 2 hours",
            "2-5 hours",
            "5-10 hours",
            "10+ hours (it's killing me)",
            "I've given up"
        ]
    },

    // === SECTION 3: MAGIC OUTCOME ===
    {
        id: "idealOutcome",
        section: 3,
        question: "If we could wave a magic wand, what would success look like?",
        subtext: "Dream big here",
        type: "select",
        icon: Sparkles,
        options: [
            "Wake up to booked meetings",
            "Consistent pipeline of qualified leads",
            "Never research prospects again",
            "10x my outreach without 10x effort",
            "Just make the phone ring"
        ]
    },
    {
        id: "monthlyBudget",
        section: 3,
        question: "What could you invest monthly to solve this problem?",
        subtext: "No pressure - we have plans from R499",
        type: "select",
        icon: DollarSign,
        options: [
            "R0 - Just exploring",
            "R500 - R1,000",
            "R1,000 - R2,500",
            "R2,500+",
            "Whatever gets results"
        ]
    },

    // === SECTION 4: LEAD GEN CONFIG ===
    {
        id: "targetLocation",
        section: 4,
        question: "Where are your ideal clients located?",
        subtext: "We'll target leads in your service area",
        type: "text",
        icon: MapPin,
        placeholder: "e.g., Johannesburg, Sandton, Pretoria"
    },
    {
        id: "targetNiche",
        section: 4,
        question: "What type of businesses do you want to target?",
        subtext: "Be specific - we'll find exactly these",
        type: "text",
        icon: Settings,
        placeholder: "e.g., Commercial Cleaning Companies, Logistics"
    },
    {
        id: "idealCompanySize",
        section: 4,
        question: "What size companies are your ideal clients?",
        subtext: "Helps us filter the right prospects",
        type: "select",
        icon: TrendingUp,
        options: [
            "Small (1-10 employees)",
            "Medium (10-50 employees)",
            "Large (50+ employees)",
            "Enterprise (500+)",
            "Any size that pays"
        ]
    },

    // === SECTION 5: COMMITMENT ===
    {
        id: "email",
        section: 5,
        question: "Where should we send your 25 FREE leads?",
        subtext: "You'll get instant access to your dashboard",
        type: "email",
        icon: Mail,
        placeholder: "you@company.com"
    },
    {
        id: "phone",
        section: 5,
        question: "And your WhatsApp number?",
        subtext: "For instant lead notifications",
        type: "tel",
        icon: Phone,
        placeholder: "+27 82 123 4567"
    },
    {
        id: "urgency",
        section: 5,
        question: "How soon do you need leads?",
        subtext: "We can have you set up in 24 hours",
        type: "select",
        icon: Rocket,
        options: [
            "Yesterday (I'm desperate)",
            "This week",
            "This month",
            "Just exploring for now"
        ]
    }
];

const sectionBreaks = [
    { afterQuestion: 1, title: "Great start! 🎯", message: "Now let's understand your current challenges..." },
    { afterQuestion: 4, title: "We feel you! 💪", message: "Let's design your perfect solution..." },
    { afterQuestion: 6, title: "Almost there! 🚀", message: "Now let's configure your lead machine..." },
    { afterQuestion: 9, title: "Final step! ✨", message: "Let's get your free trial started..." }
];

export function FreeTrialSurvey() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [data, setData] = useState<Partial<FreeTrialData>>({});
    const [showBreak, setShowBreak] = useState(false);
    const [breakContent, setBreakContent] = useState({ title: "", message: "" });
    const [isComplete, setIsComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleNext = async () => {
        const breakPoint = sectionBreaks.find(b => b.afterQuestion === currentQuestion);
        if (breakPoint && !showBreak) {
            setBreakContent(breakPoint);
            setShowBreak(true);
            return;
        }

        setShowBreak(false);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Submit
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        source: 'free_trial_survey',
                        leadGenConfig: {
                            location: data.targetLocation,
                            niche: data.targetNiche,
                            companySize: data.idealCompanySize
                        }
                    })
                });

                if (response.ok) {
                    toast.success("Your free trial is ready!");
                    setIsComplete(true);
                } else {
                    toast.error("Something went wrong. Please try again.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Network error. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
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
        const value = data[question.id as keyof FreeTrialData];
        return value && value.trim() !== "";
    };

    if (isComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">You're All Set, {data.contactName}! 🎉</h1>
                    <p className="text-slate-300 mb-6">
                        Your personalized lead machine is being configured for <strong className="text-white">{data.targetNiche}</strong> in <strong className="text-white">{data.targetLocation}</strong>.
                    </p>

                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-6">
                        <h3 className="text-lg font-bold text-white mb-2">What happens next?</h3>
                        <ul className="text-left text-slate-300 space-y-2 text-sm">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> 25 leads sent to your email</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Dashboard access activated</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> WhatsApp alerts configured</li>
                        </ul>
                    </div>

                    <Button
                        className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-2xl shadow-green-500/30"
                        onClick={() => window.open(`https://wa.me/27000000000?text=Hi! I just signed up for my free trial. My business is ${data.businessName}.`, '_blank')}
                    >
                        <MessageCircle className="mr-2 h-5 w-5" /> Chat With Us on WhatsApp
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Glassmorphism Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question Counter */}
            <div className="fixed top-4 right-6 z-50 rounded-full bg-white/10 backdrop-blur-xl px-4 py-2 text-sm font-medium text-white/80 border border-white/10">
                {currentQuestion + 1} / {questions.length}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <AnimatePresence mode="wait">
                    {showBreak ? (
                        <motion.div
                            key="break"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center max-w-lg"
                        >
                            <h2 className="text-4xl font-bold text-white mb-4">{breakContent.title}</h2>
                            <p className="text-xl text-slate-300">{breakContent.message}</p>
                            <Button
                                onClick={handleNext}
                                className="mt-8 h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-bold"
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
                            {/* Glassmorphism Card */}
                            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                {/* Icon */}
                                <div className="mb-6 flex justify-center">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                        <question.icon className="h-8 w-8 text-white" />
                                    </div>
                                </div>

                                <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
                                    {question.question}
                                </h2>
                                <p className="text-center text-slate-400 mb-8">{question.subtext}</p>

                                {/* Input Area */}
                                {question.type === "select" ? (
                                    <div className="grid gap-3">
                                        {question.options?.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleInputChange(option)}
                                                className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${data[question.id as keyof FreeTrialData] === option
                                                        ? "border-purple-500 bg-purple-500/20 text-white"
                                                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{option}</span>
                                                    {data[question.id as keyof FreeTrialData] === option && (
                                                        <CheckCircle2 className="h-5 w-5 text-purple-400" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={question.type}
                                        placeholder={question.placeholder}
                                        value={data[question.id as keyof FreeTrialData] || ""}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && isCurrentAnswered() && handleNext()}
                                        className="w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-lg font-medium text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                                    />
                                )}

                                {/* Navigation */}
                                <div className="mt-8 flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        onClick={handleBack}
                                        className={`text-slate-400 hover:text-white ${currentQuestion === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!isCurrentAnswered() || isSubmitting}
                                        className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Processing..." : currentQuestion === questions.length - 1 ? "Get My Free Leads" : "Next"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trust Footer */}
            <div className="p-6 text-center text-sm text-slate-500 relative z-10">
                🔒 Your information is secure and will never be shared.
            </div>
        </div>
    );
}
