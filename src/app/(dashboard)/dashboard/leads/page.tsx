"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    score: number;
    status: "new" | "contacted" | "qualified" | "converted" | "lost";
    created_at: string;
}

// Demo data
const demoLeads: Lead[] = [
    {
        id: "1",
        business_name: "Sandton Office Complex",
        contact_name: "Thabo Molefe",
        phone: "+27 82 555 1234",
        email: "thabo@sandtonoffice.co.za",
        address: "123 Sandton Drive, Sandton",
        score: 92,
        status: "new",
        created_at: "2024-01-20T10:30:00Z"
    },
    {
        id: "2",
        business_name: "Apex Industrial Park",
        contact_name: "Sizwe Ndlovu",
        phone: "+27 83 444 5678",
        email: "sizwe@apexindustrial.co.za",
        address: "45 Industry Road, Midrand",
        score: 78,
        status: "contacted",
        created_at: "2024-01-20T09:15:00Z"
    },
    {
        id: "3",
        business_name: "Rosebank Mall Services",
        contact_name: "Nomsa Dlamini",
        phone: "+27 84 333 9012",
        email: "nomsa@rosebankservices.co.za",
        address: "Rosebank Mall, Johannesburg",
        score: 85,
        status: "qualified",
        created_at: "2024-01-19T16:45:00Z"
    },
    {
        id: "4",
        business_name: "Pretoria Tech Hub",
        contact_name: "James van der Berg",
        phone: "+27 82 222 3456",
        email: "james@pretoriatech.co.za",
        address: "Innovation Drive, Pretoria",
        score: 95,
        status: "converted",
        created_at: "2024-01-19T14:20:00Z"
    },
];

const statusConfig = {
    new: { label: "New", color: "bg-blue-100 text-blue-700", icon: Star },
    contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    qualified: { label: "Qualified", color: "bg-purple-100 text-purple-700", icon: TrendingUp },
    converted: { label: "Converted", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    lost: { label: "Lost", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function LeadsPage() {
    const [leads] = useState<Lead[]>(demoLeads);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLeads = leads.filter(lead =>
        lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="font-outfit text-3xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-500">Manage and track your business leads</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
                        <p className={`mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent`}>
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
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
                            {filteredLeads.map((lead, i) => {
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
                                                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600">
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600">
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
