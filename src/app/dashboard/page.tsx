"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_LEADS, LOG_STREAM, Lead } from "@/data/mock-leads";
import { Footer } from "@/components/ui/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Users,
    TrendingUp,
    Zap,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    Clock,
    Mail,
    Phone,
} from "lucide-react";

export default function DashboardPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        leadsToday: 0,
        responseRate: 87,
        activeCampaigns: 3,
    });

    useEffect(() => {
        // Simulate incoming leads
        const leadInterval = setInterval(() => {
            const randomLead = MOCK_LEADS[Math.floor(Math.random() * MOCK_LEADS.length)];
            setLeads((prev) => [{ ...randomLead, id: Date.now().toString() }, ...prev].slice(0, 8));
            setStats((prev) => ({ ...prev, leadsToday: prev.leadsToday + 1 }));
        }, 4000);

        // Simulate log stream
        let logIndex = 0;
        const logInterval = setInterval(() => {
            setLogs((prev) => [LOG_STREAM[logIndex % LOG_STREAM.length], ...prev].slice(0, 15));
            logIndex++;
        }, 1200);

        return () => {
            clearInterval(leadInterval);
            clearInterval(logInterval);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Kasi AI" width={180} height={60} className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                            </span>
                            <span className="text-sm font-medium text-green-600">Live Extraction</span>
                        </div>
                        <Link href="/pricing">
                            <Button variant="outline" size="sm">Upgrade Plan</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Stats Bar */}
            <ScrollReveal>
                <div className="border-b border-gray-100 bg-white py-6">
                    <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.leadsToday}</p>
                                <p className="text-sm text-gray-500">Leads Today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                                <p className="text-sm text-gray-500">Response Rate</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                                <Zap className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
                                <p className="text-sm text-gray-500">Active Campaigns</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Activity Feed (Left) */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-gray-900">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Activity Feed
                            </h2>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                Live
                            </Badge>
                        </div>

                        <Card className="max-h-[600px] overflow-hidden border-gray-200 p-0">
                            <div className="divide-y divide-gray-100">
                                <AnimatePresence mode="popLayout">
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={`${log}-${i}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-start gap-3 px-4 py-3"
                                        >
                                            <div className={`mt-1 h-2 w-2 rounded-full ${log.includes("SUCCESS") ? "bg-green-500" :
                                                    log.includes("EXTRACT") ? "bg-blue-500" :
                                                        log.includes("ENRICH") ? "bg-purple-500" :
                                                            "bg-gray-400"
                                                }`} />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">{log}</p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    <Clock className="mr-1 inline h-3 w-3" />
                                                    Just now
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </div>

                    {/* Qualified Leads (Right) */}
                    <div className="lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-gray-900">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Qualified Leads
                            </h2>
                            <Link href="/pricing" className="text-sm font-medium text-blue-600 hover:underline">
                                Export All →
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <AnimatePresence mode="popLayout">
                                {leads.map((lead) => (
                                    <motion.div
                                        key={lead.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    >
                                        <Card className="border-gray-200 p-5 transition-all hover:border-blue-200 hover:shadow-md">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{lead.businessName}</h3>
                                                    <p className="text-sm text-gray-500">{lead.niche} • {lead.location}</p>
                                                </div>
                                                <Badge className={`${lead.leadScore >= 90 ? "bg-green-100 text-green-700" :
                                                        lead.leadScore >= 80 ? "bg-blue-100 text-blue-700" :
                                                            "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {lead.leadScore}%
                                                </Badge>
                                            </div>

                                            <div className="mb-4 space-y-2 text-sm">
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="truncate">{lead.email}</span>
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                                    <MessageSquare className="mr-1 h-4 w-4" />
                                                    WhatsApp
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    Details
                                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {leads.length === 0 && (
                                <div className="col-span-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
                                    <div className="text-center">
                                        <Zap className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                        <p>Initializing extraction...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
