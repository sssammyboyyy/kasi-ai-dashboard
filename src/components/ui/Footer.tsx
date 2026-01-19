"use client";

import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white py-12">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-2">
                        <Logo className="h-12 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100" />
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Live Dashboard</Link>
                        <Link href="/get-started" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">🎁 Refer & Earn</Link>
                        <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>© 2026 Kasi AI. Built for South African hustlers.</p>
                </div>
            </div>
        </footer>
    );
}
