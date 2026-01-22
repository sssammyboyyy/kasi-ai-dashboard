"use client";

import { useState, useEffect } from "react";
import { Check, X, Flame, Inbox, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function ActiveKillQueue() {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch leads that are 'new' and high score
    useEffect(() => {
        const fetchQueue = async () => {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .gte('score', 70) // Manual Hustle Threshold
                .is('status', null)
                .order('score', { ascending: false })
                .limit(50);

            if (data) setQueue(data);
            setLoading(false);
        };

        fetchQueue();

        const channel = supabase.channel('kill-queue')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
                const newLead = payload.new;
                if (newLead.score >= 70) {
                    setQueue(prev => [newLead, ...prev]);
                    toast.info("New Hot Lead in Queue!");
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleSalesAction = async (lead: any, channel: 'whatsapp' | 'call' | 'discard') => {
        // Optimistic Remove for flow
        setQueue(prev => prev.filter(l => l.id !== lead.id));

        if (channel === 'discard') {
            toast("Lead Discarded");
            await supabase.from('leads').update({ status: 'archived' }).eq('id', lead.id);
            return;
        }

        // 1. Construct the Pitch
        toast.success(`Opening ${channel === 'whatsapp' ? 'WhatsApp' : 'Phone'}...`);

        if (channel === 'whatsapp') {
            const pitch = `Hi ${lead.business_name}, I saw your business on Google Maps. We help ${lead.niche || 'local'} businesses in ${lead.city || 'your area'} get more clients. Are you taking on new work?`;
            const url = `https://wa.me/${lead.phone?.replace(/\s+/g, '')}?text=${encodeURIComponent(pitch)}`;
            window.open(url, '_blank');
        }
        else if (channel === 'call') {
            window.location.href = `tel:${lead.phone}`;
        }

        // 2. Update Database
        await supabase.from('leads').update({ status: 'contacted' }).eq('id', lead.id);
    };

    return (
        <Card className="flex flex-col h-full border-amber-200 bg-amber-50/30 shadow-sm overflow-hidden border-2">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-md">
                        <Flame className="h-4 w-4 text-amber-600 fill-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900">Kill Queue</h3>
                        <p className="text-[10px] text-amber-700 font-medium">{queue.length} Pending Actions</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-amber-900/40 p-8 text-center">
                        <Inbox className="h-10 w-10 mb-2 opacity-50" />
                        <p className="font-bold">Hungry for Leads</p>
                        <p className="text-xs">Run the scraper to fill the queue.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-amber-100">
                        {queue.map((lead) => (
                            <div key={lead.id} className="p-3 bg-white hover:bg-amber-50/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{lead.business_name}</h4>
                                    <Badge className={`${lead.score >= 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} border-0`}>
                                        {lead.score}
                                    </Badge>
                                </div>

                                <div className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                                    <span>{lead.phone || "No Phone"}</span>
                                    <span>•</span>
                                    <span>{lead.address?.split(',')[0]}</span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    <Button
                                        onClick={() => handleSalesAction(lead, 'discard')}
                                        size="sm"
                                        variant="outline"
                                        className="col-span-1 h-9 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={() => handleSalesAction(lead, 'call')}
                                        disabled={!lead.phone}
                                        size="sm"
                                        className="col-span-1 h-9 bg-blue-600 hover:bg-blue-700 text-white border-0"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={() => handleSalesAction(lead, 'whatsapp')}
                                        disabled={!lead.phone}
                                        size="sm"
                                        className="col-span-2 h-9 bg-green-600 hover:bg-green-700 text-white border-0 font-bold"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
