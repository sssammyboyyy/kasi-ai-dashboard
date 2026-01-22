"use client";

import { useState, useRef, useEffect } from "react";
import { Target, Terminal, Play, Pause, Power, Globe, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TargetingModuleProps {
    logs: string[];
}

export function TargetingModule({ logs }: TargetingModuleProps) {
    const [city, setCity] = useState("Johannesburg");
    const [niche, setNiche] = useState("Logistics");
    const [active, setActive] = useState(false);
    const [copied, setCopied] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const handleDeploy = () => {
        // Generate the command
        const command = `node run-local-v2.js "${city}" "${niche}"`;
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        toast.success("Swarm Command Copied to Clipboard!");
        toast.info("Open your local terminal and paste the command to start the scraper.");
        setActive(true);
    };

    return (
        <Card className="flex flex-col h-full border-slate-300 shadow-sm overflow-hidden bg-slate-900 border-0">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <span className="font-mono text-sm font-bold text-slate-200">SWARM_CONTROLLER_V2</span>
                </div>
                <Badge className={`${active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {active ? 'DEPLOYED' : 'STANDBY'}
                </Badge>
            </div>

            {/* Input Controls */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-slate-900 border-b border-slate-800">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Region</label>
                    <div className="relative">
                        <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full h-9 pl-8 bg-slate-950 border border-slate-700 rounded-md text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                            <option>Johannesburg</option>
                            <option>Cape Town</option>
                            <option>Durban</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Niche</label>
                    <div className="relative">
                        <Target className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="w-full h-9 pl-8 bg-slate-950 border border-slate-700 rounded-md text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
                            placeholder="e.g. Lawyers"
                        />
                    </div>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[11px] leading-relaxed scrollbar-none bg-slate-950">
                {logs.length === 0 && (
                    <div className="text-slate-600 space-y-2">
                        <p>{">"} System Online.</p>
                        <p>{">"} Ready for command sequence.</p>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={`gap-2 ${log.includes("SUCCESS") || log.includes("New Target") ? "text-emerald-400" :
                            log.includes("EXTRACT") ? "text-blue-400" :
                                log.includes("APPROVED") ? "text-amber-400" :
                                    "text-slate-400"
                        }`}>
                        <span className="opacity-30 mr-2 border-r border-slate-800 pr-2">
                            {new Date().toLocaleTimeString([], { hour12: false })}
                        </span>
                        {log}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <Button
                    onClick={handleDeploy}
                    className="w-full font-bold tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="mr-2 h-4 w-4" /> COMMAND COPIED
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" /> COPY DEPLOY COMMAND
                        </>
                    )}
                </Button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                    Paste this command into your local terminal to begin the harvest.
                </p>
            </div>
        </Card>
    );
}
