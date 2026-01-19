import { Footer } from "@/components/ui/Footer";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const metadata = {
    title: "Terms of Service",
    description: "Kasi AI Terms of Service",
};

export default function TermsPage() {
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
                <h1 className="font-outfit text-4xl font-bold text-gray-900">Terms of Service</h1>
                <p className="mt-4 text-gray-500">Last updated: January 2026</p>

                <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900">1. Service Description</h2>
                        <p className="mt-3">
                            Kasi AI provides B2B lead generation services for South African businesses.
                            We deliver verified business contact information including email addresses
                            and phone numbers for potential clients in your target market.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">2. Free Leads Offer</h2>
                        <p className="mt-3">
                            New users receive 25 free leads upon sign-up. This offer is limited to
                            one per business and may be modified or discontinued at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">3. Lead Quality Guarantee</h2>
                        <p className="mt-3">
                            We guarantee 98% accuracy on verified leads. If you receive a lead with
                            invalid contact information (bounced email or disconnected phone),
                            we will credit your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">4. Acceptable Use</h2>
                        <p className="mt-3">You agree to:</p>
                        <ul className="mt-3 list-disc pl-6 space-y-2">
                            <li>Use leads only for legitimate business outreach</li>
                            <li>Comply with South African spam laws and regulations</li>
                            <li>Not resell or redistribute lead data</li>
                            <li>Respect the privacy of contacted businesses</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">5. Refund Policy</h2>
                        <p className="mt-3">
                            Paid subscriptions may be cancelled at any time. Refunds are provided
                            on a pro-rata basis for unused lead credits within the first 30 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">6. Limitation of Liability</h2>
                        <p className="mt-3">
                            Kasi AI provides leads as-is. We are not responsible for the outcome
                            of your outreach efforts or the business decisions of contacted parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">7. Contact</h2>
                        <p className="mt-3">
                            For questions about these terms, contact us at support@kasi.ai
                        </p>
                    </section>
                </div>
            </article>

            <Footer />
        </main>
    );
}
