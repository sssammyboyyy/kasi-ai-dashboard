"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero3D() {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    // Mouse position state
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Normalize mouse position (-0.5 to 0.5)
        const normalizedX = (e.clientX - rect.left) / width - 0.5;
        const normalizedY = (e.clientY - rect.top) / height - 0.5;

        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <section
            className="relative min-h-[90vh] w-full overflow-hidden bg-[#FAFAFA] pt-32 pb-20 perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            ref={ref}
        >
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center">

                {/* Left: Copy */}
                <div className="z-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-sm text-green-700">
                            <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                            Live: 14 New Jobs in Your Area
                        </div>

                        <h1 className="mt-6 font-outfit text-5xl font-bold leading-[1.1] text-gray-900 md:text-7xl">
                            Get Cleaning Contracts <br />
                            <span className="text-blue-600">Delivered To You.</span>
                        </h1>

                        <p className="mt-6 max-w-lg text-lg text-gray-600 md:text-xl leading-relaxed">
                            Stop chasing clients. We find local businesses that need cleaners and send their direct phone numbers to your WhatsApp.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="h-14 bg-blue-600 px-8 text-lg font-bold shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-105"
                                onClick={() => window.location.href = '/get-started'}
                            >
                                Get My First 25 Leads
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>No credit card needed</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Person-Centered Visualization */}
                <div className="relative flex h-[600px] w-full items-center justify-center perspective-1000">
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d"
                        }}
                        className="relative h-[550px] w-full max-w-[450px]"
                    >
                        {/* Layer 1: Glass Background */}
                        <motion.div
                            style={{ translateZ: -40 }}
                            className="absolute inset-0 top-10 rounded-[2rem] border border-gray-100 bg-white/60 shadow-2xl backdrop-blur-md"
                        />

                        {/* Layer 2: Main Profile Card */}
                        <motion.div
                            style={{ translateZ: 20 }}
                            className="absolute inset-4 rounded-[1.5rem] bg-white p-6 shadow-xl border border-gray-100 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100 shadow-lg">
                                        {/* Using the distinguished black SA male professional image */}
                                        <img src="/kasi_hero_professional_1768835124101.png" alt="Decision Maker" className="h-full w-full object-cover" />
                                        <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Thabo Molefe</h3>
                                        <p className="text-sm text-gray-500">Facilities Manager</p>
                                        <p className="text-xs font-semibold text-blue-600">Apex Logistics HUB</p>
                                    </div>
                                </div>
                                <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100">
                                    Active Now
                                </div>
                            </div>

                            {/* Lead Score Section */}
                            <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Contract Match Score</span>
                                    <span className="text-lg font-bold text-blue-600">98/100</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "98%" }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                                    />
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] shadow-sm border border-gray-100 text-gray-600">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Need: Daily Cleaning
                                    </span>
                                    <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] shadow-sm border border-gray-100 text-gray-600">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Budget: Approved
                                    </span>
                                </div>
                            </div>

                            {/* Contact Details (Blur effect for realism/mystery) */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Direct Cell</p>
                                        <p className="text-sm font-bold text-gray-900">+27 82 555 •••• <span className="text-xs text-green-600 font-normal ml-1">(Verified)</span></p>
                                    </div>
                                    <Button size="sm" className="ml-auto h-8 bg-blue-600 text-xs">Unlock</Button>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Direct Email</p>
                                        <p className="text-sm font-bold text-gray-900">thabo.m@apex••••.co.za</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>

                        {/* Floating Elements (Orbits) */}
                        <motion.div
                            style={{ translateZ: 80 }}
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-4 bottom-40 rounded-lg bg-white px-3 py-2 shadow-lg border border-gray-200 text-xs font-bold text-blue-600"
                        >
                            +25 Free Leads
                        </motion.div>

                        <motion.div
                            style={{ translateZ: 60 }}
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-4 bottom-20 rounded-lg bg-green-500 px-3 py-2 shadow-lg text-xs font-bold text-white"
                        >
                            Verified ✓
                        </motion.div>

                    </motion.div>
                </div>
            </div>

            {/* Background Gradients */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full bg-blue-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-purple-50 blur-[100px]" />
            </div>
        </section>
    );
}
