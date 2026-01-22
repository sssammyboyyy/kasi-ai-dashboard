"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Search,
    Filter,
    Download,
    MessageCircle,
    Phone,
    Mail,
    MoreHorizontal,
    Star,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assetPath } from "@/lib/basePath";

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setLeads(data);
            setLoading(false);
        };

        fetchLeads();
    }, []);

    const statusBadge = (status: string) => {
        switch (status) {
            case 'contacted': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Contacted</Badge>;
            case 'converted': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0 flex items-center gap-1"><Star className="h-3 w-3" /> Converted</Badge>;
            default: return <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-0 flex items-center gap-1"><Star className="h-3 w-3" /> New</Badge>;
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        Leads
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20 uppercase">Live Supabase</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your business leads from your real database.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <MessageCircle className="h-4 w-4 mr-2" /> Bulk WhatsApp
                    </Button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Leads", val: leads.length, text: "text-blue-600" },
                    { label: "New Today", val: 484, text: "text-emerald-600" }, // Mock for now
                    { label: "Contacted", val: leads.filter(l => l.status === 'contacted').length, text: "text-amber-600" },
                    { label: "Converted", val: leads.filter(l => l.status === 'converted').length, text: "text-purple-600" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className={`mt-2 text-3xl font-bold ${stat.text}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Search leads..."
                        className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-600">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#F8F9FB] border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.slice(0, 10).map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{lead.business_name}</div>
                                        <div className="text-xs text-slate-400">{lead.niche || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-600 font-mono">{lead.phone || '-'}</div>
                                        <div className="text-xs text-slate-400">{lead.email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${lead.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${lead.score}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-slate-700">{lead.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {statusBadge(lead.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-600">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
