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
import { Badge } from "@/components/ui/badge";
import { assetPath } from "@/lib/basePath";
import { toast } from "sonner";
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
    Rocket,
    Menu,
    Search
} from "lucide-react";

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

    const handleContact = (lead: any, channel: 'whatsapp' | 'call') => {
        let url = '';
        if (channel === 'whatsapp') {
            const text = `Hello ${lead.business_name}, I saw your business on Google Maps and I have a free lead for you. Are you taking on new work?`;
            url = `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
        } else if (channel === 'call') {
            url = `tel:${lead.phone}`;
        }

        if (url) window.open(url, channel === 'call' ? '_self' : '_blank');

        // Optimistic Update
        const updateStatus = (list: any[]) => list.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l);
        setLeads(updateStatus);
        setHotLeads(updateStatus);

        // Database Update
        supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id).then();
        toast.success(`Contacted ${lead.business_name} via ${channel === 'whatsapp' ? 'WhatsApp' : 'Phone'}`);
    };

    return (
        <main className="min-h-screen bg-[#000000] text-white font-sans selection:bg-blue-500/30">
            {/* Ambient Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Navigation (Glass) */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                                <Image src={assetPath("/logo.png")} alt="Kasi AI" width={32} height={32} className="h-full w-full object-cover opacity-90" />
                            </div>
                            <span className="font-outfit text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">Kasi AI</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
                            <Link href="/dashboard" className="text-white">Dashboard</Link>
                            <Link href="/dashboard/leads" className="hover:text-white transition-colors">Leads</Link>
                            <Link href="/dashboard/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                            </span>
                            <span className="text-xs font-medium text-green-400">System Online</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all cursor-pointer">
                            <Rocket className="mr-1.5 h-3 w-3" /> God Mode
                        </Badge>
                        <Button size="icon" variant="ghost" className="md:hidden text-white/70">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 mx-auto max-w-[1400px] p-6 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                            Command Center
                        </h1>
                        <p className="mt-2 text-lg text-white/50">
                            Live operational intelligence and revenue tracking.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
                            <Clock className="mr-2 h-4 w-4" /> Today
                        </Button>
                        <Button className="bg-[#fff] text-black hover:bg-white/90 shadow-xl shadow-white/10">
                            <Zap className="mr-2 h-4 w-4 fill-black" /> Run Scraper
                        </Button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Pipeline Value", value: `R${stats.pipelineValue.toLocaleString()}`, sub: "Based on hot leads", icon: DollarSign, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/5", border: "border-green-500/20" },
                        { label: "Total Leads", value: stats.leadsTotal, sub: `+${stats.leadsToday} today`, icon: Users, color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/5", border: "border-blue-500/20" },
                        { label: "Hot Leads", value: stats.hotLeadsCount, sub: "Score 70+", icon: Flame, color: "text-orange-400", bg: "from-orange-500/20 to-red-500/5", border: "border-orange-500/20" },
                        { label: "AI Agents", value: "5", sub: "Active & Hunting", icon: Brain, color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/5", border: "border-purple-500/20" },
                    ].map((stat, i) => (
                        <ScrollReveal key={i} delay={i * 0.1}>
                            <div className={`relative overflow-hidden rounded-3xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-6 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-2xl`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-white/20" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                    <p className="text-sm font-medium text-white/50">{stat.label}</p>
                                    <p className={`text-xs ${stat.color} font-mono mt-2`}>{stat.sub}</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Hot Leads Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Flame className="h-5 w-5 text-orange-500" />
                                Hot Leads
                            </h2>
                            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">Priority</Badge>
                        </div>

                        <div className="space-y-4">
                            {hotLeads.map((lead, i) => (
                                <ScrollReveal key={lead.id} delay={i * 0.05}>
                                    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-orange-500/30">
                                        <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Badge className="bg-orange-500/20 text-orange-400 border-0">{lead.score}%</Badge>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg leading-tight">{lead.business_name}</h3>
                                            <p className="text-sm text-white/50 mt-1">{lead.niche || "Unknown Niche"}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleContact(lead, 'whatsapp')}
                                                className="flex-1 bg-green-600/20 hover:bg-green-600 hover:text-white text-green-400 border border-green-600/30 transition-all"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                                            </Button>
                                            <Button
                                                onClick={() => handleContact(lead, 'call')}
                                                variant="outline"
                                                className="flex-1 border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
                                            >
                                                <Phone className="h-4 w-4 mr-2" /> Call
                                            </Button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                            {hotLeads.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/30">
                                    <Flame className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                    <p>No hot leads found yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity Mini Feed */}
                        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-white/50 mb-4 uppercase tracking-wider">System Activity</h3>
                            <div className="space-y-4 max-h-[300px] overflow-hidden mask-fade-bottom">
                                <AnimatePresence mode="popLayout">
                                    {logs.slice(0, 6).map((log, i) => (
                                        <motion.div
                                            key={`${log}-${i}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-3 text-sm"
                                        >
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <p className="text-white/70 leading-relaxed font-mono text-xs">{log}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Recent Leads
                            </h2>
                            <Link href="/dashboard/leads">
                                <Button variant="ghost" className="text-white/50 hover:text-white">View All <ArrowUpRight className="ml-1 h-4 w-4" /></Button>
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {leads.map((lead, i) => (
                                <ScrollReveal key={lead.id} delay={i * 0.05}>
                                    <div className="group h-full flex flex-col justify-between rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/10 hover:shadow-2xl">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white/50 text-sm">
                                                    {lead.business_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <Badge className={`border-0 ${lead.score >= 70 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {lead.score}%
                                                </Badge>
                                            </div>

                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{lead.business_name}</h3>
                                            <p className="text-sm text-white/50 mb-4 line-clamp-1">{lead.address}</p>

                                            <div className="space-y-2 mb-6">
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                                        <Phone className="h-3 w-3" /> {lead.phone}
                                                    </div>
                                                )}
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                                        <Mail className="h-3 w-3" /> {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <Button
                                                onClick={() => handleContact(lead, 'whatsapp')}
                                                size="sm"
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/5"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleContact(lead, 'call')}
                                                size="sm"
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/5"
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
