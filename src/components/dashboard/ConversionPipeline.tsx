"use client";

import { Activity, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ConversionPipelineProps {
    stats: {
        scraped: number;
        valid: number;
        sent: number;
        opened: number;
        replied: number;
        pipelineValue: number;
    };
}

export function ConversionPipeline({ stats }: ConversionPipelineProps) {
    const funnelSteps = [
        { label: "Total Scraped", value: stats.scraped, color: "bg-slate-200", barColor: "bg-slate-800" },
        { label: "Enriched & Valid", value: stats.valid, color: "bg-blue-100", barColor: "bg-blue-600" },
        { label: "Outreach Sent", value: stats.sent, color: "bg-indigo-100", barColor: "bg-indigo-600" },
        { label: "Opened", value: stats.opened, color: "bg-purple-100", barColor: "bg-purple-600" },
        { label: "Replied", value: stats.replied, color: "bg-emerald-100", barColor: "bg-emerald-600" },
    ];

    const maxVal = Math.max(stats.scraped, 1);

    return (
        <Card className="h-full border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        Conversion Funnel
                    </h3>
                    <p className="text-sm text-slate-500">Real-time pipeline efficiency</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Value</p>
                    <p className="text-2xl font-bold text-emerald-600">R{(stats.pipelineValue / 1000).toFixed(1)}k</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {funnelSteps.map((step, i) => (
                    <div key={step.label} className="relative group">
                        <div className="flex justify-between items-end mb-2 text-sm">
                            <span className="font-bold text-slate-700">{step.label}</span>
                            <span className="font-mono font-bold text-slate-900">{step.value}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${step.barColor}`}
                                style={{ width: `${(step.value / maxVal) * 100}%` }}
                            />
                        </div>

                        {/* Percentage Dropoff Tooltip simulation */}
                        {i > 0 && stats.scraped > 0 && (
                            <div className="absolute right-0 top-6 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {Math.round((step.value / funnelSteps[i - 1].value) * 100)}% conversion
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Reply Rate</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">
                            {stats.sent ? ((stats.replied / stats.sent) * 100).toFixed(1) : 0}%
                        </span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Lead Quality</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">
                            High
                        </span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <div key={s} className="h-1.5 w-1.5 rounded-full bg-emerald-500" />)}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
