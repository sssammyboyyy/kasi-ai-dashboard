"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { LOG_STREAM } from "@/data/mock-leads";
import { Footer } from "@/components/ui/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assetPath } from "@/lib/basePath";
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
    Brain,
    Flame,
    DollarSign,
    Target,
    BarChart3,
    Rocket
} from "lucide-react";
import { ServiceUpsellCard } from "@/components/dashboard/ServiceUpsellCard";
import { LeadTeaser } from "@/components/dashboard/LeadTeaser";

export default function DashboardPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [hotLeads, setHotLeads] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        leadsToday: 0,
        leadsTotal: 0,
        hotLeadsCount: 0,
        pipelineValue: 0,
        conversionRate: 0,
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get today's count
            const { count: todayCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            // Get total count
            const { count: totalCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true });

            // Get hot leads (score >= 70)
            const { data: hotLeadsData, count: hotCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact' })
                .gte('score', 70)
                .order('score', { ascending: false })
                .limit(5);

            // Get recent leads
            const { data: recentLeads } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(8);

            if (recentLeads) setLeads(recentLeads);
            if (hotLeadsData) setHotLeads(hotLeadsData);

            setStats({
                leadsToday: todayCount || 0,
                leadsTotal: totalCount || 0,
                hotLeadsCount: hotCount || 0,
                pipelineValue: (hotCount || 0) * 15000, // Estimated R15k per hot lead
                conversionRate: totalCount ? Math.round((hotCount || 0) / totalCount * 100) : 0,
            });

            setLoading(false);
        };

        fetchData();

        // Realtime logs simulation
        let logIndex = 0;
        const logInterval = setInterval(() => {
            setLogs((prev) => [LOG_STREAM[logIndex % LOG_STREAM.length], ...prev].slice(0, 15));
            logIndex++;
        }, 3000);

        // Realtime leads subscription
        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    setLeads(prev => [payload.new, ...prev].slice(0, 8));
                    setStats(prev => ({
                        ...prev,
                        leadsToday: prev.leadsToday + 1,
                        leadsTotal: prev.leadsTotal + 1,
                    }));
                }
            )
            .subscribe();

        return () => {
            clearInterval(logInterval);
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 font-sans">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src={assetPath("/logo.png")} alt="Kasi AI" width={180} height={60} className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                            </span>
                            <span className="text-sm font-medium text-green-400">System Online</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                            <Rocket className="mr-1 h-3 w-3" /> God Mode
                        </Badge>
                    </div>
                </div>
            </nav>

            {/* Revenue Command Center */}
            <ScrollReveal>
                <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 py-8">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Revenue Command Center
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {/* Pipeline Value */}
                            <div className="col-span-2 md:col-span-1">
                                <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-green-400" />
                                        <span className="text-xs text-slate-400">Pipeline Value</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-400">
                                        R{stats.pipelineValue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Estimated from hot leads</p>
                                </div>
                            </div>

                            {/* Total Leads */}
                            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-5 w-5 text-blue-400" />
                                    <span className="text-xs text-slate-400">Total Leads</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.leadsTotal}</p>
                                <p className="text-xs text-green-400 mt-1">+{stats.leadsToday} today</p>
                            </div>

                            {/* Hot Leads */}
                            <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="h-5 w-5 text-orange-400" />
                                    <span className="text-xs text-slate-400">Hot Leads</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-400">{stats.hotLeadsCount}</p>
                                <p className="text-xs text-slate-500 mt-1">Score 70+</p>
                            </div>

                            {/* Conversion Rate */}
                            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-purple-400" />
                                    <span className="text-xs text-slate-400">Hot Rate</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
                                <p className="text-xs text-slate-500 mt-1">Leads → Hot</p>
                            </div>

                            {/* AI Agents */}
                            <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-5 w-5 text-purple-400" />
                                    <span className="text-xs text-slate-400">AI Agents</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">5</p>
                                <p className="text-xs text-green-400 mt-1">All systems go</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Hot Leads Priority (Left) */}
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-white">
                                <Flame className="h-5 w-5 text-orange-500" />
                                Hot Leads
                            </h2>
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                Priority
                            </Badge>
                        </div>

                        <Card className="bg-slate-800/50 border-slate-700 p-0">
                            <div className="divide-y divide-slate-700">
                                {hotLeads.map((lead) => (
                                    <div key={lead.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-white">{lead.business_name}</h3>
                                                <p className="text-xs text-slate-400">{lead.address}</p>
                                            </div>
                                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                                {lead.score}%
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                            {lead.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {lead.email}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-xs">
                                                <MessageSquare className="mr-1 h-3 w-3" /> WhatsApp
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs">
                                                <Phone className="mr-1 h-3 w-3" /> Call
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {hotLeads.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        <Flame className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>No hot leads yet</p>
                                        <p className="text-xs">Scrapers are building your pipeline</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Activity Feed */}
                        <div className="mt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-white">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Activity Feed
                                </h2>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    Live
                                </Badge>
                            </div>

                            <Card className="max-h-[300px] overflow-hidden bg-slate-800/50 border-slate-700 p-0">
                                <div className="divide-y divide-slate-700">
                                    <AnimatePresence mode="popLayout">
                                        {logs.slice(0, 8).map((log, i) => (
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
                                                            "bg-slate-500"
                                                    }`} />
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-300">{log}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
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
                    </div>

                    {/* All Leads (Right) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-white">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Recent Leads
                                </h2>
                                <Link href="/leads" className="text-sm font-medium text-blue-400 hover:underline">
                                    View All →
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
                                            <Card className="bg-slate-800/50 border-slate-700 p-5 transition-all hover:border-blue-500/50 hover:bg-slate-700/50">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-white">{lead.business_name}</h3>
                                                        <p className="text-sm text-slate-400">{lead.niche} • {lead.address}</p>
                                                    </div>
                                                    <Badge className={`${lead.score >= 90 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                        lead.score >= 70 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                                            "bg-slate-600 text-slate-300"
                                                        }`}>
                                                        {lead.score}%
                                                    </Badge>
                                                </div>

                                                <div className="mb-4 space-y-2 text-sm">
                                                    {lead.email && (
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Mail className="h-4 w-4 text-slate-500" />
                                                            <span className="truncate">{lead.email}</span>
                                                        </div>
                                                    )}
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Phone className="h-4 w-4 text-slate-500" />
                                                            <span>{lead.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const text = `Hello ${lead.business_name}, I saw your business on Google Maps and I have a free lead for you. are you taking on new work?`;
                                                            window.open(`https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`, '_blank');

                                                            // Optimistic Update
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));
                                                            setHotLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));
                                                            setStats(prev => ({ ...prev, leadsToday: prev.leadsToday })); // Force re-render if needed

                                                            // DB Update
                                                            supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id).then();
                                                        }}
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                    >
                                                        <MessageSquare className="mr-1 h-4 w-4" />
                                                        WhatsApp
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            window.open(`tel:${lead.phone}`, '_self');
                                                            // Optimistic Update
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));
                                                            setHotLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));

                                                            // DB Update
                                                            supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id).then();
                                                        }}
                                                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                                    >
                                                        Call
                                                        <ArrowUpRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {leads.length === 0 && (
                                    <div className="col-span-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 text-slate-500">
                                        <div className="text-center">
                                            <Zap className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                                            <p>Initializing extraction...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
