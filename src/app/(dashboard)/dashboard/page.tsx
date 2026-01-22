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
    Search,
    LayoutDashboard,
    ListTodo,
    Calendar,
    Settings,
    LogOut,
    Plus
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
                .limit(4);

            if (recentLeads) setLeads(recentLeads);
            if (hotLeadsData) setHotLeads(hotLeadsData);

            setStats({
                leadsToday: todayCount || 0,
                leadsTotal: totalCount || 0,
                hotLeadsCount: hotCount || 0,
                pipelineValue: (hotCount || 0) * 15000,
                conversionRate: totalCount ? Math.round((hotCount || 0) / totalCount * 100) : 0,
            });

            setLoading(false);
        };

        fetchData();

        // Realtime logs simulation
        let logIndex = 0;
        const logInterval = setInterval(() => {
            setLogs((prev) => [LOG_STREAM[logIndex % LOG_STREAM.length], ...prev].slice(0, 8));
            logIndex++;
        }, 4000);

        // Realtime leads subscription
        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    setLeads(prev => [payload.new, ...prev].slice(0, 4));
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
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-green-100">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col border-r border-slate-200 bg-white px-6 py-6 lg:flex z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
                <Link href="/" className="flex items-center gap-3 mb-10 px-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-xl shadow-green-200">
                        <Image src={assetPath("/logo.png")} alt="Kasi AI" width={40} height={40} className="h-full w-full object-cover p-1 opacity-95 text-white filter brightness-0 invert" />
                    </div>
                    <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900">Kasi AI</span>
                </Link>

                <div className="mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</div>
                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3.5 text-sm font-semibold text-green-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </div>
                    </Link>
                    <Link href="/dashboard/leads" className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-5 w-5" />
                            Leads
                        </div>
                    </Link>
                    <Link href="/dashboard/campaigns" className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5" />
                            Campaigns
                        </div>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5" />
                            Analytics
                        </div>
                    </Link>
                    <Link href="/dashboard/team" className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5" />
                            Team
                        </div>
                    </Link>
                </nav>

                <div className="mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-8">General</div>
                <nav className="space-y-1">
                    <Link href="/dashboard/settings" className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5" />
                            Settings
                        </div>
                    </Link>
                    <button className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                        <div className="flex items-center gap-3">
                            <LogOut className="h-5 w-5" />
                            Logout
                        </div>
                    </button>
                </nav>

                <div className="mt-8 rounded-2xl bg-slate-900 p-5 text-white relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-gradient-to-br from-green-500/30 to-blue-500/30 blur-[40px] group-hover:blur-[60px] transition-all" />
                    <div className="relative z-10">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center mb-3">
                            <Phone className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-1">Mobile App</h4>
                        <p className="text-xs text-slate-400 mb-3">Get easy access on the go.</p>
                        <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white border-0 font-semibold rounded-lg">Download</Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72">
                {/* Top Header */}
                <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-transparent bg-[#F8F9FA]/80 backdrop-blur-md px-8 py-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search leads, campaigns..."
                                className="h-12 w-full rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">⌘ F</div>
                        </div>
                        <Button variant="ghost" className="lg:hidden">
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                            </span>
                            <span className="text-xs font-bold text-green-700">System Online</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 text-slate-500 relative">
                                <Mail className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-[#F8F9FA]" />
                            </Button>
                            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                                <Image src={assetPath("/kasi_hero_man_2_1768835329601.png")} width={40} height={40} alt="User" />
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-slate-900">Sam U.</p>
                                <p className="text-xs text-slate-500">admin@kasi.ai</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-outfit text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
                            <p className="text-lg text-slate-500">Plan, prioritize, and accomplish your revenue goals.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button size="lg" className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20 px-6">
                                <Plus className="mr-2 h-4 w-4" /> Add Lead
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-sm px-6">
                                <Zap className="mr-2 h-4 w-4 text-orange-500" /> Run Scraper
                            </Button>
                        </div>
                    </div>

                    {/* KPI Cards (3D Icons) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Card 1: Revenue (Green Theme) */}
                        <ScrollReveal>
                            <div className="relative overflow-hidden rounded-[24px] bg-[#064E3B] p-6 shadow-xl shadow-green-900/20 text-white h-full min-h-[180px] flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1">
                                <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />

                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <p className="font-medium text-green-200 mb-1">Pipeline Value</p>
                                        <h3 className="text-3xl font-bold tracking-tight">R{stats.pipelineValue.toLocaleString()}</h3>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <ArrowUpRight className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Badge className="bg-green-500 text-white border-0 px-2 py-0.5">+12%</Badge>
                                    <span className="text-sm text-green-200">from last month</span>
                                </div>
                                {/* 3D Icon Overlay */}
                                <div className="absolute bottom-[-10px] right-[-10px] w-24 h-24 opacity-20 pointer-events-none grayscale invert">
                                    {/* Placeholder for 3D graphic if needed, or keeping it clean */}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Card 2: Total Leads (White) */}
                        <ScrollReveal delay={0.1}>
                            <div className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full min-h-[180px] flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-slate-500 mb-1">Total Leads</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.leadsTotal}</h3>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-slate-600" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Badge className="bg-green-100 text-green-700 border-0 px-2 py-0.5">+{stats.leadsToday}</Badge>
                                    <span className="text-sm text-slate-400">new today</span>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Card 3: Hot Leads (White) */}
                        <ScrollReveal delay={0.2}>
                            <div className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full min-h-[180px] flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-slate-500 mb-1">Hot Leads</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.hotLeadsCount}</h3>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Flame className="h-5 w-5 text-orange-500" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Badge className="bg-orange-100 text-orange-700 border-0 px-2 py-0.5">Score 70+</Badge>
                                    <span className="text-sm text-slate-400">high intent</span>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Card 4: Actions (White + 3D) */}
                        <ScrollReveal delay={0.3}>
                            <div className="relative overflow-hidden rounded-[24px] bg-white p-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full min-h-[180px] border border-slate-100 group">
                                <div className="p-6 h-full flex flex-col justify-between relative z-10">
                                    <div>
                                        <p className="font-medium text-slate-500 mb-1">Pending Actions</p>
                                        <h3 className="text-3xl font-bold text-slate-900">2</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <Badge className="bg-blue-100 text-blue-700 border-0 px-2 py-0.5">Urgent</Badge>
                                        <span className="text-sm text-slate-400">call schedule</span>
                                    </div>
                                </div>
                                {/* 3D Phone Icon */}
                                <div className="absolute -right-2 -bottom-4 w-32 h-32 opacity-100 transition-transform group-hover:scale-110 duration-500">
                                    <Image src={assetPath("/icon_phone_3d.png")} width={128} height={128} alt="Phone" className="object-contain drop-shadow-2xl" />
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Chart/Analytics Section Replacement: Project Analytics */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900">Lead Analytics</h3>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-green-500/30">W</div>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">M</div>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between h-48 gap-4 px-4">
                                    {[65, 45, 75, 55, 85, 95, 60].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                            <div className="relative w-full max-w-[40px] bg-slate-100 rounded-[12px] h-full overflow-hidden">
                                                <div
                                                    className={`absolute bottom-0 left-0 w-full rounded-[12px] bg-slate-900 transition-all duration-1000 ${i === 4 ? 'bg-[#064E3B]' : 'bg-slate-800'}`}
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Collaboration / Logs Section */}
                            <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">System Logs</h3>
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs font-bold border-slate-200 text-slate-600">
                                        + Add Member
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    <AnimatePresence mode="popLayout">
                                        {logs.map((log, i) => (
                                            <motion.div
                                                key={`${log}-${i}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${log.includes('SUCCESS') ? 'bg-green-100 text-green-600' :
                                                            log.includes('EXTRACT') ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                                        }`}>
                                                        {log.includes('SUCCESS') ? <CheckCircle2 className="h-5 w-5" /> :
                                                            log.includes('EXTRACT') ? <Users className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{log}</p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <span>System Auto-Agent</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.includes('SUCCESS') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>{log.includes('SUCCESS') ? 'Completed' : 'Pending'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Hot Leads */}
                        <div className="space-y-6">
                            <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Hot Leads</h3>
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs font-bold border-slate-200">
                                        + New
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {hotLeads.map((lead, i) => (
                                            <motion.div
                                                key={lead.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group rounded-2xl p-4 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                                                            {lead.business_name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{lead.business_name}</h4>
                                                            <p className="text-xs text-slate-400">Score: {lead.score}</p>
                                                        </div>
                                                    </div>
                                                    {/* 3D WhatsApp Button Mini */}
                                                    <button
                                                        onClick={() => handleContact(lead, 'whatsapp')}
                                                        className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors group/btn"
                                                    >
                                                        <Image src={assetPath("/icon_whatsapp_3d.png")} width={20} height={20} alt="WA" className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 pl-[52px]">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-lg text-[10px] font-medium border-0 px-2">High Intent</Badge>
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-lg text-[10px] font-medium border-0 px-2">{lead.address ? 'Local' : 'Remote'}</Badge>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {hotLeads.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-sm">
                                            No hot leads yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Revenue 3D Card */}
                            <div className="relative overflow-hidden rounded-[32px] bg-[#111827] p-8 shadow-xl text-white">
                                <div className="relative z-10">
                                    <p className="font-medium text-slate-400 mb-2">Total Revenue Goal</p>
                                    <h3 className="text-3xl font-bold tracking-tight mb-8">R1,000,000</h3>

                                    <div className="flex items-center gap-4">
                                        <button className="h-12 w-12 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform">
                                            <span className="sr-only">Play</span>
                                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-slate-900 border-b-[6px] border-b-transparent ml-1"></div>
                                        </button>
                                        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                            <div className="h-4 w-4 bg-white rounded-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* 3D Revenue Icon Absolute */}
                                <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40">
                                    <Image src={assetPath("/icon_revenue_3d.png")} width={160} height={160} alt="Revenue" className="object-cover drop-shadow-2xl opacity-90" />
                                </div>
                                {/* Background Mesh */}
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/40 via-[#111827] to-[#111827]" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
