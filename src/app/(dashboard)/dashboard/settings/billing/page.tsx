"use client";

import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Zap } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="font-outfit text-3xl font-bold text-gray-900">Billing & Plans</h1>
                <p className="text-gray-500">Manage your subscription and billing details</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Free Plan */}
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">CURRENT PLAN</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">Free</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">For individuals just getting started.</p>
                    </div>

                    <ul className="mb-8 space-y-3 flex-1">
                        {[
                            "Up to 100 leads/month",
                            "Basic Analytics",
                            "1 Channel (Email)",
                            "Community Support"
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                    <Check className="h-3 w-3 text-green-600" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pro Plan */}
                <div className="relative rounded-2xl bg-gray-900 p-8 shadow-xl flex flex-col overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="h-24 w-24 text-white" />
                    </div>

                    <div className="mb-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Pro</h3>
                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-500/50">RECOMMENDED</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">R499</span>
                            <span className="text-sm font-medium text-gray-400">/month</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">For growing businesses needing scale.</p>
                    </div>

                    <ul className="mb-8 space-y-3 flex-1 relative z-10">
                        {[
                            "Unlimited leads",
                            "Advanced Analytics & Export",
                            "All Channels (WhatsApp + Email)",
                            "Priority Support",
                            "Fulfillment Engine Access"
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                                    <Check className="h-3 w-3 text-blue-400" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="relative z-10">
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white gap-2 font-semibold" onClick={() => window.open('https://paystack.com/pay/kasi-ai-pro', '_blank')}>
                            <CreditCard className="h-4 w-4" />
                            Upgrade to Pro
                        </Button>
                        <p className="mt-3 text-xs text-center text-gray-500">
                            Secure payment via Paystack. <br />
                            <span className="flex items-center justify-center gap-1 mt-1">
                                <Shield className="h-3 w-3" /> 30-day money-back guarantee
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
