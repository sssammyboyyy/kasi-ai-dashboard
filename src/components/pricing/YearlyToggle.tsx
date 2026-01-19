"use client";

import { motion } from "framer-motion";

interface YearlyToggleProps {
    yearly: boolean;
    setYearly: (value: boolean) => void;
}

export function YearlyToggle({ yearly, setYearly }: YearlyToggleProps) {
    return (
        <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-500"}`}>
                Monthly
            </span>
            <button
                onClick={() => setYearly(!yearly)}
                className={`relative h-8 w-14 rounded-full transition-colors focus:outline-none ${yearly ? "bg-blue-600" : "bg-gray-200"
                    }`}
            >
                <motion.div
                    className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm"
                    animate={{ x: yearly ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </button>
            <span className={`flex items-center gap-2 text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-500"}`}>
                Yearly
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    SAVE 20%
                </span>
            </span>
        </div>
    );
}
