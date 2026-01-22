"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Truck,
    MessageSquare,
    BarChart3,
    CreditCard,
    Settings,
    Building2,
    LogOut,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: Users, badge: "489" },
    { name: "Fulfillment", href: "/dashboard/campaigns", icon: Truck },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Team", href: "/dashboard/team", icon: Building2 },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const supabase = createClient();

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") return true;
        if (path !== "/dashboard" && pathname.startsWith(path)) return true;
        return false;
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-100 bg-white transition-transform lg:translate-x-0">
            <div className="flex h-full flex-col px-4 py-6">
                {/* Header / Org Switcher */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                            D
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Default Org</p>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-medium text-emerald-600">LIVE SUPABASE</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive(item.href)
                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-white" : "text-slate-400"}`} />
                                {item.name}
                            </div>
                            {item.badge && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive(item.href) ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="mt-8 border-t border-slate-100 pt-4">
                    <div className="mb-4 rounded-xl bg-slate-50 p-4">
                        <h4 className="mb-1 text-xs font-bold text-slate-900">Notifications</h4>
                        <p className="text-xs text-slate-500">Enable push alerts?</p>
                    </div>

                    {/* User Profile Mini */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                U
                            </div>
                            <div className="overflow-hidden">
                                <p className="truncate text-xs font-bold text-slate-900">User</p>
                                <p className="truncate text-[10px] text-slate-400">user@kasi.ai</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
