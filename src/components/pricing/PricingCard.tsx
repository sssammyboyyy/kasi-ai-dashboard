"use client";

import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PricingCardProps {
    name: string;
    price: number;
    description: string;
    credits: number;
    features: string[];
    popular?: boolean;
    yearly?: boolean;
}

export function PricingCard({ name, price, description, credits, features, popular, yearly }: PricingCardProps) {
    const finalPrice = yearly ? Math.round(price * 0.8) : price;

    return (
        <div className={`group relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300 hover:shadow-xl ${popular
            ? "border-blue-500 shadow-2xl scale-105 z-10 ring-4 ring-blue-500/10"
            : "border-gray-100 hover:border-blue-200"
            }`}>
            {popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-200">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className={`flex items-center gap-2 font-outfit text-2xl font-bold ${popular ? "text-blue-600" : "text-gray-900"}`}>
                    {name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-blue-400">R</span>
                    <span className="font-outfit text-5xl font-bold text-blue-600 tracking-tight">{Math.round(finalPrice / credits)}</span>
                    <span className="text-gray-500 font-medium">/lead</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    R{finalPrice}/mo total ({credits} leads)
                </p>
                {yearly && (
                    <div className="mt-2 inline-block rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                        Saved 20% (R{Math.round(price * 12 * 0.2)}/yr)
                    </div>
                )}
            </div>

            <div className={`mb-8 rounded-xl p-5 ${popular ? "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}>
                <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="text-2xl text-blue-600">{credits}</span>
                    <span>Verified Leads</span>
                </div>
                <div className="mt-1 text-xs font-medium text-gray-500">
                    Direct Email + Mobile Numbers
                </div>
                <p className="mt-3 text-xs text-green-700 font-semibold bg-green-50 rounded-lg px-2 py-1.5 border border-green-100">
                    💡 Just 2 contracts could pay for this plan for years
                </p>
            </div>

            <Link href="/get-started" className="block">
                <Button
                    className={`mb-8 w-full py-7 text-lg font-bold transition-all duration-300 ${popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:to-blue-600 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        : "bg-white text-gray-900 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                >
                    {popular ? `Get ${name} Plan` : `Choose ${name}`}
                </Button>
            </Link>

            <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Everything in {name}:</p>
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${popular ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                            <Check className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
