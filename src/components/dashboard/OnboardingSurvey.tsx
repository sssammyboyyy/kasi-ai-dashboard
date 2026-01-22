"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OnboardingSurveyProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
}

export function OnboardingSurvey({ open, onOpenChange, onComplete }: OnboardingSurveyProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        industry: "",
        role: "",
        dealSize: "",
        email: "" // Optional if not logged in
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // Send signal to Intelligence Engine
            const response = await fetch('/api/webhooks/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'survey_response',
                    source: 'onboarding_modal',
                    data: formData
                })
            });

            if (!response.ok) throw new Error('Failed to save preferences');

            // Success
            toast.success("Profile Updated", {
                description: "Optimizing your lead feed..."
            });

            // Wait a tiny bit for effect
            setTimeout(() => {
                setLoading(false);
                onComplete(); // Unlock the leads
                onOpenChange(false); // Close modal
            }, 800);

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong", {
                description: "Continuing anyway..."
            });
            setLoading(false);
            onComplete(); // Fallback: unlock anyway
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {step === 3 ? (
                            <span className="text-green-600 flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6" />
                                All Set!
                            </span>
                        ) : (
                            "Customize Your Feed"
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Help Kasi AI find the perfect contracts for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {/* Step 1: Industry */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label>What is your primary service?</Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, industry: val })}
                                    defaultValue={formData.industry}
                                >
                                    <SelectTrigger className="h-12 border-gray-200">
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cleaning">Commercial Cleaning</SelectItem>
                                        <SelectItem value="security">Private Security</SelectItem>
                                        <SelectItem value="logistics">Logistics & Transport</SelectItem>
                                        <SelectItem value="maintenance">Facility Maintenance</SelectItem>
                                        <SelectItem value="other">Other B2B Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>What is your role?</Label>
                                <Input
                                    placeholder="e.g. Owner, Sales Manager"
                                    className="h-12 border-gray-200"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Deal Size */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Label>What is your target deal size (Monthly)?</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'small', label: 'R 5k - R 20k', desc: 'Small Business Contracts' },
                                    { id: 'medium', label: 'R 20k - R 100k', desc: 'Mid-Market Corporate' },
                                    { id: 'large', label: 'R 100k+', desc: 'Enterprise / Tender' },
                                ].map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => setFormData({ ...formData, dealSize: option.label })}
                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:bg-gray-50 ${formData.dealSize === option.label
                                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                                : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{option.label}</p>
                                            <p className="text-sm text-gray-500">{option.desc}</p>
                                        </div>
                                        {formData.dealSize === option.label && (
                                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation / Email (Skipped for now, just confirm) */}
                    {step === 3 && (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Configuring Intelligence Engine...</h3>
                            <p className="text-gray-500 mt-2">Connecting you to high-value leads in {formData.industry || "your sector"}.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {step > 1 && step < 3 ? (
                        <Button variant="ghost" onClick={handleBack} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div></div>}

                    {step < 2 ? (
                        <Button
                            onClick={handleNext}
                            disabled={!formData.industry}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : step === 2 ? (
                        <Button
                            onClick={() => { setStep(3); handleSubmit(); }}
                            disabled={!formData.dealSize}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
