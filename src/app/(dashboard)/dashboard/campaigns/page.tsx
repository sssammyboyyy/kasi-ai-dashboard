"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import {
    Plus,
    Megaphone,
    Search,
    Filter,
    MoreHorizontal,
    Play,
    Pause,
    CheckCircle2,
    Clock,
    Target,
    TrendingUp,
    Users,
    Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    status: "draft" | "active" | "paused" | "completed";
    leads_collected: number;
    leads_converted: number;
    created_at: string;
    target_industries: string[] | null;
}

const statusConfig = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: Clock },
    active: { label: "Active", color: "bg-green-100 text-green-700", icon: Play },
    paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700", icon: Pause },
    completed: { label: "Completed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningFulfillment, setRunningFulfillment] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const { data, error } = await supabase
                    .from("campaigns")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching campaigns:", error);
                    return;
                }

                if (data) {
                    setCampaigns(data as Campaign[]);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();

        // Realtime subscription
        const channel = supabase
            .channel('campaigns-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'campaigns' },
                () => fetchCampaigns() // Refresh on any change for simplicity
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === "active").length,
        collected: campaigns.reduce((acc, c) => acc + (c.leads_collected || 0), 0),
        converted: campaigns.reduce((acc, c) => acc + (c.leads_converted || 0), 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-outfit text-3xl font-bold text-gray-900">Fulfillment</h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                            <Truck className="h-2.5 w-2.5" />
                            Delivery
                        </span>
                    </div>
                    <p className="text-gray-500">Manage your lead orders and delivery status</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={runningFulfillment}
                        onClick={async () => {
                            if (confirm("Run fulfillment process now? This will dispatch pending orders.")) {
                                setRunningFulfillment(true);
                                try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-campaigns`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
                                    });
                                    if (res.ok) alert("Fulfillment started successfully!");
                                    else alert("Failed to start fulfillment");
                                } catch (e) { console.error(e); alert("Error triggering fulfillment"); }
                                finally { setRunningFulfillment(false); }
                            }
                        }}
                    >
                        {runningFulfillment ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Play className="h-4 w-4" />}
                        {runningFulfillment ? "Running..." : "Run Fulfillment"}
                    </Button>
                    <Link href="/dashboard/campaigns/new">
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4" />
                            New Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Campaigns", value: stats.total, color: "from-blue-500 to-blue-600", icon: Megaphone },
                    { label: "Active Now", value: stats.active, color: "from-green-500 to-emerald-600", icon: Play },
                    { label: "Leads Collected", value: stats.collected, color: "from-purple-500 to-pink-500", icon: Users },
                    { label: "Conversions", value: stats.converted, color: "from-orange-500 to-red-500", icon: Target },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                    >
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            {loading ? (
                                <div className="mt-2 h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
                            ) : (
                                <p className={`mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent`}>
                                    {stat.value}
                                </p>
                            )}
                        </div>
                        <stat.icon className="absolute -bottom-2 -right-2 h-16 w-16 text-gray-50 opacity-[0.03]" />
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Sort & Filter
                </Button>
            </div>

            {/* Campaigns Grid/List */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                            <p className="text-sm text-gray-500 font-medium">Loading campaigns...</p>
                        </div>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="h-16 w-16 rounded-full bg-blue-50 p-4 mb-4">
                            <Megaphone className="h-full w-full text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No campaigns found</h3>
                        <p className="mt-1 text-gray-500">Create your first campaign to start automated outreach.</p>
                        <Button className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Create First Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {filteredCampaigns.map((campaign, i) => {
                            const StatusIcon = statusConfig[campaign.status].icon;
                            return (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group flex flex-col items-start gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md md:flex-row md:items-center"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{campaign.name}</h3>
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusConfig[campaign.status].color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig[campaign.status].label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{campaign.description || "No description provided."}</p>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {campaign.target_industries?.map(industry => (
                                                <span key={industry} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                                    {industry}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 md:flex md:items-center">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Collected</p>
                                            <p className="text-xl font-bold text-gray-900">{campaign.leads_collected}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Conversion</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xl font-bold text-green-600">
                                                    {campaign.leads_collected > 0
                                                        ? Math.round((campaign.leads_converted / campaign.leads_collected) * 100)
                                                        : 0}%
                                                </p>
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t pt-4 w-full md:border-t-0 md:pt-0 md:w-auto">
                                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">View Details</Button>
                                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
