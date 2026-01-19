"use client";

import { motion } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
}

export function ScrollReveal({ children, width = "100%" }: ScrollRevealProps) {
    return (
        <div style={{ width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.5, delay: 0.25 }}
                viewport={{ once: true }}
            >
                {children}
            </motion.div>
        </div>
    );
}
