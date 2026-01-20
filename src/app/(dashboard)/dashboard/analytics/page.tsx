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
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [leadsByDay, setLeadsByDay] = useState<LeadsByDay[]>([]);
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

                // Group by date
                const grouped: Record<string, number> = {};
                (recentLeads || []).forEach((lead) => {
                    const date = new Date(lead.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                    });
                    grouped[date] = (grouped[date] || 0) + 1;
                });

                setLeadsByDay(
                    Object.entries(grouped).map(([date, count]) => ({ date, count }))
                );
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, [supabase]);

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

            {/* Conversion Rate Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>Percentage of leads that converted</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-primary">
                            {stats?.conversionRate.toFixed(1)}%
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${stats?.conversionRate || 0}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leads Chart (Simple Bar Chart) */}
            <Card>
                <CardHeader>
                    <CardTitle>Lead Activity (Last 7 Days)</CardTitle>
                    <CardDescription>Daily lead acquisition</CardDescription>
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
    );
}
