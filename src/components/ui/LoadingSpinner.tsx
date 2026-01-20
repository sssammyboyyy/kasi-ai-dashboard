"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    return (
        <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </motion.div>
    );
}

// Skeleton loader for cards
export function SkeletonCard() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-3 w-full rounded bg-gray-200" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
            <div className="mt-6 h-10 w-1/2 rounded bg-gray-200" />
        </div>
    );
}

// Page loading overlay
export function PageLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
                <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

// Button loading state
export function ButtonSpinner() {
    return (
        <LoadingSpinner size="sm" className="mr-2" />
    );
}
