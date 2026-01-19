
"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity } from "lucide-react";
import { LOG_STREAM } from "@/data/mock-leads";

export function TerminalWindow() {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Simulate log stream
    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < LOG_STREAM.length) {
                setLogs((prev) => [...prev, LOG_STREAM[currentIndex]]);
                currentIndex++;
            } else {
                // Loop the logs for infinite effect
                currentIndex = 0;
                setLogs([]);
            }
        }, 1200); // New log every 1.2s

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollable = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollable) {
                scrollable.scrollTop = scrollable.scrollHeight;
            }
        }
    }, [logs]);

    return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#00FF41]" />
                    <span className="font-mono text-sm font-bold text-gray-300">
                        KASI_AI://extraction_protocol_v2
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 animate-pulse text-[#00FF41]" />
                    <span className="font-mono text-xs text-[#00FF41]">ONLINE</span>
                </div>
            </div>

            {/* Log Area */}
            <ScrollArea className="h-[calc(100%-48px)] p-4" ref={scrollRef}>
                <div className="space-y-1 font-mono text-xs">
                    <AnimatePresence>
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`break-all ${log.includes("SUCCESS") || log.includes("JACKPOT")
                                        ? "text-[#00FF41] font-bold glow-text"
                                        : log.includes("ERROR")
                                            ? "text-red-500"
                                            : "text-gray-400"
                                    }`}
                            >
                                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Cursor */}
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="mt-2 h-4 w-2 bg-[#00FF41]"
                    />
                </div>
            </ScrollArea>
        </div>
    );
}
