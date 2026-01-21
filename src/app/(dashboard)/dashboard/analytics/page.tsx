"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Target, MessageSquare, Loader2 } from "lucide-react";

interface Stats {
    totalLeads: number;
    newToday: number;
    contacted: number;
    converted: number;
    conversionRate: number;
}

interface LeadsByDay {
    date: string;
    count: number;
    quality?: 'high' | 'medium' | 'low'; // Added for distribution tracking
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [leadsByDay, setLeadsByDay] = useState<LeadsByDay[]>([]);
    const [qualityDist, setQualityDist] = useState({ high: 0, medium: 0, low: 0 });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                // Fetch total leads
                const { count: totalLeads } = await supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true });

                // Fetch leads created today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: newToday } = await supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", today.toISOString());

                // Fetch contacted leads
                const { count: contacted } = await supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "contacted");

                // Fetch converted leads
                const { count: converted } = await supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "converted");

                const total = totalLeads || 0;
                const conversionRate = total > 0 ? ((converted || 0) / total) * 100 : 0;

                setStats({
                    totalLeads: total,
                    newToday: newToday || 0,
                    contacted: contacted || 0,
                    converted: converted || 0,
                    conversionRate,
                });

                // Fetch leads by day for the last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { data: recentLeads } = await supabase
                    .from("leads")
                    .select("created_at")
                    .gte("created_at", sevenDaysAgo.toISOString())
                    .order("created_at", { ascending: true });

                // Group by date and calculate quality
                const grouped: Record<string, number> = {};
                const qualityStats = { high: 0, medium: 0, low: 0 };

                (recentLeads || []).forEach((lead) => {
                    const date = new Date(lead.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                    });
                    grouped[date] = (grouped[date] || 0) + 1;
                });

                // Fetch ALL scores to calculate total distribution
                // In a real large app, this should be an RPC call or aggregated view
                const { data: allScores } = await supabase.from('leads').select('score');
                if (allScores) {
                    allScores.forEach(l => {
                        if (l.score >= 80) qualityStats.high++;
                        else if (l.score >= 50) qualityStats.medium++;
                        else qualityStats.low++;
                    });
                }
                setQualityDist(qualityStats);

                // Temporary hack: Attach quality stats to leadsByDay state or create new state
                // Since I can't easily change the state interface in this Replace call without breaking things, I'll sneak it into the map logic or just handle it purely in UI variables if I could
                // But for now, let's map the quality into the `leadsByDay` array as a "hack" or better yet, just use the `allScores` length to populate the percentages in the render
                // Actually, I can't access `allScores` in the render unless I save it to state.

                // Let's modify the LeadsByDay interface to include quality mock data or just rely on the math in the render being dynamic? 
                // Wait, simpler approach: Just modify the `LeadsByDay` type definition in the next step.

                setLeadsByDay(
                    Object.entries(grouped).map(([date, count]) => ({
                        date,
                        count,
                        quality: 'medium' // Placeholder type safety 
                    }))
                );

                // To do this properly, I need to add a `qualityDistribution` state in a separate edit. 
                // For this edit, I will just proceed with the grouping logic and let the next edit fix the state.
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Leads",
            value: stats?.totalLeads || 0,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "New Today",
            value: stats?.newToday || 0,
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Contacted",
            value: stats?.contacted || 0,
            icon: MessageSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Converted",
            value: stats?.converted || 0,
            icon: Target,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    const maxCount = Math.max(...leadsByDay.map((d) => d.count), 1);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Track your lead generation performance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Conversion Funnel (Growth Architecture) */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>Lead progression pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Stage 1: New Leads */}
                        <div className="relative">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span>New Leads</span>
                                <span>{stats?.totalLeads || 0}</span>
                            </div>
                            <div className="h-10 bg-blue-100 rounded-md w-full flex items-center px-4">
                                <div className="h-6 w-full bg-blue-500 rounded opacity-20"></div>
                            </div>
                        </div>

                        {/* Arrow Down */}
                        <div className="flex justify-center -my-3 z-10 relative">
                            <div className="bg-white px-2 text-xs text-muted-foreground">
                                {((stats?.contacted || 0) / (stats?.totalLeads || 1) * 100).toFixed(1)}% proceed
                            </div>
                        </div>

                        {/* Stage 2: Contacted */}
                        <div className="relative">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span>Contacted</span>
                                <span>{stats?.contacted || 0}</span>
                            </div>
                            <div className="h-10 bg-purple-100 rounded-md flex items-center px-4"
                                style={{ width: `${Math.max(((stats?.contacted || 0) / (stats?.totalLeads || 1)) * 100, 5)}%` }}>
                                <div className="h-6 w-full bg-purple-500 rounded opacity-20"></div>
                            </div>
                        </div>

                        {/* Arrow Down */}
                        <div className="flex justify-center -my-3 z-10 relative">
                            <div className="bg-white px-2 text-xs text-muted-foreground">
                                {((stats?.converted || 0) / (stats?.contacted || 1) * 100).toFixed(1)}% close
                            </div>
                        </div>

                        {/* Stage 3: Converted */}
                        <div className="relative">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span>Converted</span>
                                <span className="text-orange-600 font-bold">{stats?.converted || 0}</span>
                            </div>
                            <div className="h-10 bg-orange-100 rounded-md flex items-center px-4"
                                style={{ width: `${Math.max(((stats?.converted || 0) / (stats?.totalLeads || 1)) * 100, 5)}%` }}>
                                <div className="h-6 w-full bg-orange-500 rounded opacity-20"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lead Quality & Recent Activity Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Lead Quality Distribution (The Intelligence Layer) */}
                <Card className="border-purple-100 bg-purple-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            Lead Quality Distribution
                        </CardTitle>
                        <CardDescription>AI-Scored Leads (0-100)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* High Quality */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-green-700">High Intent (80+)</span>
                                    <span className="text-gray-600">{Math.round((qualityDist.high / Math.max(stats?.totalLeads || 1, 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(qualityDist.high / Math.max(stats?.totalLeads || 1, 1)) * 100}%` }} />
                                </div>
                            </div>

                            {/* Medium Quality */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-blue-700">Medium Intent (50-79)</span>
                                    <span className="text-gray-600">{Math.round((qualityDist.medium / Math.max(stats?.totalLeads || 1, 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(qualityDist.medium / Math.max(stats?.totalLeads || 1, 1)) * 100}%` }} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-purple-100">
                                <p className="text-xs text-center text-purple-600 italic">
                                    "Your top 20% of leads represent 80% of your revenue potential."
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leads Chart (Existing) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Volume (7 Days)</CardTitle>
                        <CardDescription>Daily acquisition trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leadsByDay.length > 0 ? (
                            <div className="flex items-end justify-between gap-2 h-40">
                                {leadsByDay.map((day) => (
                                    <div key={day.date} className="flex flex-col items-center flex-1">
                                        <div
                                            className="w-full bg-primary rounded-t transition-all duration-300"
                                            style={{
                                                height: `${(day.count / maxCount) * 100}%`,
                                                minHeight: day.count > 0 ? "8px" : "0px",
                                            }}
                                        />
                                        <span className="text-xs text-muted-foreground mt-2">
                                            {day.date}
                                        </span>
                                        <span className="text-xs font-medium">{day.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                No data for the last 7 days
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
