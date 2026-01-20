"use client";

import { useState, useEffect, ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import {
    LayoutDashboard,
    Users,
    Megaphone,
    Settings,
    ChevronLeft,
    ChevronDown,
    Building2,
    MessageSquare,
    BarChart3,
    Bell,
    LogOut,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

interface NavItem {
    label: string;
    href: string;
    icon: ElementType;
    badge?: number;
}

interface Organization {
    id: string;
    name: string;
    logo?: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/dashboard/leads", icon: Users },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Team", href: "/dashboard/team", icon: Building2 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface UserProfile {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

const organizations: Organization[] = [
    { id: "1", name: "CleanPro Services" },
    { id: "2", name: "Apex Logistics" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [leadsCount, setLeadsCount] = useState<number>(0);
    const supabase = createClient();

    useEffect(() => {
        const loadSidebarData = async () => {
            console.log("Sidebar: Loading data...");
            try {
                // 1. Get Session & Profile
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Sidebar: Session error", sessionError);
                }

                if (session?.user) {
                    console.log("Sidebar: User found", session.user.email);
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profileError) {
                        console.error("Sidebar: Profile fetch error", profileError);
                    }

                    setProfile({
                        full_name: profileData?.full_name || 'User',
                        email: session.user.email || null,
                        avatar_url: profileData?.avatar_url || null
                    });
                }

                // 2. Get Organizations
                const { data: orgsData, error: orgError } = await supabase
                    .from('organizations')
                    .select('id, name');

                if (orgError) {
                    console.error("Sidebar: Org fetch error", orgError);
                }

                if (orgsData && orgsData.length > 0) {
                    const mappedOrgs = orgsData.map(o => ({ id: o.id, name: o.name }));
                    setOrganizations(mappedOrgs);
                    setCurrentOrg(mappedOrgs[0]);
                } else {
                    // Fallback for empty state / new users
                    const defaultOrg = { id: 'default', name: 'Default Org' };
                    setOrganizations([defaultOrg]);
                    setCurrentOrg(defaultOrg);
                }

                // 3. Get Leads Count
                const { count, error: countError } = await supabase
                    .from('leads')
                    .select('*', { count: 'exact', head: true });

                if (countError) {
                    console.error("Sidebar: Count error", countError);
                }

                setLeadsCount(count || 0);
            } catch (err) {
                console.error("Sidebar: Unexpected error", err);
            }
        };

        loadSidebarData();

        // Realtime leads count update
        const countChannel = supabase
            .channel('sidebar-count')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                () => {
                    setLeadsCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(countChannel);
        };
    }, [supabase]);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative flex h-screen flex-col border-r border-gray-200 bg-white"
        >
            {/* Logo & Collapse Toggle */}
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                <AnimatePresence mode="wait">
                    {!collapsed ? (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Logo className="h-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="icon"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600"
                        >
                            <Sparkles className="h-5 w-5 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                </button>
            </div>

            {/* Organization Switcher */}
            <div className="border-b border-gray-100 p-3">
                <button
                    onClick={() => !collapsed && setOrgDropdownOpen(!orgDropdownOpen)}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 transition-all",
                        "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100",
                        collapsed && "justify-center"
                    )}
                >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white">
                        {currentOrg?.name?.charAt(0) || 'K'}
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-gray-900">{currentOrg?.name || 'Loading...'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Supabase</p>
                                </div>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", orgDropdownOpen && "rotate-180")} />
                        </>
                    )}
                </button>

                {/* Org Dropdown */}
                <AnimatePresence>
                    {orgDropdownOpen && !collapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                        >
                            {organizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => {
                                        setCurrentOrg(org);
                                        setOrgDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50",
                                        org.id === currentOrg?.id && "bg-blue-50"
                                    )}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-gray-600">
                                        {org.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{org.name}</span>
                                </button>
                            ))}
                            <div className="border-t border-gray-100 p-2">
                                <button className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-blue-600 hover:bg-blue-50">
                                    <Building2 className="h-4 w-4" />
                                    Add Organization
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-all",
                                        isActive
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                        collapsed && "justify-center px-0"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />

                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{item.label}</span>
                                            {item.label === "Leads" && leadsCount > 0 && (
                                                <span className={cn(
                                                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                                                    isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {leadsCount}
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {/* Collapsed tooltip */}
                                    {collapsed && (
                                        <div className="absolute left-full ml-2 hidden rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                                            {item.label}
                                            {item.badge && ` (${item.badge})`}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-gray-100 p-3">
                {/* Notifications */}
                <button className={cn(
                    "mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-gray-600 transition-colors hover:bg-gray-100",
                    collapsed && "justify-center px-0"
                )}>
                    <div className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            5
                        </span>
                    </div>
                    {!collapsed && <span className="font-medium">Notifications</span>}
                </button>

                {/* User */}
                <div className={cn(
                    "flex items-center gap-3 rounded-xl bg-gray-50 p-3",
                    collapsed && "justify-center"
                )}>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 font-bold text-white overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || ''} className="h-full w-full object-cover" />
                        ) : (
                            profile?.full_name?.charAt(0) || 'S'
                        )}
                    </div>
                    {!collapsed && (
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Loading...'}</p>
                            <p className="text-xs text-gray-500 truncate w-32">{profile?.email || 'authenticated user'}</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600">
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
