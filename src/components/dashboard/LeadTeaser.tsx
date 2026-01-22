"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, TrendingUp, CheckCircle2, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { OnboardingSurvey } from "./OnboardingSurvey";

export function LeadTeaser() {
    const [isHovered, setIsHovered] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLeads = async () => {
            // Fetch high-scoring leads from the 'leads' table
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('score', { ascending: false }) // Get the best ones
                .limit(5);

            if (data) setLeads(data);
            setLoading(false);
        };

        fetchLeads();
    }, []);

    const handleClaimClick = () => {
        setShowSurvey(true);
    };

    const handleUnlock = () => {
        setIsUnlocked(true);
        toast.success("25 Leads Unlocked!", {
            description: "These contacts have been added to your CRM."
        });
    };

    return (
        <Card className="relative overflow-hidden border-0 bg-transparent shadow-2xl transition-all duration-500">
            {/* Glassmorphism Background with SA Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/95 backdrop-blur-xl" />

            {/* Subtle Flag Glow */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-green-600/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="relative z-10 p-6 sm:p-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                                Intelligence Engine
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            High-Value Opportunities
                        </h2>
                        <p className="mt-2 text-gray-400">
                            We found <span className="text-white font-semibold">{leads.length > 0 ? '50+' : '...'} Corporate Contracts</span> matching your ICP.
                        </p>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 px-3 py-1">
                        <TrendingUp className="mr-2 h-3 w-3" />
                        Live Feed
                    </Badge>
                </div>

                {/* Pipeline Value */}
                <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Estimated Pipeline Value</p>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white tracking-tight">R 2,500,000</span>
                        <span className="text-sm font-medium text-green-400">+12% vs last week</span>
                    </div>
                </div>

                {/* Leads List */}
                <div className="space-y-3 mb-8 min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : leads.map((lead, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={lead.id || i}
                            className="group flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-200">{lead.business_name || "Unknown Company"}</p>
                                    <p className="text-xs text-gray-500">
                                        {lead.niche || "Commercial"} • {lead.address ? lead.address.split(',')[0] : 'South Africa'}
                                    </p>
                                </div>
                            </div>

                            {/* The Blur / Reveal Effect */}
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col gap-1 select-none">
                                    {isUnlocked ? (
                                        <div className="flex flex-col text-right">
                                            <span className="text-sm text-white font-mono">{lead.phone || "No Phone"}</span>
                                            <span className="text-xs text-gray-400">{lead.email || "No Email"}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-2 w-24 rounded bg-gray-600/50 blur-[4px]" />
                                            <div className="h-2 w-16 rounded bg-gray-600/50 blur-[4px]" />
                                        </>
                                    )}
                                </div>
                                <div className="text-right hidden sm:block">
                                    <Badge className={`${lead.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'} border-0`}>
                                        {lead.score || 50}% Match
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Fade Out Overlay (Removed when unlocked) */}
                    {!isUnlocked && (
                        <div className="absolute bottom-24 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
                    )}
                </div>

                {/* CTA */}
                {!isUnlocked && (
                    <div className="relative z-20 mx-auto max-w-md text-center">
                        <Button
                            size="lg"
                            onClick={handleClaimClick}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold border-0 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <Lock className={`mr-2 h-4 w-4 transition-all ${isHovered ? 'opacity-0 -translate-y-2' : 'opacity-100'}`} />
                            <span className="relative">
                                Claim First 25 Leads
                                {isHovered && (
                                    <span className="absolute -right-6 top-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                    </span>
                                )}
                            </span>
                        </Button>
                        <p className="mt-3 text-xs text-gray-500">
                            Instant access. No credit card required.
                        </p>
                    </div>
                )}
            </div>

            <OnboardingSurvey
                open={showSurvey}
                onOpenChange={setShowSurvey}
                onComplete={handleUnlock}
            />
        </Card>
    );
}
