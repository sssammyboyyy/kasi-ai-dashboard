"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const LOGOS = [
    { name: "CleanPro", url: "https://placehold.co/120x40/png?text=CleanPro" },
    { name: "JoziTech", url: "https://placehold.co/120x40/png?text=JoziTech" },
    { name: "VaalSteel", url: "https://placehold.co/120x40/png?text=VaalSteel" },
    { name: "DurbanEats", url: "https://placehold.co/120x40/png?text=DurbanEats" },
    { name: "CapeSolar", url: "https://placehold.co/120x40/png?text=CapeSolar" },
    { name: "PretoriaLaw", url: "https://placehold.co/120x40/png?text=PretoriaLaw" }
];

export function TrustMarquee() {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white py-10">
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-gray-400">
                Trusted by 500+ South African Businesses
            </p>

            <div className="flex w-full overflow-hidden">
                <motion.div
                    className="flex shrink-0 gap-16 px-8"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 25,
                        repeatType: "loop"
                    }}
                >
                    {/* Duplicate logos twice for seamless loop */}
                    {[...LOGOS, ...LOGOS].map((logo, i) => (
                        <div key={i} className="flex h-10 w-32 shrink-0 items-center justify-center grayscale opacity-40 transition-all hover:grayscale-0 hover:opacity-100">
                            <span className="text-xl font-bold font-outfit text-gray-800 whitespace-nowrap">{logo.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent" />
        </div>
    );
}
