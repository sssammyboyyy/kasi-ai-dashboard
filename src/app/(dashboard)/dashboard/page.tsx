"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, LayoutDashboard, Database, Send, Settings, LogOut } from "lucide-react";
import { assetPath } from "@/lib/basePath";

// Feature Components
import { TargetingModule } from "@/components/dashboard/TargetingModule";
import { ConversionPipeline } from "@/components/dashboard/ConversionPipeline";
import { ActiveKillQueue } from "@/components/dashboard/ActiveKillQueue";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

export default function DashboardPage() {
    const { stats, logs } = useDashboardMetrics();

    return (
        <div className="flex h-screen flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* 1. Header (Fixed 64px) */}
            <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <Zap className="h-5 w-5 text-white fill-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">Kasi.OS</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <nav className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-900 rounded-lg font-bold text-sm transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            War Room
                        </Link>
                        <Link href="/dashboard/leads" className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
                            <Database className="h-4 w-4" />
                            Data
                        </Link>
                        <Link href="/dashboard/campaigns" className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
                            <Send className="h-4 w-4" />
                            Outreach
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        NETWORK SECURE
                    </span>
                    <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                        <Image src={assetPath("/kasi_hero_man_2_1768835329601.png")} width={36} height={36} alt="User" />
                    </div>
                </div>
            </header>

            {/* 2. Main Layout (Flex-1) */}
            <main className="flex-1 p-4 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 h-full max-w-[1920px] mx-auto">

                    {/* Left Column: Targeting & Input (Span 3) */}
                    <div className="col-span-12 lg:col-span-3 h-full flex flex-col gap-4">
                        <TargetingModule logs={logs} />
                    </div>

                    {/* Center Column: Pipeline & Data (Span 6) */}
                    <div className="col-span-12 lg:col-span-6 h-full flex flex-col gap-4">
                        <ConversionPipeline stats={stats} />
                    </div>

                    {/* Right Column: Active Kill Queue (Span 3) */}
                    <div className="col-span-12 lg:col-span-3 h-full flex flex-col gap-4">
                        <ActiveKillQueue />
                    </div>

                </div>
            </main>
        </div>
    );
}
