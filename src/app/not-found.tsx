import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <Logo className="mx-auto h-12" />
                </div>

                <h1 className="font-outfit text-8xl font-bold text-blue-600">404</h1>
                <h2 className="mt-4 font-outfit text-2xl font-bold text-gray-900">
                    Page Not Found
                </h2>
                <p className="mt-4 text-gray-600">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto gap-2">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/get-started">
                        <Button variant="outline" className="w-full sm:w-auto gap-2">
                            Get Free Leads
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
