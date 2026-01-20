"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Loader2, MessageSquare, Mail, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
    { id: 1, name: "Details", description: "Campaign basics" },
    { id: 2, name: "Channel", description: "Choose delivery method" },
    { id: 3, name: "Audience", description: "Select recipients" },
    { id: 4, name: "Review", description: "Confirm & launch" },
];

type Channel = "whatsapp" | "email" | null;

export default function NewCampaignPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [campaignDescription, setCampaignDescription] = useState("");
    const [channel, setChannel] = useState<Channel>(null);
    const [audienceType, setAudienceType] = useState<"all" | "new" | "contacted">("all");
    const router = useRouter();
    const supabase = createClient();

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return campaignName.trim().length > 0;
            case 2:
                return channel !== null;
            case 3:
                return audienceType !== null;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 4 && canProceed()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLaunch = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from("campaigns").insert({
                name: campaignName,
                description: campaignDescription,
                channel,
                audience_type: audienceType,
                status: "draft",
                created_by: user?.id,
            });

            if (error) throw error;

            router.push("/dashboard/campaigns");
            router.refresh();
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Campaigns
                    </Button>
                    <h1 className="text-2xl font-bold">Create New Campaign</h1>
                    <p className="text-muted-foreground">
                        Set up your outreach campaign in a few simple steps
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${currentStep > step.id
                                            ? "bg-primary border-primary text-white"
                                            : currentStep === step.id
                                                ? "border-primary text-primary"
                                                : "border-gray-300 text-gray-300"
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-gray-300"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        {steps.map((step) => (
                            <div key={step.id} className="text-center">
                                <p className={`text-xs font-medium ${currentStep === step.id ? "text-primary" : "text-gray-500"}`}>
                                    {step.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].name}</CardTitle>
                        <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Step 1: Details */}
                        {currentStep === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Q1 Property Launch"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description of this campaign..."
                                        value={campaignDescription}
                                        onChange={(e) => setCampaignDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}

                        {/* Step 2: Channel */}
                        {currentStep === 2 && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card
                                    className={`cursor-pointer transition-all ${channel === "whatsapp"
                                            ? "border-primary ring-2 ring-primary"
                                            : "hover:border-gray-400"
                                        }`}
                                    onClick={() => setChannel("whatsapp")}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-6">
                                        <div className="p-3 rounded-full bg-green-100 mb-3">
                                            <MessageSquare className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h3 className="font-medium">WhatsApp</h3>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Send messages via WhatsApp
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card
                                    className={`cursor-pointer transition-all ${channel === "email"
                                            ? "border-primary ring-2 ring-primary"
                                            : "hover:border-gray-400"
                                        }`}
                                    onClick={() => setChannel("email")}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-6">
                                        <div className="p-3 rounded-full bg-blue-100 mb-3">
                                            <Mail className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-medium">Email</h3>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Send email campaigns
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Audience */}
                        {currentStep === 3 && (
                            <div className="space-y-3">
                                {[
                                    { value: "all", label: "All Leads", description: "Target all leads in your database" },
                                    { value: "new", label: "New Leads Only", description: "Leads added in the last 7 days" },
                                    { value: "contacted", label: "Contacted Leads", description: "Leads that have been contacted before" },
                                ].map((option) => (
                                    <Card
                                        key={option.value}
                                        className={`cursor-pointer transition-all ${audienceType === option.value
                                                ? "border-primary ring-2 ring-primary"
                                                : "hover:border-gray-400"
                                            }`}
                                        onClick={() => setAudienceType(option.value as typeof audienceType)}
                                    >
                                        <CardContent className="flex items-center gap-4 p-4">
                                            <div className="p-2 rounded-full bg-purple-100">
                                                <Users className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{option.label}</h3>
                                                <p className="text-sm text-muted-foreground">{option.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Campaign Name</span>
                                        <span className="font-medium">{campaignName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Channel</span>
                                        <span className="font-medium capitalize">{channel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Audience</span>
                                        <span className="font-medium capitalize">{audienceType.replace("_", " ")}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Your campaign will be saved as a draft. You can launch it from the Campaigns page.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {currentStep < 4 ? (
                            <Button onClick={handleNext} disabled={!canProceed()}>
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleLaunch} disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Create Campaign
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
