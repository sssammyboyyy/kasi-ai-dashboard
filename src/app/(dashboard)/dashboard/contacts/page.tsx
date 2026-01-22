"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Zap, Battery, BatteryMedium, BatteryLow } from "lucide-react";

interface Lead {
    id: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    intelligence?: {
        lead_score: number;
        sentiment: 'warm' | 'hot' | 'cold' | 'neutral';
        tags: string[];
        last_signal_at: string;
    }
}

export default function ContactsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        async function fetchLeads() {
            try {
                // Fetch leads and join with intelligence profile
                // Note: Supabase JS joins require the referenced table name to be correct.
                // Assuming 'user_intelligence_profile' references 'leads'
                const { data, error } = await supabase
                    .from("leads")
                    .select(`
            *,
            intelligence:user_intelligence_profile(
              lead_score,
              sentiment,
              tags,
              last_signal_at
            )
          `)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                // Transform data to flatten intelligence object if needed, or keep as is.
                // For array response (relation one-to-one), it might come as an array or object depending on relation setup.
                // Usually it's an object if 1:1.
                setLeads(data as any);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeads();
    }, []);

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case 'hot': return <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />;
            case 'warm': return <Battery className="h-4 w-4 text-yellow-500" />;
            case 'cold': return <BatteryLow className="h-4 w-4 text-blue-500" />;
            default: return <BatteryMedium className="h-4 w-4 text-gray-400" />;
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contacts Intelligence</h1>
                    <p className="text-muted-foreground">View and manage your leads with AI-driven insights.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Leads</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Lead Score</TableHead>
                                    <TableHead>Sentiment</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="text-right">Last Signal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.contact_name || "Unknown"}</TableCell>
                                        <TableCell>{lead.email || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${(lead.intelligence?.lead_score || 0) > 50 ? 'text-green-600' : 'text-gray-600'
                                                    }`}>
                                                    {lead.intelligence?.lead_score || 0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 capitalize">
                                                {getSentimentIcon(lead.intelligence?.sentiment)}
                                                {lead.intelligence?.sentiment || 'Neutral'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {lead.intelligence?.tags?.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {lead.intelligence?.last_signal_at ? new Date(lead.intelligence.last_signal_at).toLocaleDateString() : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No leads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
