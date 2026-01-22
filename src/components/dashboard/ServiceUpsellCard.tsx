import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Rocket } from "lucide-react";

export function ServiceUpsellCard() {
    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Rocket className="h-24 w-24 text-indigo-600" />
            </div>

            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
                        Partner Exclusive
                    </span>
                </div>
                <CardTitle className="text-xl text-indigo-900">Unlock Expert Email Management</CardTitle>
                <CardDescription className="text-indigo-700">
                    Don't let your high-intent leads go cold. Let us manage your outreach.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>100k+ Monthly Sending Capacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>AI-Optimized Copywriting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Dedicated Deliverability Monitoring</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 group">
                    <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    Apply for Managed Services
                </Button>
            </CardFooter>
        </Card>
    );
}
