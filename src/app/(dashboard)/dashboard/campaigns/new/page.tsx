"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Rocket, Megaphone, Target, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewCampaignPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "email",
        targetIndustries: "",
        status: "draft"
    });

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Get current user's org
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { data: profile } = await supabase
                .from('profiles')
                .select('org_id')
                .eq('id', user.id)
                .single();

            if (!profile?.org_id) throw new Error("No organization found");

            const { error } = await supabase.from("campaigns").insert({
                name: formData.name,
                description: formData.description,
                type: formData.type,
                org_id: profile.org_id,
                status: "draft",
                target_industries: formData.targetIndustries.split(',').map(s => s.trim()).filter(Boolean),
                leads_collected: 0,
                leads_converted: 0
            });

            if (error) throw error;

            router.push("/dashboard/campaigns");
            router.refresh();
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign"); // Ideally use a toast here
        } finally {
            setLoading(false);
        }
    };

    const stepUpdates = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 gap-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Campaigns
                </Button>
                <h1 className="text-3xl font-bold font-outfit text-gray-900">Create New Campaign</h1>
                <p className="text-muted-foreground mt-2">
                    Follow the steps to set up your automated outreach campaign.
                </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Wizard Content */}
            <Card className="min-h-[400px] flex flex-col relative overflow-hidden">

                <CardContent className="flex-1 pt-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={stepUpdates}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                            <Megaphone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Campaign Details</h2>
                                            <p className="text-sm text-gray-500">Give your campaign a name and purpose</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Campaign Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Q1 Outreach - Tech Startups"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="What is the goal of this campaign?"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={stepUpdates}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Target Audience</h2>
                                            <p className="text-sm text-gray-500">Who are you trying to reach?</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industries">Target Industries</Label>
                                        <Input
                                            id="industries"
                                            placeholder="e.g., SaaS, Healthcare, Fintech (comma separated)"
                                            value={formData.targetIndustries}
                                            onChange={(e) => setFormData({ ...formData, targetIndustries: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This helps the AI optimize your messaging.
                                        </p>
                                    </div>

                                    {/* Mock Audience Selector */}
                                    <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                                        <p className="text-sm font-medium text-gray-700">Estimated Audience Size</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-gray-900">2,450+</span>
                                            <span className="text-sm text-gray-500">potential leads found</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={stepUpdates}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Channel & Type</h2>
                                            <p className="text-sm text-gray-500">How should we reach them?</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${formData.type === 'email' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                                            onClick={() => setFormData({ ...formData, type: 'email' })}
                                        >
                                            <div className="mb-2 font-semibold">Email Sequence</div>
                                            <div className="text-sm text-gray-500">Send personalized email drips</div>
                                        </div>
                                        <div
                                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${formData.type === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                                            onClick={() => setFormData({ ...formData, type: 'whatsapp' })}
                                        >
                                            <div className="mb-2 font-semibold">WhatsApp</div>
                                            <div className="text-sm text-gray-500">Direct instant messaging</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                variants={stepUpdates}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                                            <Rocket className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">Ready to Launch</h2>
                                            <p className="text-sm text-gray-500">Review your campaign details</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="font-medium text-gray-500">Name:</span>
                                            <span className="col-span-2 font-medium">{formData.name}</span>

                                            <span className="font-medium text-gray-500">Type:</span>
                                            <span className="col-span-2 capitalize">{formData.type}</span>

                                            <span className="font-medium text-gray-500">Target:</span>
                                            <span className="col-span-2">{formData.targetIndustries || "General"}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="border-t bg-gray-50/50 p-6 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1 || loading}
                    >
                        Back
                    </Button>

                    {step < totalSteps ? (
                        <Button
                            onClick={handleNext}
                            disabled={!formData.name && step === 1}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            Next Step <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            {loading ? (
                                "Creating..."
                            ) : (
                                <>
                                    <Check className="h-4 w-4" /> Create Campaign
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
