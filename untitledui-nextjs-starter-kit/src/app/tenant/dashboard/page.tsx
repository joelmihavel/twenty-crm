import { TenantFlow } from "../tenant-flow";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ nav?: string; menu?: string }> }) {
    const params = await searchParams;
    const nav = params.nav || "overview";
    const menuOpen = params.menu === "open";
    return <TenantFlow initialNav={nav} initialMenuOpen={menuOpen} />;
}
