"use client";

import { Check, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 font-outfit">Billing & Plans</h1>
                <p className="text-slate-500">Manage your subscription and billing details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="rounded-3xl p-8 border border-slate-200 bg-white relative">
                    <div className="absolute top-6 right-6">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 font-bold">CURRENT PLAN</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Starter</h3>
                    <div className="mt-4 mb-6">
                        <span className="text-4xl font-bold text-slate-900">Free</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">For individuals just getting started.</p>

                    <div className="space-y-3 mb-8">
                        {['Up to 100 leads/month', 'Basic Analytics', '1 Channel (Email)', 'Community Support'].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" className="w-full rounded-xl h-12 border-slate-200" disabled>
                        Current Plan
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="rounded-3xl p-8 border border-slate-900 bg-[#0F172A] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute top-6 right-6">
                        <Badge className="bg-blue-600 text-white border-0 font-bold hover:bg-blue-600">RECOMMENDED</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-white">Pro</h3>
                    <div className="mt-4 mb-6 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">R499</span>
                        <span className="text-slate-400">/month</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">For growing businesses needing scale.</p>

                    <div className="space-y-3 mb-8 relative z-10">
                        {[
                            'Unlimited leads',
                            'Advanced Analytics & Export',
                            'All Channels (WhatsApp + Email)',
                            'Priority Support',
                            'Fulfillment Engine Access'
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Check className="h-3 w-3 text-blue-400" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    <Button className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        Upgrade to Pro
                    </Button>
                    <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                        <div className="h-3 w-3 rounded-full border border-slate-600" /> Secure payment via Paystack
                    </p>
                </div>
            </div>
        </div>
    );
}
