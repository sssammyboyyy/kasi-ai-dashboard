import { Footer } from "@/components/ui/Footer";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy",
    description: "Kasi AI Privacy Policy - How we handle your data",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white">
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <Logo />
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            <article className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="font-outfit text-4xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="mt-4 text-gray-500">Last updated: January 2026</p>

                <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
                        <p className="mt-3">
                            When you use Kasi AI, we collect information you provide directly:
                        </p>
                        <ul className="mt-3 list-disc pl-6 space-y-2">
                            <li>Business name and your name</li>
                            <li>Contact information (email, WhatsApp number)</li>
                            <li>Business preferences (service type, location, goals)</li>
                            <li>Usage data and analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
                        <p className="mt-3">We use your information to:</p>
                        <ul className="mt-3 list-disc pl-6 space-y-2">
                            <li>Deliver verified B2B leads to your WhatsApp</li>
                            <li>Personalize lead recommendations for your area</li>
                            <li>Improve our services and user experience</li>
                            <li>Communicate about your account and offers</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">3. Data Protection (POPIA)</h2>
                        <p className="mt-3">
                            We comply with the Protection of Personal Information Act (POPIA) of South Africa.
                            You have the right to access, correct, or delete your personal information at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">4. Data Sharing</h2>
                        <p className="mt-3">
                            We never sell your personal information. We may share data with:
                        </p>
                        <ul className="mt-3 list-disc pl-6 space-y-2">
                            <li>Service providers who help operate our platform</li>
                            <li>Analytics services to improve user experience</li>
                            <li>Legal authorities when required by law</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">5. Contact Us</h2>
                        <p className="mt-3">
                            Questions about this policy? Contact us via WhatsApp or email at support@kasi.ai
                        </p>
                    </section>
                </div>
            </article>

            <Footer />
        </main>
    );
}
