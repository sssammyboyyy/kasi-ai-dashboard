"use client";

import { useState, useEffect } from "react";
import { Check, X, Flame, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function ActiveKillQueue() {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch leads that need approval (simulated 'needs_approval' logic using score > 80 and status is null)
    useEffect(() => {
        const fetchQueue = async () => {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .gte('score', 80)
                .is('status', null)
                .order('score', { ascending: false })
                .limit(50);

            if (data) setQueue(data);
            setLoading(false);
        };

        fetchQueue();

        // Subscription for new high-value leads
        const channel = supabase.channel('kill-queue')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
                const newLead = payload.new;
                if (newLead.score >= 80) {
                    setQueue(prev => [newLead, ...prev]);
                    toast.info("New High-Value Target in Queue!");
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'discard') => {
        // Optimistic UI
        setQueue(prev => prev.filter(l => l.id !== id));

        if (action === 'approve') {
            toast.success("Lead Approved - Rainmaker Activated");
            await supabase.from('leads').update({ status: 'approved' }).eq('id', id);
        } else {
            toast("Lead Discarded");
            await supabase.from('leads').update({ status: 'archived' }).eq('id', id);
        }
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

            <div className="flex-1 overflow-y-auto p-0">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-amber-900/40 p-8 text-center">
                        <Inbox className="h-10 w-10 mb-2 opacity-50" />
                        <p className="font-bold">Inbox Zero</p>
                        <p className="text-xs">All targets processed.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-amber-100">
                        {queue.map((lead) => (
                            <div key={lead.id} className="p-3 bg-white hover:bg-amber-50/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{lead.business_name}</h4>
                                    <Badge className="bg-amber-100 text-amber-800 border-0">{lead.score}</Badge>
                                </div>

                                <div className="p-2 bg-slate-50 border border-slate-100 rounded mb-3">
                                    <p className="text-xs text-slate-500 line-clamp-2 italic">
                                        "Draft: Hi {lead.business_name}, I noticed your rating on Google Maps..."
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAction(lead.id, 'discard')}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-8 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(lead.id, 'approve')}
                                        size="sm"
                                        className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Approve
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
