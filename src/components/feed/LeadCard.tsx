
"use client";

import { motion } from "framer-motion";
import { Copy, MessageSquare, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/data/mock-leads";

interface LeadCardProps {
    lead: Lead;
    onDispatch: (lead: Lead) => void;
}

export function LeadCard({ lead, onDispatch }: LeadCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
        >
            <Card className="relative overflow-hidden border-[#00FF41]/20 bg-white/5 p-5 backdrop-blur-md transition-all hover:border-[#00FF41]/50 hover:bg-white/10 group">
                {/* Glow Effect */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00FF41]/10 blur-[50px] transition-all group-hover:bg-[#00FF41]/20" />

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-outfit text-lg font-bold text-white">
                                {lead.businessName}
                            </h3>
                            <ShieldCheck className="h-4 w-4 text-[#00FF41]" />
                        </div>
                        <p className="font-mono text-xs text-gray-400">{lead.location}</p>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-[#00FF41]/30 bg-[#00FF41]/10 text-xs font-medium text-[#00FF41] font-mono"
                    >
                        SCORE: {lead.leadScore}
                    </Badge>
                </div>

                {/* Lead Details */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="font-mono text-xs opacity-60">NICHE</span>
                        <span className="font-medium">{lead.niche}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="font-mono text-xs opacity-60">CONTACT</span>
                        <span className="font-medium">{lead.email || "N/A"}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                    <Button
                        className="flex-1 bg-[#00FF41] text-black hover:bg-[#00cc33] hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all font-bold"
                        onClick={() => onDispatch(lead)}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Dispatch
                    </Button>
                    <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:text-white hover:bg-white/10">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                {/* Progress Bar Animation */}
                <div className="absolute bottom-0 left-0 h-1 bg-[#00FF41] transition-all duration-1000" style={{ width: `${lead.leadScore}%`, opacity: 0.5 }} />
            </Card>
        </motion.div>
    );
}
