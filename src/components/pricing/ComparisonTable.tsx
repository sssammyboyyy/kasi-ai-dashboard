"use client";

import { Check, X } from "lucide-react";

export function ComparisonTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50 p-4 font-outfit font-bold text-gray-900">
                <div>Features</div>
                <div className="text-center text-blue-600">Kasi AI</div>
                <div className="text-center text-gray-500">Traditional Ads</div>
            </div>

            {[
                { feature: "Primary Cost", kasi: "R799 / month", ads: "R5,000+ / month", highlight: true },
                { feature: "Guaranteed Leads", kasi: "Yes (Verified)", ads: "No (Clicks only)" },
                { feature: "Contact Info", kasi: "Email + Phone", ads: "None" },
                { feature: "Outreach Scripts", kasi: "Included", ads: "You write them" },
                { feature: "Setup Time", kasi: "Instant", ads: "Weeks" },
                { feature: "Contracts", kasi: "None (Monthly)", ads: "6-12 Months" },
            ].map((row, i) => (
                <div
                    key={i}
                    className={`grid grid-cols-3 items-center border-b border-gray-100 p-4 last:border-0 ${row.highlight ? "bg-blue-50/30" : ""
                        }`}
                >
                    <div className="font-medium text-gray-700">{row.feature}</div>
                    <div className="flex justify-center font-bold text-gray-900">{row.kasi}</div>
                    <div className="flex justify-center text-gray-500">{row.ads}</div>
                </div>
            ))}
        </div>
    );
}
