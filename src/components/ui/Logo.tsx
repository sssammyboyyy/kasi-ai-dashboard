
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/basePath";

interface LogoProps {
    className?: string;
    variant?: "default" | "light" | "dark";
}

export function Logo({ className, variant = "default" }: LogoProps) {
    return (
        <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
                src={assetPath("/logo.png")}
                alt="Kasi AI"
                width={240}
                height={80}
                className={cn("h-16 w-auto object-contain", className)}
                priority
            />
        </Link>
    );
}
