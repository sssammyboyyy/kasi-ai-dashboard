"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { LOG_STREAM } from "@/data/mock-leads";

export interface DashboardMetrics {
    stats: {
        scraped: number;
        valid: number;
        sent: number;
        opened: number;
        replied: number;
        pipelineValue: number;
    };
    logs: string[];
    // We expose a setter for logs to allow manual adding from other components if needed
    addLog: (log: string) => void;
}

export function useDashboardMetrics() {
    const [stats, setStats] = useState({
        scraped: 489,
        valid: 350,
        sent: 200,
        opened: 150,
        replied: 5,
        pipelineValue: 6690000
    });

    const [logs, setLogs] = useState<string[]>([]);
    const supabase = createClient();

    const addLog = (log: string) => {
        setLogs(prev => [...prev, log].slice(-50));
    };

    useEffect(() => {
        // Initial Fetch
        const fetchMetrics = async () => {
            const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true });
            if (total) setStats(prev => ({ ...prev, scraped: total }));
        };
        fetchMetrics();

        // Initial Logs (Simulation)
        setLogs(["> Systems Initialized...", "> Connected to Swarm Node [RSA-4096]...", "> Listening for incoming streams..."]);

        // Real-time Subscription
        const channel = supabase
            .channel('dashboard-metrics')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                (payload) => {
                    const newLead = payload.new;
                    addLog(`[SWARM]: New Target Acquired - ${newLead.business_name || 'Unknown'} (${newLead.address || 'Location N/A'})`);
                    setStats(prev => ({ ...prev, scraped: prev.scraped + 1 }));
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'leads' },
                (payload) => {
                    const oldStatus = payload.old.status;
                    const newStatus = payload.new.status;

                    if (oldStatus !== newStatus) {
                        if (newStatus === 'contacted') {
                            setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
                            addLog(`[OPS]: Status Update - ${payload.new.business_name} marked as CONTACTED`);
                        }
                        if (newStatus === 'approved') {
                            addLog(`[RAINMAKER]: Lead APPROVED - ${payload.new.business_name}. Sequence initiated.`);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { stats, logs, addLog };
}
