"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { LOG_STREAM } from "@/data/mock-leads";
import { assetPath } from "@/lib/basePath";
import { toast } from "sonner";
import {
    Activity,
    Users,
    Zap,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    Clock,
    Mail,
    Phone,
    Flame,
    Hash,
    Terminal,
    Play,
    Pause,
    X,
    Check,
    Edit2,
    Filter,
    Search,
    ChevronDown,
    LayoutGrid,
    Settings,
    LogOut,
    Target
} from "lucide-react";

// --- Components (Simulating Tremor/Shadcn) ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
        {children}
    </div>
);

const Metric = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-2xl font-semibold tracking-tight text-slate-900 ${className}`}>
        {children}
    </p>
);

const Text = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-slate-500 ${className}`}>
        {children}
    </p>
);

const Badge = ({ children, color = "slate" }: { children: React.ReactNode; color?: string }) => {
    const colors: Record<string, string> = {
        slate: "bg-slate-100 text-slate-700",
        green: "bg-emerald-100 text-emerald-700",
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-800",
        red: "bg-red-100 text-red-700",
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-black/5 ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

const ProcessBar = ({ value, color = "blue" }: { value: number; color?: string }) => {
    const colors: Record<string, string> = {
        blue: "bg-blue-600",
        emerald: "bg-emerald-600",
        orange: "bg-orange-600",
        slate: "bg-slate-900"
    };
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${value}%` }} />
        </div>
    );
};

const ConsoleLog = ({ logs }: { logs: string[] }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="flex h-full flex-col bg-[#0f172a] font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#1e293b] px-3 py-2">
                <span className="flex items-center gap-2 font-bold text-emerald-400">
                    <Terminal className="h-3 w-3" />
                    SWARM_CONTROLLER_V2
                </span>
                <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/20" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/20" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.map((log, i) => (
                    <div key={i} className={`border-l-2 pl-2 ${log.includes("SUCCESS") ? "border-emerald-500 text-emerald-400" :
                            log.includes("EXTRACT") ? "border-blue-500 text-blue-300" :
                                log.includes("ERROR") ? "border-red-500 text-red-400" :
                                    "border-slate-700 text-slate-400"
                        }`}>
                        <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        {log}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="border-t border-slate-800 bg-[#1e293b] px-3 py-2">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500">➜</span>
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [hotLeads, setHotLeads] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [targetCity, setTargetCity] = useState("Johannesburg");
    const [targetNiche, setTargetNiche] = useState("Accounting Firms");
    const [isScraping, setIsScraping] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        scraped: 489,
        valid: 350,
        sent: 200,
        opened: 150,
        replied: 5,
        pipeline: 6690000
    });

    const supabase = createClient();

    // Data Fetching
    useEffect(() => {
        const fetchLeads = async () => {
            // Get hot leads (score >= 70) for "Kill Queue"
            const { data: hotLeadsData } = await supabase
                .from('leads')
                .select('*')
                .gte('score', 70)
                .is('status', null) // Only new ones
                .order('score', { ascending: false })
                .limit(20);

            if (hotLeadsData) setHotLeads(hotLeadsData);
        };
        fetchLeads();
    }, []);

    // Simulated Log Stream
    useEffect(() => {
        if (!isScraping) return;
        const interval = setInterval(() => {
            const randomLog = LOG_STREAM[Math.floor(Math.random() * LOG_STREAM.length)];
            setLogs(prev => [...prev, randomLog].slice(-50));
            // Simulate Metric Updates
            if (randomLog.includes("SUCCESS")) setStats(p => ({ ...p, scraped: p.scraped + 1 }));
            if (randomLog.includes("ENRICH")) setStats(p => ({ ...p, valid: p.valid + 1 }));
        }, 800);
        return () => clearInterval(interval);
    }, [isScraping]);

    const handleApprove = async (id: string) => {
        // Optimistic Remove
        setHotLeads(prev => prev.filter(l => l.id !== id));
        toast.success("Lead Approved & Sequence Started");
        // DB Update
        await supabase.from('leads').update({ status: 'contacted' }).eq('id', id);
    };

    const handleDiscard = async (id: string) => {
        setHotLeads(prev => prev.filter(l => l.id !== id));
        toast("Lead Discarded");
        // DB Update (e.g., status = 'archived')
        await supabase.from('leads').update({ status: 'archived' }).eq('id', id);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center">
                            <Zap className="h-4 w-4 text-white fill-white" />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight">Kasi.OS</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <nav className="flex items-center gap-1 text-sm font-medium text-slate-500">
                        <Link href="/dashboard" className="px-3 py-1.5 bg-slate-100 text-slate-900 rounded-md">Command</Link>
                        <Link href="/dashboard/leads" className="px-3 py-1.5 hover:text-slate-900">Database</Link>
                        <Link href="/dashboard/campaigns" className="px-3 py-1.5 hover:text-slate-900">Campaigns</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        SYSTEM ONLINE
                    </span>
                    <div className="h-8 w-8 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden">
                        <Image src={assetPath("/kasi_hero_man_2_1768835329601.png")} width={32} height={32} alt="User" />
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-[1600px] mx-auto space-y-4">

                {/* 1. KPI Grid (Top Row) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Revenue */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <Text>Pipeline Value</Text>
                        <Metric>R {stats.pipeline.toLocaleString()}</Metric>
                        <div className="mt-2 flex items-center text-xs font-medium text-emerald-600">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            12% vs last month
                        </div>
                    </Card>

                    {/* Efficiency */}
                    <Card className="border-l-4 border-l-blue-500">
                        <Text>System Efficiency</Text>
                        <Metric>89%</Metric>
                        <div className="mt-2 text-xs text-slate-400 flex justify-between mb-1">
                            <span>Deliverability</span>
                            <span>High</span>
                        </div>
                        <ProcessBar value={89} color="blue" />
                    </Card>

                    {/* Active Targets */}
                    <Card className="border-l-4 border-l-slate-700">
                        <Text>Active Swarm Agents</Text>
                        <Metric>12 / 20</Metric>
                        <div className="mt-2 text-xs text-slate-400 flex justify-between mb-1">
                            <span>Capacity</span>
                            <span>60%</span>
                        </div>
                        <ProcessBar value={60} color="slate" />
                    </Card>

                    {/* Pending Actions */}
                    <Card className="bg-amber-50 border border-amber-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <Text className="text-amber-700">Action Required</Text>
                                <Metric className="text-amber-900">{hotLeads.length} Leads</Metric>
                            </div>
                            <div className="rounded-md bg-amber-100 p-2">
                                <Flame className="h-5 w-5 text-amber-600 fill-amber-600" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-amber-600 font-medium">Awaiting manual approval</p>
                    </Card>
                </div>

                {/* 2. Main Control Grid (Bento) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">

                    {/* Col 1: Scraper Command Center */}
                    <Card className="lg:col-span-1 flex flex-col p-0 overflow-hidden border-slate-300 shadow-md">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <Target className="h-4 w-4 text-slate-500" />
                                Targeting Module
                            </h3>
                        </div>
                        <div className="p-4 space-y-4 bg-white z-10 relative">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Target City</label>
                                    <select
                                        value={targetCity}
                                        onChange={(e) => setTargetCity(e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 bg-slate-50 p-2 font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                                    >
                                        <option>Johannesburg</option>
                                        <option>Cape Town</option>
                                        <option>Durban</option>
                                        <option>Pretoria</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Niche</label>
                                    <input
                                        type="text"
                                        value={targetNiche}
                                        onChange={(e) => setTargetNiche(e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-200 bg-slate-50 p-2 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsScraping(!isScraping)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all ${isScraping
                                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                                        }`}
                                >
                                    {isScraping ? <><Pause className="h-4 w-4" /> HALT SWARM</> : <><Play className="h-4 w-4" /> DEPLOY SWARM</>}
                                </button>
                            </div>
                        </div>
                        {/* Terminal */}
                        <div className="flex-1 overflow-hidden relative">
                            <ConsoleLog logs={logs.length ? logs : ["> Systems Ready...", "> Waiting for target coordinates..."]} />
                        </div>
                    </Card>

                    {/* Col 2: The Funnel & Ops */}
                    <div className="flex flex-col gap-4 h-full">
                        {/* Funnel Chart */}
                        <Card className="flex-1 border-slate-300 shadow-md">
                            <h3 className="font-bold text-sm mb-4">Conversion Pipeline</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Scraped", val: stats.scraped, color: "bg-slate-200", text: "text-slate-600" },
                                    { label: "Valid Email", val: stats.valid, color: "bg-blue-100", text: "text-blue-600" },
                                    { label: "Sent", val: stats.sent, color: "bg-blue-200", text: "text-blue-700" },
                                    { label: "Opened", val: stats.opened, color: "bg-emerald-100", text: "text-emerald-600" },
                                    { label: "Replied", val: stats.replied, color: "bg-emerald-200", text: "text-emerald-700" },
                                    { label: "Revenue", val: 0, color: "bg-amber-100", text: "text-amber-600" },
                                ].map((step) => (
                                    <div key={step.label} className="group cursor-pointer">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-slate-500">{step.label}</span>
                                            <span className={step.text}>{step.val}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${step.color} transition-all duration-700`}
                                                style={{ width: `${(step.val / stats.scraped) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Mini Metrics */}
                        <div className="grid grid-cols-2 gap-4 h-1/3">
                            <Card className="flex flex-col justify-center items-center border-slate-200">
                                <Text>Avg. Deal Size</Text>
                                <Metric>R 15,000</Metric>
                            </Card>
                            <Card className="flex flex-col justify-center items-center border-slate-200">
                                <Text>Cycle Time</Text>
                                <Metric>14 Days</Metric>
                            </Card>
                        </div>
                    </div>

                    {/* Col 3: Kill Queue (Action Inbox) */}
                    <Card className="lg:col-span-1 border-slate-300 shadow-md flex flex-col p-0 overflow-hidden h-full">
                        <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                                <Flame className="h-4 w-4 text-amber-600" />
                                Kill Queue ({hotLeads.length})
                            </h3>
                            <button className="text-[10px] font-bold uppercase text-amber-700 hover:text-amber-900">
                                Clear All
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                            {hotLeads.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <InboxIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">Inbox Zero</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {hotLeads.map((lead) => (
                                        <div key={lead.id} className="p-3 hover:bg-slate-50 group transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 line-clamp-1">{lead.business_name}</p>
                                                    <p className="text-xs text-slate-400">{lead.niche || "General"} • {lead.score}% Match</p>
                                                </div>
                                                <Badge color={lead.score > 85 ? "green" : "orange"}>{lead.score}</Badge>
                                            </div>

                                            <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded p-2 mb-3 line-clamp-2">
                                                "Hi {lead.business_name}, saw you on Google Maps..."
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleDiscard(lead.id)}
                                                    className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <button className="flex items-center justify-center p-1.5 rounded border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(lead.id)}
                                                    className="flex items-center justify-center p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function InboxIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    )
}
