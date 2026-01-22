"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send, Wand2, Calculator, MapPin, Skull, Heart, Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

// Schema based on the 15-Question Protocol
const diagnosisSchema = z.object({
    // Block 1: Kill Zone
    target_locations: z.string().min(2, "Required"),
    excluded_locations: z.string().optional(),
    google_maps_query: z.string().min(2, "Required"),
    lead_scoring_criteria: z.string().min(2, "Required"),
    negative_keywords: z.string().optional(),

    // Block 2: Pain & Magic
    pain_point: z.string().min(2, "Required"),
    magical_outcome: z.string().min(2, "Required"),
    lost_revenue: z.string().min(1, "Required"),
    value_prop: z.string().min(2, "Required"),

    // Block 3: The Trojan Horse
    call_to_action: z.string().min(2, "Required"),
    tone_voice: z.enum(["Corporate", "Direct", "Friendly"]),
    sender_name: z.string().min(2, "Required"),
    case_study: z.string().min(2, "Required"),

    // Block 4: Stickiness
    capacity_check: z.string().min(1, "Required"),
    notification_channel: z.enum(["Email", "SMS", "WhatsApp"]),
    client_email: z.string().email("Invalid email"),
});

export default function DiagnosisPage() {
    const [generating, setGenerating] = useState(false);

    const form = useForm<z.infer<typeof diagnosisSchema>>({
        resolver: zodResolver(diagnosisSchema),
        defaultValues: {
            tone_voice: "Direct",
            notification_channel: "WhatsApp"
        }
    });

    async function onSubmit(values: z.infer<typeof diagnosisSchema>) {
        setGenerating(true);
        try {
            const response = await fetch('/api/generate-blueprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error('Failed to generate blueprint');

            toast.success("Sovereign Blueprint SENT to Client!");
            form.reset();
        } catch (error) {
            toast.error("Failed to generate asset. Check console.");
            console.error(error);
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit flex items-center gap-2">
                        <Wand2 className="h-8 w-8 text-indigo-600" />
                        Sales Diagnosis
                    </h1>
                    <p className="text-slate-500">The "Sovereign Blueprint" Generator. Fill this during the call.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* BLOCK 1: KILL ZONE */}
                    <Card className="p-6 border-l-4 border-l-slate-900 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-slate-900" />
                            <h2 className="text-lg font-bold text-slate-900">Block 1: Scraper Calibration (Kill Zone)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="target_locations" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Geo Lock (Red Circle)</FormLabel>
                                    <FormControl><Input placeholder="e.g. Bryanston, Sandton" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="excluded_locations" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exclusion Zone</FormLabel>
                                    <FormControl><Input placeholder="e.g. CBD, Universities" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="google_maps_query" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gold Mine Keyword</FormLabel>
                                    <FormControl><Input placeholder="e.g. Emergency Plumber" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="lead_scoring_criteria" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Whale Definition</FormLabel>
                                    <FormControl><Input placeholder="e.g. 50+ Employees" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="negative_keywords" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nightmare Client (Blackball)</FormLabel>
                                <FormControl><Input placeholder="e.g. Residential, Students" {...field} /></FormControl>
                            </FormItem>
                        )} />
                    </Card>

                    {/* BLOCK 2: PAIN & MAGIC */}
                    <Card className="p-6 border-l-4 border-l-rose-500 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Skull className="h-5 w-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-slate-900">Block 2: Emotional Hooks</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="pain_point" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sunday Afternoon Thief</FormLabel>
                                    <FormControl><Input placeholder="e.g. Chasing Invoices" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="magical_outcome" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Magic Wand Result</FormLabel>
                                    <FormControl><Input placeholder="e.g. Wake up to booked meetings" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="lost_revenue" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghosted Revenue (R)</FormLabel>
                                    <FormControl><Input placeholder="e.g. R50,000" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="value_prop" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unfair Advantage</FormLabel>
                                    <FormControl><Input placeholder="e.g. 24/7 Guarantee" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </Card>

                    {/* BLOCK 3: TROJAN HORSE */}
                    <Card className="p-6 border-l-4 border-l-indigo-500 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-bold text-slate-900">Block 3: Outreach Config</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="call_to_action" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>The Door Opener</FormLabel>
                                    <FormControl><Input placeholder="e.g. Free Audit, Coffee" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tone_voice" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tone</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                                            <option>Direct</option>
                                            <option>Corporate</option>
                                            <option>Friendly</option>
                                        </select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="sender_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sender Name (Face)</FormLabel>
                                    <FormControl><Input placeholder="e.g. John Doe, CEO" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="case_study" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trust Proof (Case Study)</FormLabel>
                                    <FormControl><Input placeholder="e.g. The Big Corp Project" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </Card>

                    {/* BLOCK 4: STICKINESS */}
                    <Card className="p-6 border-l-4 border-l-emerald-500 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-5 w-5 text-emerald-500" />
                            <h2 className="text-lg font-bold text-slate-900">Block 4: The Lock-In & Delivery</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="capacity_check" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Weekly Capacity</FormLabel>
                                    <FormControl><Input placeholder="e.g. 5 Leads" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="notification_channel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notify Via</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                                            <option>WhatsApp</option>
                                            <option>Email</option>
                                            <option>SMS</option>
                                        </select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="client_email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-emerald-700 font-bold">Client Email (Delivery)</FormLabel>
                                    <FormControl><Input placeholder="client@company.com" {...field} className="border-emerald-200 bg-emerald-50" /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </Card>

                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700" disabled={generating}>
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Generating Sovereign Assets...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-6 w-6" /> Generate & Send Blueprint
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
