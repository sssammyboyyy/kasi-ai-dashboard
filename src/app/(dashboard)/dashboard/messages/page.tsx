"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import {
    Search,
    Filter,
    MessageSquare,
    MessageCircle,
    CheckCheck,
    Check,
    Clock,
    XCircle,
    Phone,
    User,
    ChevronRight,
    SearchX
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
    id: string;
    lead_id: string;
    channel: "whatsapp" | "email" | "sms" | "push";
    status: "pending" | "sent" | "delivered" | "failed";
    message: string | null;
    created_at: string;
    leads: {
        business_name: string;
        contact_name: string | null;
        phone: string | null;
    } | null;
}

const statusConfig = {
    pending: { label: "Pending", color: "text-gray-400", icon: Clock },
    sent: { label: "Sent", color: "text-blue-500", icon: Check },
    delivered: { label: "Delivered", color: "text-green-500", icon: CheckCheck },
    failed: { label: "Failed", color: "text-red-500", icon: XCircle },
};

export default function MessagesPage() {
    const [messages, setMessages] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from("notifications")
                    .select(`
                        *,
                        leads (
                            business_name,
                            contact_name,
                            phone
                        )
                    `)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching messages:", error);
                    return;
                }

                if (data) {
                    setMessages(data as any[]);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel('messages-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => fetchMessages()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const filteredMessages = messages.filter(m =>
        m.leads?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-outfit text-3xl font-bold text-gray-900">Messages</h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                            Live Delivery
                        </span>
                    </div>
                    <p className="text-gray-500">Track outreach status and communication history</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages or businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 h-10 px-4">
                        <Filter className="h-3.5 w-3.5" />
                        Channel
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 h-10 px-4">
                        Status
                    </Button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        <p className="mt-4 text-sm font-medium text-gray-500">Fetching messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <SearchX className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No messages yet</h3>
                        <p className="text-gray-500 max-w-xs mt-2">
                            When your campaigns start sending outreach, you'll see the delivery history here.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-gray-100">
                            {filteredMessages.map((msg, i) => {
                                const StatusIcon = statusConfig[msg.status].icon;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group flex gap-4 p-5 hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    >
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center ring-1 ring-gray-100">
                                                {msg.channel === 'whatsapp' ? (
                                                    <MessageCircle className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <MessageSquare className="h-6 w-6 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center ring-1 ring-gray-100">
                                                <StatusIcon className={`h-3 w-3 ${statusConfig[msg.status].color}`} />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {msg.leads?.business_name || "Unknown Lead"}
                                                </h4>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    {msg.leads?.contact_name || "Contact"}
                                                </span>
                                                <span className="h-3 w-px bg-gray-200" />
                                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" />
                                                    {msg.leads?.phone || "No phone"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                                                {msg.message || "Message content not logged."}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center justify-center self-center">
                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer Stats */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-medium text-gray-500">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {messages.filter(m => m.status === 'delivered').length} Delivered
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {messages.filter(m => m.status === 'sent' || m.status === 'pending').length} In Flight
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {messages.filter(m => m.status === 'failed').length} Failed
                        </span>
                    </div>
                    <span>Page 1 of 1</span>
                </div>
            </div>
        </div>
    );
}
