"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
    Search,
    Filter,
    Download,
    Phone,
    Mail,
    MessageSquare,
    MapPin,
    Star,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
    id: string;
    business_name: string;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    score: number;
    status: "new" | "contacted" | "qualified" | "converted" | "lost";
    created_at: string;
    website?: string;
    source?: string;
}

// Status match function to safely handle DB string types
const getLeadStatus = (status: string): Lead["status"] => {
    const validStatuses = ["new", "contacted", "qualified", "converted", "lost"];
    return validStatuses.includes(status) ? (status as Lead["status"]) : "new";
};

const statusConfig = {
    new: { label: "New", color: "bg-blue-100 text-blue-700", icon: Star },
    contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    qualified: { label: "Qualified", color: "bg-purple-100 text-purple-700", icon: TrendingUp },
    converted: { label: "Converted", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    lost: { label: "Lost", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const { data, error } = await supabase
                    .from("leads")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching leads:", error);
                    return;
                }

                if (data) {
                    const mappedLeads: Lead[] = data.map((l) => ({
                        ...l,
                        status: getLeadStatus(l.status),
                    }));
                    setLeads(mappedLeads);
                }

            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();

        const channel = supabase
            .channel('leads-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    const newLead = payload.new as any;
                    setLeads((current) => [{
                        ...newLead,
                        status: getLeadStatus(newLead.status)
                    } as Lead, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleContact = async (lead: Lead, channel: 'whatsapp' | 'call' | 'email') => {
        let url = '';
        if (channel === 'whatsapp') {
            const text = `Hello ${lead.business_name}, I saw your business on Google Maps and I have a free lead for you. Are you taking on new work?`;
            url = `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
        } else if (channel === 'call') {
            url = `tel:${lead.phone}`;
        } else if (channel === 'email') {
            url = `mailto:${lead.email}?subject=Free Lead for ${lead.business_name}&body=Hi there, I have a qualified lead for you.`;
        }

        if (url) window.open(url, channel === 'call' || channel === 'email' ? '_self' : '_blank');

        // Optimistic Update
        const newStatus = 'contacted';
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));

        // Database Update
        await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);

        toast.success(`Marked ${lead.business_name} as contacted via ${channel}`);
    };

    const filteredLeads = leads.filter(lead =>
        lead.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === "new").length,
        contacted: leads.filter(l => l.status === "contacted").length,
        converted: leads.filter(l => l.status === "converted").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-outfit text-3xl font-bold text-gray-900">Leads</h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                            Live Supabase
                        </span>
                    </div>
                    <p className="text-gray-500">Manage and track your business leads from your real database</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button
                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => toast.info("Bulk Automation is coming in Phase 8 (Cloud). Use individual actions for Manual Hustle!")}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Bulk WhatsApp
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Leads", value: stats.total, color: "from-blue-500 to-blue-600" },
                    { label: "New Today", value: stats.new, color: "from-green-500 to-emerald-600" },
                    { label: "Contacted", value: stats.contacted, color: "from-yellow-500 to-orange-500" },
                    { label: "Converted", value: stats.converted, color: "from-purple-500 to-pink-500" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                    >
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        {loading ? (
                            <div className="mt-2 h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
                        ) : (
                            <p className={`mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent`}>
                                {stat.value}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        id="leads-search"
                        name="q"
                        type="text"
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Leads Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Business</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        Loading leads...
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        No leads found
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead, i) => {
                                    const StatusIcon = statusConfig[lead.status].icon;
                                    return (
                                        <motion.tr
                                            key={lead.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{lead.business_name}</p>
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        {lead.address}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{lead.contact_name}</p>
                                                <p className="mt-1 text-sm text-gray-500">{lead.phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                            style={{ width: `${lead.score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{lead.score}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[lead.status].color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConfig[lead.status].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleContact(lead, 'call')}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                                                        title="Call"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleContact(lead, 'email')}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        title="Email"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleContact(lead, 'whatsapp')}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
