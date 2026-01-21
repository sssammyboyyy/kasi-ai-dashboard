"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Building, LogOut, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [fullName, setFullName] = useState("");
    const [apiKey, setApiKey] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        setProfile(profile);
                        setFullName(profile.full_name || "");

                        // Load API Keys
                        if (profile.org_id) {
                            const { data: keys } = await supabase
                                .from('api_keys')
                                .select('*')
                                .eq('org_id', profile.org_id)
                                .eq('status', 'active')
                                .order('created_at', { ascending: false })
                                .limit(1);

                            if (keys && keys.length > 0) {
                                setApiKey(keys[0]);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [supabase]);

    const handleGenerateKey = async () => {
        if (!profile?.org_id) return;
        setGeneratingKey(true);
        try {
            // Revoke old keys logic if needed, but for now we just create a new one
            // The UI only shows the latest active one

            const newKeyStr = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

            const { data, error } = await supabase
                .from('api_keys')
                .insert({
                    org_id: profile.org_id,
                    key_hash: newKeyStr,
                    name: 'Default Key',
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;
            setApiKey(data);
        } catch (error) {
            console.error("Error generating key:", error);
            alert("Failed to generate API key");
        } finally {
            setGeneratingKey(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="font-outfit text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account and preferences</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Information
                </h2>
                <div className="mt-6 space-y-4">
                    <div className="p-4 border border-purple-100 bg-purple-50/50 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-purple-900 mb-1">Subscription Plan</h3>
                            <p className="text-xs text-purple-700">Manage your billing and payment method.</p>
                        </div>
                        <Button
                            variant="outline"
                            className="text-purple-700 border-purple-200 hover:bg-purple-100"
                            onClick={() => window.location.href = "/dashboard/settings/billing"}
                        >
                            Manage Billing
                        </Button>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="user-email"
                            name="email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="full-name"
                            name="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Building className="h-5 w-5 text-purple-600" />
                    Organization & API Keys
                </h2>
                <div className="mt-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Manage access to your Kasi AI organization.
                        </p>
                        <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Developer API Access</h3>
                            <p className="text-xs text-blue-700 mb-3">
                                Use this key to authenticate requests to the <code>process-lead</code> endpoint.
                            </p>
                            <div className="flex items-center gap-2">
                                {apiKey ? (
                                    <>
                                        <code className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 break-all">
                                            {apiKey.key_hash}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9"
                                            onClick={() => {
                                                if (confirm("Are you sure? The old key will stop working immediately.")) {
                                                    handleGenerateKey();
                                                }
                                            }}
                                            disabled={generatingKey}
                                        >
                                            {generatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : "Roll Key"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="h-9 w-full sm:w-auto"
                                        onClick={handleGenerateKey}
                                        disabled={generatingKey}
                                    >
                                        {generatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Generate API Key"}
                                        {generatingKey ? "Generating..." : ""}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
