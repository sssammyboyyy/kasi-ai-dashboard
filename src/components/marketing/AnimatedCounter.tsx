"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    className?: string;
}

export function AnimatedCounter({
    value,
    suffix = "",
    prefix = "",
    duration = 2,
    className = ""
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        duration: duration * 1000,
        bounce: 0
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest));
        });
        return unsubscribe;
    }, [springValue]);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
        >
            {prefix}{displayValue.toLocaleString()}{suffix}
        </motion.span>
    );
}

// Stats section with animated counters
export function StatsSection() {
    const stats = [
        { value: 2500, suffix: "+", label: "Leads Delivered" },
        { value: 98, suffix: "%", label: "Accuracy Rate" },
        { value: 45, prefix: "R", suffix: "K+", label: "Revenue Generated" },
        { value: 24, suffix: "hrs", label: "Average Delivery" },
    ];

    return (
        <section className="border-y border-gray-100 bg-white py-12">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="font-outfit text-3xl font-bold text-blue-600 md:text-4xl">
                                <AnimatedCounter
                                    value={stat.value}
                                    prefix={stat.prefix}
                                    suffix={stat.suffix}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
