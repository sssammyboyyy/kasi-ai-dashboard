import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F8F9FC]">
            <Sidebar />
            <main className="flex-1 lg:pl-64 transition-all duration-300">
                <div className="mx-auto max-w-[1920px]">
                    {children}
                </div>
            </main>
        </div>
    );
}
