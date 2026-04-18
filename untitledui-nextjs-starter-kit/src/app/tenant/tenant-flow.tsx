"use client";

import type { FC } from "react";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    BarChartSquare01,
    Building02,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    CreditCard02,
    Download01,
    DotsHorizontal,
    Eye,
    FileCheck02,
    Home01,
    InfoCircle,
    LayersThree01,
    Link01,
    Lock01,
    LogOut01,
    Mail01,
    Menu01,
    Package,
    Phone,
    PieChart03,
    Plus,
    RefreshCcw01,
    SearchLg,
    Send01,
    Settings01,
    ShoppingCart01,
    Sliders01,
    SwitchHorizontal01,
    Tag01,
    Hash01,
    TrendUp01,
    Truck01,
    User01,
    UserPlus01,
    Users01,
    XCircle,
    XClose,
    Zap,
    Bell01,
    ClipboardCheck,
    Edit05,
    File01,
    Globe01,
    Grid01,
    List,
    Map01,
    Shield01,
    Star01,
    Target04,
    Tool01,
} from "@untitledui/icons";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Toggle } from "@/components/base/toggle/toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import {
    PROPERTIES,
    ROOMS,
    MERCHANTS,
    TENANTS,
    TENANT_CONTRACTS,
    MERCHANT_CONTRACTS,
    TICKETS,
    TRANSACTIONS,
    OVERHEADS,
    VENDORS,
    FSINS,
    ITEMS,
    INVENTORY,
    NOTIFICATIONS,
    USERS,
    ANALYTICS,
    OCCUPANCY,
    REVENUE,
    SETTINGS,
    PAYMENTS,
    RENTALS,
    PROJECTS,
    ACTIVITIES,
    ALERTS,
} from "./data";

// ─── Types ──────────────────────────────────────────────────────────────────

type Role = "Sales" | "PSM" | "Finance" | "Admin";

type Screen =
    // Global
    | "search" | "alerts" | "profile"
    // Sales
    | "lead-pipeline" | "new-tenant" | "tenant-detail"
    | "visit-scheduler" | "tenant-qualification"
    | "room-browser" | "tenant-matching" | "contract-creation" | "gestation-tracker"
    // PSM
    | "psm-dashboard" | "property-detail" | "room-detail" | "overhead-manager"
    | "ticket-queue" | "ticket-detail" | "new-ticket"
    | "move-in-checklist" | "move-out-fnf" | "room-transfer" | "contract-renewal"
    | "inventory-tracker" | "item-detail"
    // Finance
    | "transaction-ledger" | "new-transaction" | "transaction-detail" | "pending-auth"
    | "payment-link" | "landlord-payout"
    | "portfolio-overview" | "property-pnl" | "contract-pnl" | "deposit-register" | "overhead-payments"
    // Admin
    | "merchant-list" | "merchant-detail" | "property-pipeline" | "property-onboarding"
    | "merchant-contract" | "property-churn"
    | "vendor-list" | "vendor-detail" | "fsin-catalogue"
    | "user-management" | "notification-log" | "system-settings";

interface NavSection { label: string; items: { key: Screen; icon: FC<{ className?: string }>; label: string; badge?: string | number }[] }

const ROLE_NAV: Record<Role, NavSection[]> = {
    Sales: [
        { label: "Pipeline", items: [
            { key: "lead-pipeline", icon: Target04, label: "Lead Pipeline", badge: String(TENANTS.filter(t => t.rentalStatus === "Pending").length) },
            { key: "new-tenant", icon: UserPlus01, label: "New Tenant" },
        ]},
        { label: "Visits & Qualification", items: [
            { key: "visit-scheduler", icon: Calendar, label: "Visit Scheduler" },
            { key: "tenant-qualification", icon: ClipboardCheck, label: "Qualification" },
        ]},
        { label: "Matching & Contract", items: [
            { key: "room-browser", icon: Grid01, label: "Room Browser", badge: String(ROOMS.filter(r => r.roomStatus === "Available").length) },
            { key: "tenant-matching", icon: SwitchHorizontal01, label: "Tenant Matching" },
            { key: "contract-creation", icon: File01, label: "Contract Creation" },
            { key: "gestation-tracker", icon: List, label: "Gestation Tracker" },
        ]},
    ],
    PSM: [
        { label: "Properties", items: [
            { key: "psm-dashboard", icon: Home01, label: "My Dashboard" },
            { key: "overhead-manager", icon: Sliders01, label: "Overheads", badge: String(OVERHEADS.length) },
        ]},
        { label: "Tickets", items: [
            { key: "ticket-queue", icon: AlertCircle, label: "Ticket Queue", badge: String(TICKETS.filter(t => t.status !== "Closed").length) },
            { key: "new-ticket", icon: Plus, label: "New Ticket" },
        ]},
        { label: "Handoffs & Lifecycle", items: [
            { key: "move-in-checklist", icon: ClipboardCheck, label: "Move-in Checklist" },
            { key: "move-out-fnf", icon: LogOut01, label: "Move-out / FnF" },
            { key: "room-transfer", icon: SwitchHorizontal01, label: "Room Transfer" },
            { key: "contract-renewal", icon: RefreshCcw01, label: "Contract Renewal" },
        ]},
        { label: "Inventory", items: [
            { key: "inventory-tracker", icon: Package, label: "Inventory", badge: String(INVENTORY.filter(i => i.totalItems > 0).length) },
        ]},
    ],
    Finance: [
        { label: "Ledger", items: [
            { key: "transaction-ledger", icon: CreditCard02, label: "Transactions", badge: String(TRANSACTIONS.length) },
            { key: "new-transaction", icon: Plus, label: "New Transaction" },
            { key: "pending-auth", icon: Lock01, label: "Pending Auth", badge: String(TRANSACTIONS.filter(t => t.authorisedBy === "—" && t.status === "Pending").length) },
        ]},
        { label: "Collections & Payouts", items: [
            { key: "payment-link", icon: Link01, label: "Payment Link" },
            { key: "landlord-payout", icon: Send01, label: "Landlord Payout" },
        ]},
        { label: "Reports & Analytics", items: [
            { key: "portfolio-overview", icon: PieChart03, label: "Portfolio Overview" },
            { key: "property-pnl", icon: BarChartSquare01, label: "Property P&L" },
            { key: "contract-pnl", icon: File01, label: "Contract P&L" },
            { key: "deposit-register", icon: Shield01, label: "Deposit Register" },
            { key: "overhead-payments", icon: Sliders01, label: "Overhead Payments" },
        ]},
    ],
    Admin: [
        { label: "Supply Management", items: [
            { key: "merchant-list", icon: Users01, label: "Merchants", badge: String(MERCHANTS.length) },
            { key: "property-pipeline", icon: Target04, label: "Property Pipeline" },
            { key: "property-onboarding", icon: Building02, label: "Property Onboarding" },
            { key: "merchant-contract", icon: File01, label: "Merchant Contract" },
            { key: "property-churn", icon: XCircle, label: "Property Churn" },
        ]},
        { label: "Inventory Config", items: [
            { key: "vendor-list", icon: ShoppingCart01, label: "Vendors", badge: String(VENDORS.length) },
            { key: "fsin-catalogue", icon: Hash01, label: "FSINs", badge: String(FSINS.length) },
        ]},
        { label: "System", items: [
            { key: "user-management", icon: Users01, label: "Users", badge: String(USERS.length) },
            { key: "notification-log", icon: Bell01, label: "Notification Log" },
            { key: "system-settings", icon: Settings01, label: "Settings" },
        ]},
    ],
};

const GLOBAL_NAV: { key: Screen; icon: FC<{ className?: string }>; label: string }[] = [
    { key: "search", icon: SearchLg, label: "Search" },
    { key: "alerts", icon: Bell01, label: "Alerts" },
    { key: "profile", icon: User01, label: "My Profile" },
];

const SCREEN_LABELS: Record<Screen, string> = {
    search: "Search", alerts: "Alerts & Notifications", profile: "My Profile",
    "lead-pipeline": "Lead Pipeline", "new-tenant": "New Tenant", "tenant-detail": "Tenant Detail",
    "visit-scheduler": "Visit Scheduler", "tenant-qualification": "Qualification",
    "room-browser": "Room Browser", "tenant-matching": "Tenant Matching", "contract-creation": "Contract Creation", "gestation-tracker": "Gestation Tracker",
    "psm-dashboard": "My Dashboard", "property-detail": "Property Detail", "room-detail": "Room Detail", "overhead-manager": "Overheads",
    "ticket-queue": "Ticket Queue", "ticket-detail": "Ticket Detail", "new-ticket": "New Ticket",
    "move-in-checklist": "Move-in Checklist", "move-out-fnf": "Move-out / FnF", "room-transfer": "Room Transfer", "contract-renewal": "Contract Renewal",
    "inventory-tracker": "Inventory", "item-detail": "Item Detail",
    "transaction-ledger": "Transaction Ledger", "new-transaction": "New Transaction", "transaction-detail": "Transaction Detail", "pending-auth": "Pending Authorisations",
    "payment-link": "Payment Link", "landlord-payout": "Landlord Payout",
    "portfolio-overview": "Portfolio Overview", "property-pnl": "Property P&L", "contract-pnl": "Contract P&L", "deposit-register": "Deposit Register", "overhead-payments": "Overhead Payments",
    "merchant-list": "Merchants", "merchant-detail": "Merchant Detail", "property-pipeline": "Property Pipeline", "property-onboarding": "Property Onboarding",
    "merchant-contract": "Merchant Contract", "property-churn": "Property Churn",
    "vendor-list": "Vendors", "vendor-detail": "Vendor Detail", "fsin-catalogue": "FSIN Catalogue",
    "user-management": "User Management", "notification-log": "Notification Log", "system-settings": "System Settings",
};

const SELECT_PROPERTIES = PROPERTIES.map((p) => ({ id: p.id, label: p.name }));
const SELECT_MERCHANTS = MERCHANTS.map((m) => ({ id: m.id, label: `${m.firstName} ${m.lastName}` }));
const SELECT_ROOMS = ROOMS.map((r) => ({ id: r.id, label: `${r.id} (${PROPERTIES.find(p => p.id === r.pid)?.name || r.pid})` }));
const SELECT_VENDORS = VENDORS.map((v) => ({ id: v.id, label: v.name }));
const SELECT_TENANTS = TENANTS.map((t) => ({ id: t.id, label: t.name }));

// ─── Sidebar Nav Item ────────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, badge, onClick, href }: { icon: FC<{ className?: string }>; label: string; active?: boolean; badge?: string | number; onClick?: () => void; href?: string }) {
    const classes = `flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-sm transition duration-100 ease-linear ${active ? "bg-active font-semibold text-primary" : "font-medium text-tertiary hover:bg-primary_hover hover:text-secondary"}`;
    const content = (
        <>
            <Icon className={`size-[18px] shrink-0 ${active ? "text-fg-primary" : "text-fg-quaternary"}`} aria-hidden="true" />
            <span className="flex-1 truncate">{label}</span>
            {badge !== undefined && <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${active ? "bg-secondary text-secondary" : "text-quaternary"}`}>{badge}</span>}
        </>
    );
    if (href) return <a href={href} onClick={onClick} className={classes}>{content}</a>;
    return <button type="button" onClick={onClick} className={classes}>{content}</button>;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
    return (
        <div className="rounded-xl border border-secondary bg-primary px-5 py-4 shadow-xs">
            <p className="text-sm text-tertiary">{label}</p>
            <div className="mt-1 flex items-end justify-between">
                <p className="text-display-xs font-semibold text-primary">{value}</p>
                {change && (
                    <div className="flex items-center gap-0.5 pb-1">
                        {up ? <ArrowUpRight className="size-4 text-fg-success-secondary" aria-hidden="true" /> : <ArrowDownRight className="size-4 text-fg-error-secondary" aria-hidden="true" />}
                        <span className={`text-xs font-medium ${up ? "text-success-primary" : "text-error-primary"}`}>{change}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Reusable Table Shell ────────────────────────────────────────────────────

function TableShell({ title, subtitle, count, action, children }: { title: string; subtitle: string; count: number; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div><h2 className="text-sm font-semibold text-primary">{title}</h2><p className="mt-0.5 text-xs text-tertiary">{subtitle}</p></div>
                {action}
            </div>
            <div className="overflow-x-auto">{children}</div>
            <div className="flex flex-col items-center gap-2 border-t border-secondary px-4 py-3 sm:flex-row sm:justify-between sm:px-5">
                <p className="text-sm text-tertiary">Showing <span className="font-medium text-primary">{count}</span> results</p>
                <div className="flex items-center gap-1"><Button size="sm" color="secondary">Previous</Button><Button size="sm" color="secondary">Next</Button></div>
            </div>
        </div>
    );
}

// ─── Drawer helpers ─────────────────────────────────────────────────────────

function DrawerRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="shrink-0 text-sm text-tertiary">{label}</span>
            <span className="text-right text-sm font-medium text-primary">{value}</span>
        </div>
    );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-b border-secondary pb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">{title}</p>
            {children}
        </div>
    );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────

function ChartCard({ title, value, change, data, className, formatter }: { title: string; value: string; change: string; data: { month: string; value: number }[]; className?: string; formatter: (v: unknown) => string }) {
    return (
        <div className={`rounded-xl border border-secondary bg-primary shadow-xs ${className}`}>
            <div className="flex items-center justify-between px-5 pt-5">
                <div><p className="text-sm text-tertiary">{title}</p><p className="mt-0.5 text-display-xs font-semibold text-primary">{value}</p></div>
                <div className="flex items-center gap-1.5 rounded-full bg-success-primary px-2 py-0.5"><ArrowUpRight className="size-3 text-fg-success-primary" /><span className="text-xs font-medium text-success-primary">{change}</span></div>
            </div>
            <div className="mt-4 h-40 px-2 pb-4 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 8, bottom: 0, left: -12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-quaternary)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-quaternary)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatter(v)} />
                        <Tooltip content={<ChartTooltipContent formatter={(v) => `₹${Number(v).toLocaleString()}`} />} />
                        <Bar dataKey="value" name={title} radius={[3, 3, 0, 0]} maxBarSize={24}>
                            {data.map((_, i) => <Cell key={i} fill="var(--color-fg-primary)" fillOpacity={i === data.length - 1 ? 1 : 0.15} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Form Card wrapper ──────────────────────────────────────────────────────

function FormCard({ title, subtitle, icon, children, onSubmit, onCancel }: { title: string; subtitle: string; icon: FC<{ className?: string }>; children: React.ReactNode; onSubmit?: () => void; onCancel?: () => void }) {
    return (
        <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-secondary bg-primary p-5 shadow-xs sm:p-6">
                <div className="flex items-center gap-3">
                    <FeaturedIcon icon={icon} color="brand" theme="light" size="md" />
                    <div><h1 className="text-lg font-semibold text-primary">{title}</h1><p className="text-sm text-tertiary">{subtitle}</p></div>
                </div>
                <div className="mt-6 flex flex-col gap-4">{children}</div>
                {(onSubmit || onCancel) && (
                    <div className="mt-6 flex gap-3">
                        {onCancel && <Button size="md" color="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>}
                        {onSubmit && <Button size="md" color="primary" className="flex-1" onClick={onSubmit}>Submit</Button>}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Detail Page wrapper ────────────────────────────────────────────────────

function DetailPage({ title, subtitle, icon, children, onBack }: { title: string; subtitle: string; icon: FC<{ className?: string }>; children: React.ReactNode; onBack?: () => void }) {
    return (
        <>
            <div className="flex items-center gap-4">
                {onBack && <Button size="sm" color="secondary" onClick={onBack}>Back</Button>}
                <div className="flex items-center gap-3">
                    <FeaturedIcon icon={icon} color="brand" theme="light" size="md" />
                    <div><h1 className="text-lg font-semibold text-primary">{title}</h1><p className="text-sm text-tertiary">{subtitle}</p></div>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">{children}</div>
        </>
    );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-quaternary">{title}</p>
            {children}
        </div>
    );
}

// ─── TH helper ──────────────────────────────────────────────────────────────

function TH({ cols }: { cols: string[] }) {
    return (
        <thead><tr className="border-b border-secondary bg-secondary">
            {cols.map((h) => <th key={h} className={`px-5 py-3 text-left text-xs font-medium text-tertiary ${h === "" ? "text-right" : ""}`}>{h}</th>)}
        </tr></thead>
    );
}

function StatusBadge({ status }: { status: string }) {
    const color = status === "Active" || status === "Paid" || status === "Completed" || status === "Closed" || status === "Passed" || status === "Qualified" ? "success"
        : status === "Pending" || status === "In Progress" || status === "Partial" || status === "Warning" || status === "Fair" ? "warning"
        : status === "Failed" || status === "Overdue" || status === "Urgent" || status === "Error" || status === "Dead" ? "error"
        : "gray";
    return <Badge size="sm" color={color}>{status}</Badge>;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SCREENS
// ═══════════════════════════════════════════════════════════════════════════

function SearchPage({ navigate }: { navigate: (s: Screen) => void }) {
    const [query, setQuery] = useState("");
    const q = query.toLowerCase();
    const filteredTenants = q ? TENANTS.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)).slice(0, 5) : [];
    const filteredProps = q ? PROPERTIES.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)).slice(0, 5) : [];
    const filteredTickets = q ? TICKETS.filter(t => t.ticketName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)).slice(0, 5) : [];
    return (
        <>
            <div><h1 className="text-lg font-semibold text-primary">Global Search</h1><p className="mt-0.5 text-sm text-tertiary">Search across tenants, properties, tickets, and more.</p></div>
            <div className="mt-4"><Input placeholder="Search tenants, properties, tickets..." icon={SearchLg} size="md" value={query} onChange={setQuery} /></div>
            {q && (
                <div className="mt-6 space-y-6">
                    {filteredTenants.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">Tenants</p>
                            {filteredTenants.map(t => (
                                <button key={t.id} type="button" onClick={() => navigate("tenant-detail")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-primary_hover">
                                    <Avatar initials={t.name.split(" ").map(n => n[0]).join("")} size="sm" />
                                    <div><p className="text-sm font-medium text-primary">{t.name}</p><p className="text-xs text-tertiary">{t.email} &middot; {t.propertyName}</p></div>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredProps.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">Properties</p>
                            {filteredProps.map(p => (
                                <button key={p.id} type="button" onClick={() => navigate("property-detail")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-primary_hover">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><Building02 className="size-4 text-fg-tertiary" /></div>
                                    <div><p className="text-sm font-medium text-primary">{p.name}</p><p className="text-xs text-tertiary">{p.address}</p></div>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredTickets.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">Tickets</p>
                            {filteredTickets.map(t => (
                                <button key={t.id} type="button" onClick={() => navigate("ticket-detail")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-primary_hover">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><AlertCircle className="size-4 text-fg-tertiary" /></div>
                                    <div><p className="text-sm font-medium text-primary">{t.ticketName}</p><p className="text-xs text-tertiary">{t.id} &middot; {t.status}</p></div>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredTenants.length === 0 && filteredProps.length === 0 && filteredTickets.length === 0 && (
                        <p className="text-sm text-tertiary">No results found for &quot;{query}&quot;</p>
                    )}
                </div>
            )}
        </>
    );
}

function AlertsPage() {
    const allAlerts = [...NOTIFICATIONS.map(n => ({ ...n, source: "notification" as const })), ...ALERTS.map(a => ({ id: a.id, type: a.severity as string, message: a.message, timestamp: a.date, read: false, channel: "System" as const, recipient: "All", status: "Delivered" as const, source: "alert" as const }))];
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Alerts & Notifications</h1><p className="mt-0.5 text-sm text-tertiary">{allAlerts.filter(a => !a.read).length} unread notifications.</p></div>
                <Button size="sm" color="secondary">Mark All Read</Button>
            </div>
            <div className="mt-6 space-y-2">
                {allAlerts.map(a => (
                    <div key={a.id} className={`flex items-start gap-3 rounded-lg border p-4 ${a.read ? "border-secondary bg-primary" : "border-brand bg-brand-section_subtle"}`}>
                        <FeaturedIcon icon={a.type.includes("SLA") ? AlertCircle : a.type.includes("Payment") ? CreditCard02 : Bell01} color={a.read ? "gray" : "brand"} theme="light" size="sm" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Badge size="sm" color={a.type.includes("SLA") || a.type.includes("Failed") ? "error" : a.type.includes("Payment") || a.type.includes("Rent") ? "warning" : "gray"}>{a.type}</Badge>
                                <span className="text-xs text-quaternary">{a.timestamp}</span>
                            </div>
                            <p className="mt-1 text-sm text-primary">{a.message}</p>
                        </div>
                        {!a.read && <div className="mt-1 size-2 shrink-0 rounded-full bg-brand-solid" />}
                    </div>
                ))}
            </div>
        </>
    );
}

function ProfilePage() {
    const user = USERS[0];
    return (
        <FormCard title="My Profile" subtitle="Update your personal information and preferences." icon={User01}>
            <Input label="Full Name" value={user.name} size="sm" />
            <Input label="Email" value={user.email} size="sm" icon={Mail01} />
            <Input label="Role" value={user.role} size="sm" isDisabled />
            <Input label="Last Login" value={user.lastLogin} size="sm" isDisabled />
            <div className="border-t border-secondary pt-4">
                <h3 className="mb-3 text-sm font-semibold text-primary">Notifications</h3>
                <Toggle label="Email notifications" hint="Receive alerts via email" isSelected={SETTINGS.notifications.email} size="sm" />
                <Toggle label="SMS notifications" hint="Receive alerts via SMS" isSelected={SETTINGS.notifications.sms} size="sm" />
            </div>
            <div className="flex gap-3">
                <Button size="md" color="secondary" className="flex-1">Cancel</Button>
                <Button size="md" color="primary" className="flex-1">Save Changes</Button>
            </div>
        </FormCard>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES SCREENS (9)
// ═══════════════════════════════════════════════════════════════════════════

function LeadPipelinePage({ navigate }: { navigate: (s: Screen) => void }) {
    const stages = ["New Inquiry", "Visit Scheduled", "Visit Done", "Negotiation", "Converted", "Gestation", "Moved In", "Dead Lead", "Moved Out"] as const;
    const stageColors: Record<string, "gray" | "warning" | "brand" | "success" | "error"> = { "New Inquiry": "gray", "Visit Scheduled": "warning", "Visit Done": "warning", "Negotiation": "brand", "Converted": "brand", "Gestation": "brand", "Moved In": "success", "Dead Lead": "error", "Moved Out": "gray" };
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Lead Pipeline</h1><p className="mt-0.5 text-sm text-tertiary">Track tenant leads through lifecycle stages.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus} onClick={() => navigate("new-tenant")}>New Tenant</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Leads" value={String(TENANTS.length)} change="+5" up />
                <MetricCard label="Active Pipeline" value={String(TENANTS.filter(t => t.rentalStatus === "Pending").length)} change="+3" up />
                <MetricCard label="Converted" value={String(TENANTS.filter(t => t.lifecycle === "Converted" || t.lifecycle === "Moved In").length)} change="+2" up />
                <MetricCard label="Dead Leads" value={String(TENANTS.filter(t => t.lifecycle === "Dead Lead").length)} change="1" up={false} />
            </div>
            <div className="mt-6">
                <TableShell title="All Leads" subtitle="Tenant leads by lifecycle stage" count={TENANTS.length} action={<Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Name", "Phone", "Channel", "Budget", "Area", "Stage", "BGV", ""]} />
                        <tbody>{TENANTS.map((t) => (
                            <tr key={t.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("tenant-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><Avatar initials={t.name.split(" ").map(n => n[0]).join("")} size="sm" /><span className="text-sm font-medium text-primary">{t.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.phone}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{t.channel}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">₹{t.budget.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.preferredArea}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={stageColors[t.lifecycle] || "gray"}>{t.lifecycle}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={t.bgvStatus} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function NewTenantPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <FormCard title="New Tenant" subtitle="Create a new tenant lead record." icon={UserPlus01} onSubmit={() => navigate("lead-pipeline")} onCancel={() => navigate("lead-pipeline")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="First Name" placeholder="e.g. Rahul" icon={User01} isRequired />
                <Input label="Last Name" placeholder="e.g. Sharma" isRequired />
            </div>
            <Input label="Phone" placeholder="+91 98765 43210" icon={Phone} isRequired />
            <Input label="Email" placeholder="rahul@email.com" icon={Mail01} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Channel" placeholder="Select" items={[{ id: "Website" }, { id: "WhatsApp" }, { id: "Instagram" }, { id: "Walk-in" }, { id: "Referral" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
                <Input label="Budget" placeholder="₹15,000" type="number" />
            </div>
            <Input label="Preferred Area" placeholder="e.g. Koramangala" />
            <Select label="Assign Property" placeholder="Optional" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
        </FormCard>
    );
}

function TenantDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const tenant = TENANTS[0];
    const contract = TENANT_CONTRACTS.find(tc => tc.tenantId === tenant.id);
    const tenantPayments = PAYMENTS.filter(p => p.tenantId === tenant.id);
    return (
        <DetailPage title={tenant.name} subtitle={`${tenant.occupation} at ${tenant.employer}`} icon={User01} onBack={() => navigate("lead-pipeline")}>
            <DetailCard title="Contact">
                <DrawerRow label="Phone" value={tenant.phone} />
                <DrawerRow label="Email" value={tenant.email} />
                <DrawerRow label="Emergency" value={tenant.emergencyContact} />
                <DrawerRow label="ID Proof" value={tenant.idProof} />
                <DrawerRow label="Gender" value={tenant.gender} />
            </DetailCard>
            <DetailCard title="Lead Info">
                <DrawerRow label="Channel" value={tenant.channel} />
                <DrawerRow label="Source" value={tenant.sourceDD1} />
                <DrawerRow label="Budget" value={`₹${tenant.budget.toLocaleString()}`} />
                <DrawerRow label="Preferred Area" value={tenant.preferredArea} />
                <DrawerRow label="Lifecycle" value={tenant.lifecycle} />
                <DrawerRow label="Qualification" value={tenant.qualificationStatus || "—"} />
                <DrawerRow label="BGV" value={tenant.bgvStatus} />
            </DetailCard>
            <DetailCard title="Rental">
                <DrawerRow label="Property" value={tenant.propertyName} />
                <DrawerRow label="Room" value={tenant.rid || "—"} />
                <DrawerRow label="Rent" value={tenant.rentAmount} />
                <DrawerRow label="Security Deposit" value={tenant.securityDeposit} />
                <DrawerRow label="Move-in" value={tenant.moveIn} />
                <DrawerRow label="Status" value={tenant.rentalStatus} />
            </DetailCard>
            {contract && (
                <DetailCard title="Contract">
                    <DrawerRow label="Contract ID" value={contract.id} />
                    <DrawerRow label="Type" value={contract.contractType} />
                    <DrawerRow label="Start" value={contract.startDate} />
                    <DrawerRow label="End" value={contract.endDate} />
                    <DrawerRow label="Lock-in" value={`${contract.lockIn} months`} />
                    <DrawerRow label="Notice Period" value={`${contract.noticePeriod} months`} />
                    <DrawerRow label="Exit Fee" value={`₹${contract.exitFee.toLocaleString()}`} />
                </DetailCard>
            )}
            {tenantPayments.length > 0 && (
                <DetailCard title={`Payments (${tenantPayments.length})`}>
                    {tenantPayments.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center justify-between border-b border-secondary py-2 last:border-0">
                            <div><p className="text-sm text-primary">{p.purpose}</p><p className="text-xs text-quaternary">{p.date}</p></div>
                            <div className="text-right"><p className="text-sm font-medium text-primary">{p.amount}</p><StatusBadge status={p.status} /></div>
                        </div>
                    ))}
                </DetailCard>
            )}
            <DetailCard title="Satisfaction">
                <DrawerRow label="Onboarding CSAT" value={tenant.onboardingCsat ? `${tenant.onboardingCsat}/5` : "—"} />
                <DrawerRow label="Last NPS" value={tenant.lastNps !== null ? String(tenant.lastNps) : "—"} />
                <DrawerRow label="NPS Category" value={tenant.npsCategory || "—"} />
            </DetailCard>
        </DetailPage>
    );
}

function VisitSchedulerPage() {
    return (
        <FormCard title="Visit Scheduler" subtitle="Schedule a property visit for a lead." icon={Calendar} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Tenant Lead" placeholder="Select tenant" items={SELECT_TENANTS.filter(t => TENANTS.find(te => te.id === t.id)?.rentalStatus === "Pending")}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Property" placeholder="Select property" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Visit Date" type="date" placeholder="2026-04-15" />
                <Input label="Visit Time" type="time" placeholder="10:00" />
            </div>
            <Input label="Notes" placeholder="Any special requirements or instructions" />
            <Select label="Assign To" placeholder="Select team member" items={USERS.filter(u => u.role === "Sales").map(u => ({ id: u.id, label: u.name }))}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
        </FormCard>
    );
}

function TenantQualificationPage() {
    const lead = TENANTS.find(t => t.rentalStatus === "Pending" && t.lifecycle === "Visit Done") || TENANTS[14];
    return (
        <FormCard title="Tenant Qualification" subtitle={`Qualifying ${lead.name}`} icon={ClipboardCheck} onSubmit={() => {}} onCancel={() => {}}>
            <Input label="Tenant" value={lead.name} isDisabled />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Employer" placeholder={lead.employer} />
                <Input label="Occupation" placeholder={lead.occupation} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Monthly Income" placeholder="₹80,000" type="number" />
                <Input label="Budget" value={String(lead.budget)} />
            </div>
            <Select label="ID Proof Type" placeholder="Select" items={[{ id: "Aadhaar" }, { id: "PAN" }, { id: "Passport" }, { id: "Driving License" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <Input label="ID Number" placeholder="XXXX XXXX 1234" />
            <Checkbox label="Background verification initiated" />
            <Checkbox label="Employment verified" />
            <Checkbox label="Previous landlord reference checked" />
        </FormCard>
    );
}

function RoomBrowserPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Room Browser</h1><p className="mt-0.5 text-sm text-tertiary">Browse available rooms across all properties.</p></div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Rooms" value={String(ROOMS.length)} change="" up />
                <MetricCard label="Available" value={String(ROOMS.filter(r => r.roomStatus === "Available").length)} change="" up />
                <MetricCard label="Occupied" value={String(ROOMS.filter(r => r.roomStatus === "Occupied").length)} change="" up />
                <MetricCard label="Under Maintenance" value={String(ROOMS.filter(r => r.roomStatus === "Under Maintenance").length)} change="" up={false} />
            </div>
            <div className="mt-6">
                <TableShell title="All Rooms" subtitle={`${ROOMS.length} rooms across ${PROPERTIES.length} properties`} count={ROOMS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Room ID", "Property", "Bed Type", "AC", "Bathroom", "Rent", "Status", "Tenant", ""]} />
                        <tbody>{ROOMS.map((r) => {
                            const prop = PROPERTIES.find(p => p.id === r.pid);
                            return (
                                <tr key={r.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("room-detail")}>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-brand-secondary">{r.id}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{prop?.name || r.pid}</td>
                                    <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{r.bedType}</Badge></td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{r.ac ? r.acType : "No"}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{r.attachedBathroom ? "Attached" : "Shared"}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{r.baseRent.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={r.roomStatus} /></td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{r.currentTenantName}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function TenantMatchingPage() {
    return (
        <FormCard title="Tenant-Room Matching" subtitle="Match a qualified tenant to an available room." icon={SwitchHorizontal01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Tenant" placeholder="Select qualified tenant" items={SELECT_TENANTS.filter(t => { const te = TENANTS.find(x => x.id === t.id); return te && te.rentalStatus === "Pending" && te.qualificationStatus === "Qualified"; })}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Room" placeholder="Select available room" items={ROOMS.filter(r => r.roomStatus === "Available").map(r => ({ id: r.id, label: `${r.id} — ₹${r.baseRent.toLocaleString()} (${r.bedType}, ${r.ac ? "AC" : "Non-AC"})` }))}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Input label="Proposed Rent" placeholder="₹18,000" type="number" />
            <Input label="Proposed Move-in Date" type="date" placeholder="2026-05-01" />
            <Input label="Notes" placeholder="Any matching considerations" />
        </FormCard>
    );
}

function ContractCreationPage() {
    return (
        <FormCard title="Contract Creation" subtitle="Create a new tenant contract." icon={File01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Tenant" placeholder="Select tenant" items={SELECT_TENANTS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Property" placeholder="Select property" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Room" placeholder="Select room" items={SELECT_ROOMS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Contract Type" placeholder="Select" items={[{ id: "L&L", label: "Leave & License" }, { id: "C&S", label: "Company & Self" }]}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Start Date" type="date" />
                <Input label="End Date" type="date" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Monthly Rent" placeholder="₹18,000" type="number" />
                <Input label="Security Deposit" placeholder="₹36,000" type="number" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Lock-in (months)" placeholder="11" type="number" />
                <Input label="Notice Period (months)" placeholder="2" type="number" />
            </div>
            <Input label="Exit Fee" placeholder="₹5,000" type="number" />
            <Input label="Maintenance Fee" placeholder="₹2,500" type="number" />
        </FormCard>
    );
}

function GestationTrackerPage({ navigate }: { navigate: (s: Screen) => void }) {
    const gestationTenants = TENANTS.filter(t => t.lifecycle === "Gestation" || t.lifecycle === "Converted");
    return (
        <>
            <div><h1 className="text-lg font-semibold text-primary">Gestation Tracker</h1><p className="mt-0.5 text-sm text-tertiary">Track tenants in gestation phase before move-in.</p></div>
            <div className="mt-6">
                <TableShell title="Gestation Leads" subtitle={`${gestationTenants.length} tenants in gestation`} count={gestationTenants.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Name", "Phone", "Budget", "Area", "Stage", "BGV", ""]} />
                        <tbody>{gestationTenants.map(t => (
                            <tr key={t.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("tenant-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><Avatar initials={t.name.split(" ").map(n => n[0]).join("")} size="sm" /><span className="text-sm font-medium text-primary">{t.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.phone}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">₹{t.budget.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.preferredArea}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={t.lifecycle} /></td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={t.bgvStatus} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PSM SCREENS (13)
// ═══════════════════════════════════════════════════════════════════════════

function PSMDashboardPage({ navigate }: { navigate: (s: Screen) => void }) {
    const myProperties = PROPERTIES.filter(p => p.psmOwner === "Nisha Mehta").slice(0, 5);
    const openTickets = TICKETS.filter(t => t.status !== "Closed");
    const totalUnits = myProperties.reduce((s, p) => s + p.totalUnits, 0);
    const occupied = myProperties.reduce((s, p) => s + p.occupiedUnits, 0);
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">My Properties Dashboard</h1><p className="mt-0.5 text-sm text-tertiary">Overview of your assigned properties.</p></div>
                <Button size="sm" color="secondary" iconLeading={Calendar}>Apr 2026</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="My Properties" value={String(myProperties.length)} change="" up />
                <MetricCard label="Total Units" value={String(totalUnits)} change="" up />
                <MetricCard label="Occupied" value={String(occupied)} change={`${Math.round(occupied / totalUnits * 100)}%`} up />
                <MetricCard label="Open Tickets" value={String(openTickets.length)} change={`${openTickets.filter(t => t.priority === "Urgent" || t.priority === "High").length} urgent`} up={false} />
            </div>
            <div className="mt-6">
                <TableShell title="My Properties" subtitle={`${myProperties.length} assigned properties`} count={myProperties.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Type", "Units", "Occupied", "Status", "Landlord", ""]} />
                        <tbody>{myProperties.map(p => (
                            <tr key={p.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("property-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><Building02 className="size-4 text-fg-tertiary" /></div><span className="text-sm font-medium text-primary">{p.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{p.type}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.totalUnits}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.occupiedUnits}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={p.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.landlord}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function PropertyDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const prop = PROPERTIES[0];
    const propRooms = ROOMS.filter(r => r.pid === prop.id);
    const propTenants = TENANTS.filter(t => t.propertyId === prop.id);
    return (
        <DetailPage title={prop.name} subtitle={`${prop.address}, ${prop.city}`} icon={Building02} onBack={() => navigate("psm-dashboard")}>
            <DetailCard title="Property Details">
                <DrawerRow label="ID" value={prop.id} />
                <DrawerRow label="Type" value={prop.type} />
                <DrawerRow label="Furnishing" value={prop.furnishing} />
                <DrawerRow label="Floor" value={prop.floor} />
                <DrawerRow label="Parking" value={prop.parking} />
                <DrawerRow label="Power Backup" value={prop.powerBackup} />
                <DrawerRow label="Total Units" value={String(prop.totalUnits)} />
                <DrawerRow label="Occupied" value={String(prop.occupiedUnits)} />
                <DrawerRow label="Status" value={prop.status} />
            </DetailCard>
            <DetailCard title="Landlord">
                <DrawerRow label="Name" value={prop.landlord} />
                <DrawerRow label="Phone" value={prop.landlordPhone} />
                <DrawerRow label="Email" value={prop.landlordEmail} />
                <DrawerRow label="Merchant ID" value={prop.merchantId} />
            </DetailCard>
            <DetailCard title="Financials">
                <DrawerRow label="Base Rent" value={prop.rent} />
                <DrawerRow label="Maintenance" value={prop.maintenanceFee} />
                <DrawerRow label="Security Deposit" value={prop.securityDeposit} />
                <DrawerRow label="Lock-in" value={`${prop.lockInMonths} months`} />
            </DetailCard>
            <DetailCard title="Utilities">
                <DrawerRow label="WiFi" value={`${prop.wifi.provider} (${prop.wifi.speed})`} />
                <DrawerRow label="Electricity" value={`${prop.electricity.provider} — ${prop.electricity.accountNo}`} />
                <DrawerRow label="Water" value={prop.water} />
            </DetailCard>
            <DetailCard title={`Rooms (${propRooms.length})`}>
                {propRooms.map(r => (
                    <div key={r.id} className="flex items-center justify-between border-b border-secondary py-2 last:border-0">
                        <div><p className="text-sm font-medium text-brand-secondary">{r.id}</p><p className="text-xs text-quaternary">{r.bedType} &middot; ₹{r.baseRent.toLocaleString()}</p></div>
                        <StatusBadge status={r.roomStatus} />
                    </div>
                ))}
            </DetailCard>
            <DetailCard title={`Tenants (${propTenants.length})`}>
                {propTenants.map(t => (
                    <div key={t.id} className="flex items-center gap-3 border-b border-secondary py-2 last:border-0">
                        <Avatar initials={t.name.split(" ").map(n => n[0]).join("")} size="xs" />
                        <div><p className="text-sm font-medium text-primary">{t.name}</p><p className="text-xs text-quaternary">{t.occupation} &middot; {t.employer}</p></div>
                    </div>
                ))}
            </DetailCard>
        </DetailPage>
    );
}

function RoomDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const room = ROOMS[0];
    const prop = PROPERTIES.find(p => p.id === room.pid);
    return (
        <DetailPage title={room.id} subtitle={`${prop?.name || room.pid}`} icon={Grid01} onBack={() => navigate("room-browser")}>
            <DetailCard title="Room Details">
                <DrawerRow label="Property" value={prop?.name || room.pid} />
                <DrawerRow label="Bed Type" value={room.bedType} />
                <DrawerRow label="Attached Bathroom" value={room.attachedBathroom ? "Yes" : "No"} />
                <DrawerRow label="Balcony" value={room.balcony ? "Yes" : "No"} />
                <DrawerRow label="AC" value={room.ac ? room.acType : "No"} />
                <DrawerRow label="Study Table" value={room.studyTable ? "Yes" : "No"} />
            </DetailCard>
            <DetailCard title="Financial">
                <DrawerRow label="Base Rent" value={`₹${room.baseRent.toLocaleString()}`} />
                <DrawerRow label="Maintenance" value={`₹${room.maintenanceFee.toLocaleString()}`} />
                <DrawerRow label="Status" value={room.roomStatus} />
                <DrawerRow label="Tenant" value={room.currentTenantName} />
                <DrawerRow label="Contract" value={room.currentContractId || "—"} />
                <DrawerRow label="Available From" value={room.availableFrom} />
            </DetailCard>
        </DetailPage>
    );
}

function OverheadManagerPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Overhead Manager</h1><p className="mt-0.5 text-sm text-tertiary">Manage recurring and one-time property overheads.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus}>Add Overhead</Button>
            </div>
            <div className="mt-6">
                <TableShell title="All Overheads" subtitle={`${OVERHEADS.length} overhead entries`} count={OVERHEADS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Category", "Type", "Frequency", "Amount", "Next Due", "Landlord", "Tenant", ""]} />
                        <tbody>{OVERHEADS.map(oh => (
                            <tr key={oh.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{oh.pidName}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{oh.category}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={oh.objectType === "Recurring" ? "brand" : "warning"}>{oh.objectType}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.frequency}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{oh.amount.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.nextDueDate}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.paymentToLandlord ? "Yes" : "No"}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.collectionFromTenant ? "Yes" : "No"}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function TicketQueuePage({ navigate }: { navigate: (s: Screen) => void }) {
    const openTickets = TICKETS.filter(t => t.status !== "Closed");
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Ticket Queue</h1><p className="mt-0.5 text-sm text-tertiary">{openTickets.length} open tickets.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus} onClick={() => navigate("new-ticket")}>New Ticket</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Open" value={String(openTickets.length)} change="" up />
                <MetricCard label="Urgent" value={String(TICKETS.filter(t => t.priority === "Urgent").length)} change="" up={false} />
                <MetricCard label="Avg SLA Left" value={`${Math.round(openTickets.reduce((s, t) => s + t.slaHoursRemaining, 0) / Math.max(openTickets.length, 1))}h`} change="" up />
                <MetricCard label="Closed (Total)" value={String(TICKETS.filter(t => t.status === "Closed").length)} change="" up />
            </div>
            <div className="mt-6">
                <TableShell title="All Tickets" subtitle={`${TICKETS.length} total tickets`} count={TICKETS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Ticket", "Title", "Property", "Category", "Priority", "Status", "SLA", ""]} />
                        <tbody>{TICKETS.map(t => (
                            <tr key={t.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("ticket-detail")}>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-brand-secondary">{t.id}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{t.ticketName}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.pidName}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{t.category}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={t.priority === "Urgent" ? "error" : t.priority === "High" ? "warning" : t.priority === "Medium" ? "brand" : "gray"}>{t.priority}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={t.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.slaHoursRemaining > 0 ? `${t.slaHoursRemaining}h` : "—"}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function TicketDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const ticket = TICKETS[0];
    return (
        <DetailPage title={ticket.ticketName} subtitle={`${ticket.id} &middot; ${ticket.pidName}`} icon={AlertCircle} onBack={() => navigate("ticket-queue")}>
            <DetailCard title="Ticket Info">
                <DrawerRow label="ID" value={ticket.id} />
                <DrawerRow label="Pipeline" value={ticket.pipeline} />
                <DrawerRow label="Created By" value={ticket.createdByName} />
                <DrawerRow label="Created" value={ticket.createDate} />
                <DrawerRow label="Category" value={ticket.category} />
                <DrawerRow label="Priority" value={ticket.priority} />
                <DrawerRow label="Status" value={ticket.status} />
                <DrawerRow label="Owner" value={ticket.owner} />
            </DetailCard>
            <DetailCard title="Description">
                <p className="text-sm text-primary">{ticket.ticketDescription}</p>
            </DetailCard>
            <DetailCard title="Location">
                <DrawerRow label="Property" value={ticket.pidName} />
                <DrawerRow label="Room" value={ticket.rid || "—"} />
            </DetailCard>
            <DetailCard title="Vendor & Cost">
                <DrawerRow label="Vendor" value={ticket.assignedVendorName || "Unassigned"} />
                <DrawerRow label="Cost (Flent)" value={`₹${ticket.costPaidByFlent.toLocaleString()}`} />
                <DrawerRow label="From Tenant" value={`₹${ticket.collectedFromTenant.toLocaleString()}`} />
                <DrawerRow label="From Merchant" value={`₹${ticket.collectedFromMerchant.toLocaleString()}`} />
                <DrawerRow label="SLA Remaining" value={ticket.slaHoursRemaining > 0 ? `${ticket.slaHoursRemaining}h` : "Resolved"} />
            </DetailCard>
            {ticket.resolutionNotes && (
                <DetailCard title="Resolution">
                    <p className="text-sm text-primary">{ticket.resolutionNotes}</p>
                    {ticket.tenantRating && <DrawerRow label="Rating" value={`${ticket.tenantRating}/5`} />}
                    {ticket.csatFeedback && <DrawerRow label="Feedback" value={ticket.csatFeedback} />}
                </DetailCard>
            )}
        </DetailPage>
    );
}

function NewTicketPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <FormCard title="New Ticket" subtitle="Create a maintenance or service ticket." icon={AlertCircle} onSubmit={() => navigate("ticket-queue")} onCancel={() => navigate("ticket-queue")}>
            <Input label="Ticket Title" placeholder="e.g. Leaking faucet in kitchen" isRequired />
            <Input label="Description" placeholder="Describe the issue in detail" isRequired />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Property" placeholder="Select" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
                <Select label="Room" placeholder="Select" items={SELECT_ROOMS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Category" placeholder="Select" items={[{ id: "Plumbing" }, { id: "Electrical" }, { id: "Appliance" }, { id: "Carpentry" }, { id: "Utility" }, { id: "Reimbursement" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
                <Select label="Priority" placeholder="Select" items={[{ id: "Urgent" }, { id: "High" }, { id: "Medium" }, { id: "Low" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            </div>
            <Select label="Assign Vendor" placeholder="Optional" items={SELECT_VENDORS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
        </FormCard>
    );
}

function MoveInChecklistPage() {
    const recentMoveIns = TENANTS.filter(t => t.lifecycle === "Moved In").slice(0, 3);
    const tenant = recentMoveIns[0];
    return (
        <DetailPage title="Move-in Checklist" subtitle={`${tenant.name} — ${tenant.propertyName}`} icon={ClipboardCheck}>
            <DetailCard title="Pre Move-in">
                <Checkbox label="Contract signed and uploaded" isSelected />
                <Checkbox label="Security deposit received" isSelected />
                <Checkbox label="First month rent received" isSelected />
                <Checkbox label="ID proof verified" isSelected />
                <Checkbox label="BGV completed" isSelected />
            </DetailCard>
            <DetailCard title="Room Preparation">
                <Checkbox label="Room deep cleaned" isSelected />
                <Checkbox label="Inventory audit done" />
                <Checkbox label="WiFi credentials shared" isSelected />
                <Checkbox label="Key handover completed" />
                <Checkbox label="Utility meters noted" />
            </DetailCard>
            <DetailCard title="Post Move-in">
                <Checkbox label="Welcome kit delivered" />
                <Checkbox label="House rules shared" />
                <Checkbox label="Emergency contacts shared" />
                <Checkbox label="Onboarding CSAT collected" />
            </DetailCard>
            <DetailCard title="Tenant Details">
                <DrawerRow label="Name" value={tenant.name} />
                <DrawerRow label="Property" value={tenant.propertyName} />
                <DrawerRow label="Room" value={tenant.rid || "—"} />
                <DrawerRow label="Move-in Date" value={tenant.moveIn} />
                <DrawerRow label="Rent" value={tenant.rentAmount} />
            </DetailCard>
        </DetailPage>
    );
}

function MoveOutFnFPage() {
    const tenant = TENANTS.find(t => t.lifecycle === "Moved Out") || TENANTS[13];
    return (
        <FormCard title="Move-out / FnF Processor" subtitle={`Process final settlement for ${tenant.name}`} icon={LogOut01} onSubmit={() => {}} onCancel={() => {}}>
            <Input label="Tenant" value={tenant.name} isDisabled />
            <Input label="Property" value={tenant.propertyName} isDisabled />
            <Input label="Move-out Date" type="date" placeholder="2026-04-30" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Security Deposit" value={tenant.securityDeposit} isDisabled />
                <Input label="Pending Rent" placeholder="₹0" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Damages Deduction" placeholder="₹0" />
                <Input label="Cleaning Charges" placeholder="₹0" />
            </div>
            <Input label="Refund Amount" placeholder="₹24,000" isDisabled />
            <Checkbox label="Room inspection completed" />
            <Checkbox label="Inventory audit completed" />
            <Checkbox label="Keys returned" />
        </FormCard>
    );
}

function RoomTransferPage() {
    return (
        <FormCard title="Room Transfer" subtitle="Transfer a tenant to a different room." icon={SwitchHorizontal01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Tenant" placeholder="Select" items={SELECT_TENANTS.filter(t => TENANTS.find(te => te.id === t.id)?.rentalStatus === "Active")}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Current Room" placeholder="Current room" items={SELECT_ROOMS} isDisabled>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="New Room" placeholder="Select new room" items={ROOMS.filter(r => r.roomStatus === "Available").map(r => ({ id: r.id, label: `${r.id} — ₹${r.baseRent.toLocaleString()}` }))}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Input label="Transfer Date" type="date" placeholder="2026-05-01" />
            <Input label="New Rent" placeholder="₹18,000" type="number" />
            <Input label="Reason" placeholder="e.g. Tenant requested upgrade" />
        </FormCard>
    );
}

function ContractRenewalPage() {
    const expiringContracts = TENANT_CONTRACTS.filter(tc => tc.status === "Active").slice(0, 5);
    return (
        <FormCard title="Contract Renewal" subtitle="Renew an expiring tenant contract." icon={RefreshCcw01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Contract" placeholder="Select expiring contract" items={expiringContracts.map(tc => ({ id: tc.id, label: `${tc.id} — ${tc.tenantName} (${tc.pidName})` }))}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="New Start Date" type="date" />
                <Input label="New End Date" type="date" />
            </div>
            <Input label="New Rent" placeholder="₹19,800" type="number" hint="Typically 5-10% increment" />
            <Input label="New Lock-in (months)" placeholder="11" type="number" />
            <Checkbox label="Tenant has agreed to new terms" />
            <Checkbox label="Merchant/Landlord has approved" />
        </FormCard>
    );
}

function InventoryTrackerPage({ navigate }: { navigate: (s: Screen) => void }) {
    const totalItems = INVENTORY.reduce((sum, inv) => sum + inv.totalItems, 0);
    const totalValue = INVENTORY.reduce((sum, inv) => sum + parseInt(inv.totalValue.replace(/[₹,]/g, "") || "0"), 0);
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Inventory Tracker</h1><p className="mt-0.5 text-sm text-tertiary">Property-level inventory overview.</p></div>
                <Button size="sm" color="primary" iconLeading={Download01}>Export Report</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Items" value={String(totalItems)} change="+12" up />
                <MetricCard label="Total Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} change="+8%" up />
                <MetricCard label="Properties Tracked" value={String(INVENTORY.filter(i => i.totalItems > 0).length)} change="" up />
                <MetricCard label="Audits Overdue" value={String(INVENTORY.filter(i => i.auditStatus === "Overdue").length)} change="" up={false} />
            </div>
            <div className="mt-6">
                <TableShell title="Inventory by Property" subtitle={`${INVENTORY.length} properties`} count={INVENTORY.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Items", "Moveable", "Static", "Consumable", "Value", "Audit", "Status", ""]} />
                        <tbody>{INVENTORY.map((row, i) => (
                            <tr key={i} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("item-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><Package className="size-4 text-fg-tertiary" /></div><span className="text-sm font-medium text-primary">{row.propertyName}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{row.totalItems}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{row.moveableItems}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{row.staticItems}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{row.consumableItems}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{row.totalValue}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{row.lastAudit}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={row.auditStatus} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right">{row.discrepancies > 0 && <Badge size="sm" color="error">{row.discrepancies} issue{row.discrepancies > 1 ? "s" : ""}</Badge>}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function ItemDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const item = ITEMS[0];
    return (
        <DetailPage title={item.name} subtitle={`${item.fsin} &middot; ${item.category}`} icon={Tag01} onBack={() => navigate("inventory-tracker")}>
            <DetailCard title="Item Details">
                <DrawerRow label="ID" value={item.id} />
                <DrawerRow label="FSIN" value={item.fsin} />
                <DrawerRow label="Type" value={item.type} />
                <DrawerRow label="Category" value={item.category} />
                <DrawerRow label="Condition" value={item.condition} />
                <DrawerRow label="State" value={item.state} />
                <DrawerRow label="Serial No." value={item.serialNo} />
            </DetailCard>
            <DetailCard title="Location & Cost">
                <DrawerRow label="Property" value={item.propertyName} />
                <DrawerRow label="Room" value={item.rid || "Warehouse"} />
                <DrawerRow label="Quantity" value={String(item.quantity)} />
                <DrawerRow label="Unit Cost" value={item.unitCost} />
                <DrawerRow label="Last Audit" value={item.lastAudit} />
                <DrawerRow label="Vendor" value={item.vendor} />
            </DetailCard>
        </DetailPage>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCE SCREENS (11)
// ═══════════════════════════════════════════════════════════════════════════

function TransactionLedgerPage({ navigate }: { navigate: (s: Screen) => void }) {
    const credits = TRANSACTIONS.filter(t => t.creditDebit === "Credit");
    const debits = TRANSACTIONS.filter(t => t.creditDebit === "Debit");
    const totalCredit = credits.reduce((s, t) => s + t.amount, 0);
    const totalDebit = debits.reduce((s, t) => s + t.amount, 0);
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Transaction Ledger</h1><p className="mt-0.5 text-sm text-tertiary">All financial transactions.</p></div>
                <div className="flex gap-2">
                    <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
                    <Button size="sm" color="primary" iconLeading={Plus} onClick={() => navigate("new-transaction")}>New Transaction</Button>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Credits" value={`₹${totalCredit.toLocaleString()}`} change={`${credits.length} txns`} up />
                <MetricCard label="Total Debits" value={`₹${totalDebit.toLocaleString()}`} change={`${debits.length} txns`} up={false} />
                <MetricCard label="Net" value={`₹${(totalCredit - totalDebit).toLocaleString()}`} change="" up={totalCredit > totalDebit} />
                <MetricCard label="Pending" value={String(TRANSACTIONS.filter(t => t.status === "Pending").length)} change="" up={false} />
            </div>
            <div className="mt-6">
                <TableShell title="All Transactions" subtitle={`${TRANSACTIONS.length} transactions`} count={TRANSACTIONS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["ID", "Date", "Type", "From", "To", "Amount", "Purpose", "Channel", "Status", ""]} />
                        <tbody>{TRANSACTIONS.map(t => (
                            <tr key={t.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("transaction-detail")}>
                                <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-brand-secondary">{t.id.slice(-8)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.date}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={t.creditDebit === "Credit" ? "success" : "error"}>{t.creditDebit}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.fromParty}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.toParty}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{t.amount.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{t.purpose2}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.paymentChannel}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={t.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function NewTransactionPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <FormCard title="New Transaction" subtitle="Record a new financial transaction." icon={CreditCard02} onSubmit={() => navigate("transaction-ledger")} onCancel={() => navigate("transaction-ledger")}>
            <Select label="Type" placeholder="Credit or Debit" items={[{ id: "Credit" }, { id: "Debit" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Purpose" placeholder="Select" items={[{ id: "Rent" }, { id: "Deposit" }, { id: "Vendor" }, { id: "Maintenance" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
                <Input label="Amount" placeholder="₹18,000" type="number" isRequired />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="From" placeholder="e.g. Rahul Sharma" isRequired />
                <Input label="To" placeholder="e.g. Flent" isRequired />
            </div>
            <Select label="Payment Channel" placeholder="Select" items={[{ id: "UPI" }, { id: "NEFT" }, { id: "Auto-debit (NACH)" }, { id: "Payment Link" }, { id: "Cash" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <Input label="Date" type="date" isRequired />
            <Select label="Property" placeholder="Select" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Input label="Description" placeholder="e.g. Monthly Rent — Apr 2026" />
        </FormCard>
    );
}

function TransactionDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const txn = TRANSACTIONS[0];
    return (
        <DetailPage title={`₹${txn.amount.toLocaleString()}`} subtitle={txn.lineItemDesc} icon={CreditCard02} onBack={() => navigate("transaction-ledger")}>
            <DetailCard title="Transaction">
                <DrawerRow label="ID" value={txn.id} />
                <DrawerRow label="Date" value={txn.date} />
                <DrawerRow label="Type" value={txn.creditDebit} />
                <DrawerRow label="Purpose" value={`${txn.purpose1} — ${txn.purpose2}`} />
                <DrawerRow label="Status" value={txn.status} />
                <DrawerRow label="Created By" value={txn.createdBy} />
                <DrawerRow label="Authorised By" value={txn.authorisedBy} />
            </DetailCard>
            <DetailCard title="Parties">
                <DrawerRow label="From" value={`${txn.fromParty} (${txn.fromPartyType})`} />
                <DrawerRow label="To" value={`${txn.toParty} (${txn.toPartyType})`} />
                <DrawerRow label="Property" value={txn.pid || "—"} />
                <DrawerRow label="Room" value={txn.rid || "—"} />
                <DrawerRow label="Contract" value={txn.contractUid || "—"} />
            </DetailCard>
            <DetailCard title="Payment Details">
                <DrawerRow label="Channel" value={txn.paymentChannel} />
                <DrawerRow label="Provider" value={txn.paymentProvider} />
                <DrawerRow label="Gateway Ref" value={txn.gatewayRef} />
                <DrawerRow label="Settlement Ref" value={txn.settlementRef} />
            </DetailCard>
        </DetailPage>
    );
}

function PendingAuthPage({ navigate }: { navigate: (s: Screen) => void }) {
    const pending = TRANSACTIONS.filter(t => t.authorisedBy === "—" && t.status === "Pending");
    return (
        <>
            <div><h1 className="text-lg font-semibold text-primary">Pending Authorisations</h1><p className="mt-0.5 text-sm text-tertiary">{pending.length} transactions awaiting approval.</p></div>
            <div className="mt-6">
                <TableShell title="Pending Auth" subtitle="Transactions needing approval" count={pending.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["ID", "Date", "Type", "From", "To", "Amount", "Purpose", "Status", ""]} />
                        <tbody>{pending.map(t => (
                            <tr key={t.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("transaction-detail")}>
                                <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-brand-secondary">{t.id.slice(-8)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.date}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={t.creditDebit === "Credit" ? "success" : "error"}>{t.creditDebit}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.fromParty}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{t.toParty}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{t.amount.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{t.purpose2}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="warning">Pending</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><div className="flex gap-1"><Button size="xs" color="primary">Approve</Button><Button size="xs" color="secondary-destructive">Reject</Button></div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function PaymentLinkPage() {
    return (
        <FormCard title="Payment Link Sender" subtitle="Generate and send a payment link to a tenant." icon={Link01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Tenant" placeholder="Select tenant" items={SELECT_TENANTS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Input label="Amount" placeholder="₹18,000" type="number" isRequired />
            <Select label="Purpose" placeholder="Select" items={[{ id: "Rent" }, { id: "Deposit" }, { id: "Maintenance" }, { id: "Penalty" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <Input label="Due Date" type="date" isRequired />
            <Input label="Message" placeholder="Hi, your rent payment for April is due..." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Checkbox label="Send via WhatsApp" isSelected />
                <Checkbox label="Send via Email" isSelected />
            </div>
        </FormCard>
    );
}

function LandlordPayoutPage() {
    const pendingPayouts = TRANSACTIONS.filter(t => t.creditDebit === "Debit" && t.toPartyType === "Landlord" && t.status === "Pending");
    return (
        <FormCard title="Landlord Payout Run" subtitle="Process landlord rent payouts for the period." icon={Send01} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Month" placeholder="Select" items={[{ id: "Apr 2026" }, { id: "May 2026" }, { id: "Jun 2026" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <div className="border-t border-secondary pt-4">
                <p className="mb-3 text-sm font-semibold text-primary">Pending Payouts ({pendingPayouts.length})</p>
                {pendingPayouts.length > 0 ? pendingPayouts.map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-secondary py-2">
                        <div><p className="text-sm text-primary">{p.toParty}</p><p className="text-xs text-quaternary">{p.lineItemDesc}</p></div>
                        <p className="text-sm font-medium text-primary">₹{p.amount.toLocaleString()}</p>
                    </div>
                )) : <p className="text-sm text-tertiary">No pending payouts for this period.</p>}
            </div>
            <Checkbox label="I confirm all collections have been reconciled" />
            <Checkbox label="Approved by finance head" />
        </FormCard>
    );
}

function PortfolioOverviewPage() {
    const totalRev = TRANSACTIONS.filter(t => t.creditDebit === "Credit").reduce((s, t) => s + t.amount, 0);
    const totalCost = TRANSACTIONS.filter(t => t.creditDebit === "Debit").reduce((s, t) => s + t.amount, 0);
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Portfolio Overview</h1><p className="mt-0.5 text-sm text-tertiary">Financial health of your entire portfolio.</p></div>
                <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Revenue" value={`₹${totalRev.toLocaleString()}`} change="+18%" up />
                <MetricCard label="Total COGS" value={`₹${totalCost.toLocaleString()}`} change="" up={false} />
                <MetricCard label="Gross Margin" value={`₹${(totalRev - totalCost).toLocaleString()}`} change="" up={totalRev > totalCost} />
                <MetricCard label="Properties" value={String(PROPERTIES.filter(p => p.dealStage === "Under Contract").length)} change="" up />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartCard title="Monthly Revenue" value={ANALYTICS.totalRevenueYTD} change="+18%" data={ANALYTICS.monthlyRevenue} formatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                <ChartCard title="Tenant Growth" value={String(ANALYTICS.tenantGrowth[ANALYTICS.tenantGrowth.length - 1].count)} change="+26" data={ANALYTICS.tenantGrowth.map(d => ({ month: d.month, value: d.count }))} formatter={(v) => String(v)} />
            </div>
        </>
    );
}

function PropertyPnLPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Property P&L</h1><p className="mt-0.5 text-sm text-tertiary">Profit & loss by property.</p></div>
                <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
            </div>
            <div className="mt-6">
                <TableShell title="P&L by Property" subtitle={`${PROPERTIES.filter(p => p.dealStage === "Under Contract").length} active properties`} count={PROPERTIES.filter(p => p.dealStage === "Under Contract").length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Revenue", "COGS", "Overheads", "Gross Margin", "Margin %"]} />
                        <tbody>{PROPERTIES.filter(p => p.dealStage === "Under Contract").map(p => {
                            const rev = TRANSACTIONS.filter(t => t.pid === p.id && t.creditDebit === "Credit").reduce((s, t) => s + t.amount, 0);
                            const mc = MERCHANT_CONTRACTS.find(mc => mc.pid === p.id);
                            const cogs = mc?.baseRent || 0;
                            const oh = OVERHEADS.filter(o => o.pid === p.id).reduce((s, o) => s + o.amount, 0);
                            const margin = rev - cogs - oh;
                            const marginPct = rev > 0 ? Math.round((margin / rev) * 100) : 0;
                            return (
                                <tr key={p.id} className="border-t border-secondary hover:bg-primary_hover">
                                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{p.name}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">₹{rev.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">₹{cogs.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">₹{oh.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{margin.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={marginPct > 0 ? "success" : "error"}>{marginPct}%</Badge></td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function ContractPnLPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Contract P&L</h1><p className="mt-0.5 text-sm text-tertiary">Profit & loss by tenant contract.</p></div>
                <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
            </div>
            <div className="mt-6">
                <TableShell title="P&L by Contract" subtitle={`${TENANT_CONTRACTS.length} contracts`} count={TENANT_CONTRACTS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Contract", "Tenant", "Property", "Rent", "Maintenance", "Effective Rent", "Status"]} />
                        <tbody>{TENANT_CONTRACTS.map(tc => (
                            <tr key={tc.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-brand-secondary">{tc.id}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{tc.tenantName}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{tc.pidName}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">₹{tc.totalRetailRent.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">₹{tc.maintenanceFee.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{tc.effectiveRent.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={tc.status} /></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function DepositRegisterPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Deposit Register</h1><p className="mt-0.5 text-sm text-tertiary">Track security deposits across all contracts.</p></div>
                <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <MetricCard label="Total Deposits Held" value={`₹${TENANT_CONTRACTS.reduce((s, tc) => s + tc.securityDeposit, 0).toLocaleString()}`} change="" up />
                <MetricCard label="Active Contracts" value={String(TENANT_CONTRACTS.filter(tc => tc.status === "Active").length)} change="" up />
                <MetricCard label="Avg Deposit" value={`₹${Math.round(TENANT_CONTRACTS.reduce((s, tc) => s + tc.securityDeposit, 0) / TENANT_CONTRACTS.length).toLocaleString()}`} change="" up />
            </div>
            <div className="mt-6">
                <TableShell title="Deposit Register" subtitle={`${TENANT_CONTRACTS.length} contracts`} count={TENANT_CONTRACTS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Contract", "Tenant", "Property", "Deposit", "Caution", "Start", "End", "Status"]} />
                        <tbody>{TENANT_CONTRACTS.map(tc => (
                            <tr key={tc.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-brand-secondary">{tc.id}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{tc.tenantName}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{tc.pidName}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{tc.securityDeposit.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">₹{tc.cautionDeposit.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{tc.startDate}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{tc.endDate}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={tc.status} /></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function OverheadPaymentsPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Overhead Payments</h1><p className="mt-0.5 text-sm text-tertiary">Track overhead expenses across properties.</p></div>
                <Button size="sm" color="secondary" iconLeading={Download01}>Export</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <MetricCard label="Total Monthly" value={`₹${OVERHEADS.filter(o => o.frequency === "Monthly").reduce((s, o) => s + o.amount, 0).toLocaleString()}`} change="" up={false} />
                <MetricCard label="Recurring" value={String(OVERHEADS.filter(o => o.objectType === "Recurring").length)} change="" up />
                <MetricCard label="One-Time" value={String(OVERHEADS.filter(o => o.objectType === "One-Time").length)} change="" up />
            </div>
            <div className="mt-6">
                <TableShell title="All Overheads" subtitle={`${OVERHEADS.length} entries`} count={OVERHEADS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Category", "Type", "Frequency", "Amount", "Next Due", "Paid by Landlord", "Collected from Tenant"]} />
                        <tbody>{OVERHEADS.map(oh => (
                            <tr key={oh.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{oh.pidName}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{oh.category}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={oh.objectType === "Recurring" ? "brand" : "warning"}>{oh.objectType}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.frequency}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">₹{oh.amount.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.nextDueDate}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.paymentToLandlord ? "Yes" : "No"}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{oh.collectionFromTenant ? "Yes" : "No"}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SCREENS (12)
// ═══════════════════════════════════════════════════════════════════════════

function MerchantListPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Merchants</h1><p className="mt-0.5 text-sm text-tertiary">Manage property owners and landlords.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus}>Add Merchant</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <MetricCard label="Total Merchants" value={String(MERCHANTS.length)} change="" up />
                <MetricCard label="Active" value={String(MERCHANTS.filter(m => m.status === "Active").length)} change="" up />
                <MetricCard label="Leads" value={String(MERCHANTS.filter(m => m.status === "Lead").length)} change="" up />
                <MetricCard label="Total Properties" value={String(MERCHANTS.reduce((s, m) => s + m.activeProperties, 0))} change="" up />
            </div>
            <div className="mt-6">
                <TableShell title="All Merchants" subtitle={`${MERCHANTS.length} registered`} count={MERCHANTS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Name", "Phone", "Email", "City", "Source", "Properties", "Status", ""]} />
                        <tbody>{MERCHANTS.map(m => (
                            <tr key={m.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("merchant-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><Avatar initials={`${m.firstName[0]}${m.lastName[0]}`} size="sm" /><span className="text-sm font-medium text-primary">{m.prefix} {m.firstName} {m.lastName}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{m.phone}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{m.email}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{m.city}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{m.leadSource}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{m.activeProperties}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={m.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function MerchantDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const merchant = MERCHANTS[0];
    const merchantProps = PROPERTIES.filter(p => p.merchantId === merchant.id);
    const mc = MERCHANT_CONTRACTS.find(c => c.merchantId === merchant.id);
    return (
        <DetailPage title={`${merchant.prefix} ${merchant.firstName} ${merchant.lastName}`} subtitle={`${merchant.city} &middot; ${merchant.id}`} icon={Users01} onBack={() => navigate("merchant-list")}>
            <DetailCard title="Contact">
                <DrawerRow label="Phone" value={merchant.phone} />
                <DrawerRow label="Email" value={merchant.email} />
                <DrawerRow label="City" value={merchant.city} />
                <DrawerRow label="Lead Source" value={merchant.leadSource} />
                <DrawerRow label="First Added" value={merchant.firstAdded} />
            </DetailCard>
            <DetailCard title="Compliance">
                <DrawerRow label="PAN" value={merchant.panNumber} />
                <DrawerRow label="Bank Account" value={merchant.bankAccount} />
                <DrawerRow label="IFSC" value={merchant.ifscCode} />
                <DrawerRow label="Signing Authority" value={merchant.signingAuthority ? "Yes" : "No"} />
                <DrawerRow label="Status" value={merchant.status} />
            </DetailCard>
            {mc && (
                <DetailCard title="Merchant Contract">
                    <DrawerRow label="Contract ID" value={mc.id} />
                    <DrawerRow label="Base Rent" value={`₹${mc.baseRent.toLocaleString()}`} />
                    <DrawerRow label="Deposit" value={`₹${mc.securityDeposit.toLocaleString()}`} />
                    <DrawerRow label="Term" value={mc.serviceTerm} />
                    <DrawerRow label="Increment" value={`${mc.incrementPct}% ${mc.incrementFrequency}`} />
                    <DrawerRow label="Mgmt Fee" value={`₹${mc.managementFee.toLocaleString()}`} />
                    <DrawerRow label="Status" value={mc.agreementStatus} />
                </DetailCard>
            )}
            <DetailCard title={`Properties (${merchantProps.length})`}>
                {merchantProps.map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-secondary py-2 last:border-0">
                        <div><p className="text-sm font-medium text-primary">{p.name}</p><p className="text-xs text-quaternary">{p.address}</p></div>
                        <StatusBadge status={p.status} />
                    </div>
                ))}
            </DetailCard>
        </DetailPage>
    );
}

function PropertyPipelinePage({ navigate }: { navigate: (s: Screen) => void }) {
    const stages = ["To be contacted", "Evaluation", "Qualified", "Negotiations Started", "Under Contract"] as const;
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Property Pipeline</h1><p className="mt-0.5 text-sm text-tertiary">Track property supply pipeline by deal stage.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus} onClick={() => navigate("property-onboarding")}>New Property</Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
                {stages.map(stage => (
                    <MetricCard key={stage} label={stage} value={String(PROPERTIES.filter(p => p.dealStage === stage).length)} change="" up />
                ))}
            </div>
            <div className="mt-6">
                <TableShell title="All Properties" subtitle={`${PROPERTIES.length} total`} count={PROPERTIES.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Property", "Type", "Units", "Landlord", "Deal Stage", "Cluster", "Deal Owner", ""]} />
                        <tbody>{PROPERTIES.map(p => (
                            <tr key={p.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("property-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><Building02 className="size-4 text-fg-tertiary" /></div><span className="text-sm font-medium text-primary">{p.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{p.type}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.totalUnits}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.landlord}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={p.dealStage === "Under Contract" ? "success" : p.dealStage === "Negotiations Started" ? "brand" : p.dealStage === "Qualified" ? "warning" : "gray"}>{p.dealStage}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.cluster}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{p.dealOwner}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function PropertyOnboardingPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <FormCard title="Property Onboarding" subtitle="Add a new property to the platform." icon={Building02} onSubmit={() => navigate("property-pipeline")} onCancel={() => navigate("property-pipeline")}>
            <Input label="Property Name" placeholder="e.g. Sarjapur Road Residency" isRequired />
            <Input label="Address" placeholder="Full address" isRequired />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="City" value="Bangalore" isDisabled />
                <Select label="Type" placeholder="Select" items={[{ id: "Apartment" }, { id: "Coliving" }, { id: "Studio" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Total Units" placeholder="8" type="number" isRequired />
                <Select label="Furnishing" placeholder="Select" items={[{ id: "Fully Furnished" }, { id: "Semi Furnished" }, { id: "Unfurnished" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            </div>
            <Select label="Merchant / Landlord" placeholder="Select" items={SELECT_MERCHANTS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Base Rent" placeholder="₹55,000" type="number" />
                <Input label="Security Deposit" placeholder="₹1,10,000" type="number" />
            </div>
            <Select label="Deal Owner" placeholder="Select" items={USERS.map(u => ({ id: u.id, label: u.name }))}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
        </FormCard>
    );
}

function MerchantContractPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <FormCard title="Merchant Contract" subtitle="Create or edit a merchant contract." icon={File01} onSubmit={() => navigate("merchant-list")} onCancel={() => navigate("merchant-list")}>
            <Select label="Merchant" placeholder="Select" items={SELECT_MERCHANTS}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Select label="Property" placeholder="Select" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Base Rent" placeholder="₹55,000" type="number" isRequired />
                <Input label="Security Deposit" placeholder="₹1,10,000" type="number" isRequired />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Start Date" type="date" isRequired />
                <Input label="Service Term" placeholder="24 months" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Increment %" placeholder="5" type="number" />
                <Select label="Increment Frequency" placeholder="Select" items={[{ id: "Annual" }, { id: "Biennial" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            </div>
            <Input label="Management Fee" placeholder="₹5,000" type="number" />
            <Select label="Payment Cycle" placeholder="Select" items={[{ id: "Prepaid" }, { id: "Postpaid" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
        </FormCard>
    );
}

function PropertyChurnPage() {
    return (
        <FormCard title="Property Churn" subtitle="Process a property exit from the portfolio." icon={XCircle} onSubmit={() => {}} onCancel={() => {}}>
            <Select label="Property" placeholder="Select property to churn" items={SELECT_PROPERTIES}>{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
            <Input label="Churn Date" type="date" isRequired />
            <Select label="Reason" placeholder="Select" items={[{ id: "Landlord Request" }, { id: "Low Occupancy" }, { id: "High Maintenance" }, { id: "Contract Expiry" }, { id: "Other" }]}>{(item) => <Select.Item id={item.id}>{item.id}</Select.Item>}</Select>
            <Input label="Notes" placeholder="Additional details about the churn" />
            <Checkbox label="All tenants have been relocated or notified" />
            <Checkbox label="Security deposit settlement initiated" />
            <Checkbox label="Inventory audit completed" />
            <Checkbox label="Keys returned to landlord" />
        </FormCard>
    );
}

function VendorListPage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">Vendors</h1><p className="mt-0.5 text-sm text-tertiary">Manage supplier relationships.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus}>Add Vendor</Button>
            </div>
            <div className="mt-6">
                <TableShell title="All Vendors" subtitle={`${VENDORS.length} registered vendors`} count={VENDORS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Vendor", "Category", "Contact", "City", "Orders", "Total Spend", "Rating", "Status", ""]} />
                        <tbody>{VENDORS.map(v => (
                            <tr key={v.id} className="cursor-pointer border-t border-secondary hover:bg-primary_hover" onClick={() => navigate("vendor-detail")}>
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><ShoppingCart01 className="size-4 text-fg-tertiary" /></div><div><span className="text-sm font-medium text-primary">{v.name}</span><br /><span className="text-xs text-quaternary">{v.vendorType}</span></div></div></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{v.specialization.split(" ")[0]}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><div><span className="text-sm text-primary">{v.contactPerson}</span><br /><span className="text-xs text-quaternary">{v.phone}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{v.city}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{v.totalOrders}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{v.totalSpend}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{v.rating}/5</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={v.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><ChevronRight className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function VendorDetailPage({ navigate }: { navigate: (s: Screen) => void }) {
    const vendor = VENDORS[0];
    const vendorItems = ITEMS.filter(i => i.vendor === vendor.name);
    return (
        <DetailPage title={vendor.name} subtitle={`${vendor.specialization} &middot; ${vendor.city}`} icon={ShoppingCart01} onBack={() => navigate("vendor-list")}>
            <DetailCard title="Contact">
                <DrawerRow label="Contact Person" value={vendor.contactPerson} />
                <DrawerRow label="Phone" value={vendor.phone} />
                <DrawerRow label="Email" value={vendor.email} />
                <DrawerRow label="Address" value={vendor.address} />
                <DrawerRow label="Type" value={vendor.vendorType} />
            </DetailCard>
            <DetailCard title="Compliance">
                <DrawerRow label="GST No." value={vendor.gstNo} />
                <DrawerRow label="PAN No." value={vendor.panNo} />
                <DrawerRow label="Quality Tier" value={vendor.qualityTier} />
                <DrawerRow label="Std Fit" value={vendor.standardisationFit} />
                <DrawerRow label="TAT" value={`${vendor.tat} days`} />
            </DetailCard>
            <DetailCard title="Purchase History">
                <DrawerRow label="Total Orders" value={String(vendor.totalOrders)} />
                <DrawerRow label="Total Spend" value={vendor.totalSpend} />
                <DrawerRow label="Last Order" value={vendor.lastOrder} />
                <DrawerRow label="Payment Terms" value={vendor.paymentTerms} />
                <DrawerRow label="Rating" value={`${vendor.rating}/5`} />
            </DetailCard>
            {vendorItems.length > 0 && (
                <DetailCard title={`Items Supplied (${vendorItems.length})`}>
                    {vendorItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b border-secondary py-2 last:border-0">
                            <div><p className="text-sm text-primary">{item.name}</p><p className="text-xs text-quaternary">{item.propertyName}</p></div>
                            <p className="text-sm font-medium text-primary">{item.unitCost}</p>
                        </div>
                    ))}
                </DetailCard>
            )}
        </DetailPage>
    );
}

function FSINCataloguePage({ navigate }: { navigate: (s: Screen) => void }) {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">FSIN Catalogue</h1><p className="mt-0.5 text-sm text-tertiary">Flemp Standard Identification Numbers — master item catalogue.</p></div>
                <Button size="sm" color="primary" iconLeading={Plus}>Create FSIN</Button>
            </div>
            <div className="mt-6">
                <TableShell title="All FSINs" subtitle={`${FSINS.length} registered`} count={FSINS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["FSIN", "Name", "Category", "Type", "Unit", "Std Cost", "Qty", "Properties", "HSN", ""]} />
                        <tbody>{FSINS.map(f => (
                            <tr key={f.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-secondary"><Hash01 className="size-4 text-fg-tertiary" /></div><span className="text-sm font-medium text-brand-secondary">{f.id}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{f.name}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{f.category}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={f.type === "Moveable" ? "brand" : f.type === "Static" ? "gray" : "warning"}>{f.type}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{f.unitOfMeasure}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-primary">{f.standardCost}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-primary">{f.totalQuantity}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{f.allocatedProperties}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-quaternary">{f.hsnCode}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function UserManagementPage() {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-lg font-semibold text-primary">User Management</h1><p className="mt-0.5 text-sm text-tertiary">Manage internal team members and roles.</p></div>
                <Button size="sm" color="primary" iconLeading={UserPlus01}>Invite User</Button>
            </div>
            <div className="mt-6">
                <TableShell title="Team Members" subtitle={`${USERS.length} users`} count={USERS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Name", "Email", "Role", "Properties", "Last Login", "Status", ""]} />
                        <tbody>{USERS.map(u => (
                            <tr key={u.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3"><div className="flex items-center gap-3"><Avatar initials={u.name.split(" ").map(n => n[0]).join("")} size="sm" /><span className="text-sm font-medium text-primary">{u.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{u.email}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={u.role === "Admin" ? "brand" : u.role === "Sales" ? "success" : u.role === "Finance" ? "warning" : "gray"}>{u.role}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{u.assignedProperties}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{u.lastLogin}</td>
                                <td className="whitespace-nowrap px-5 py-3"><StatusBadge status={u.status} /></td>
                                <td className="whitespace-nowrap px-5 py-3 text-right"><button type="button" className="rounded-md p-1 text-fg-quaternary hover:bg-secondary"><DotsHorizontal className="size-4" /></button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function NotificationLogPage() {
    return (
        <>
            <div><h1 className="text-lg font-semibold text-primary">Notification Log</h1><p className="mt-0.5 text-sm text-tertiary">System-wide notification delivery log.</p></div>
            <div className="mt-6">
                <TableShell title="All Notifications" subtitle={`${NOTIFICATIONS.length} sent`} count={NOTIFICATIONS.length}>
                    <table className="w-full" data-mobile-compact>
                        <TH cols={["Type", "Message", "Channel", "Recipient", "Timestamp", "Status"]} />
                        <tbody>{NOTIFICATIONS.map(n => (
                            <tr key={n.id} className="border-t border-secondary hover:bg-primary_hover">
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color={n.type.includes("SLA") ? "error" : n.type.includes("Payment") ? "warning" : "gray"}>{n.type}</Badge></td>
                                <td className="max-w-xs truncate px-5 py-3 text-sm text-primary">{n.message}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="gray">{n.channel}</Badge></td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{n.recipient}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-sm text-tertiary">{n.timestamp}</td>
                                <td className="whitespace-nowrap px-5 py-3"><Badge size="sm" color="success">{n.status}</Badge></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </TableShell>
            </div>
        </>
    );
}

function SystemSettingsPage() {
    return (
        <>
            <div><h1 className="text-lg font-semibold text-primary">System Settings</h1><p className="mt-0.5 text-sm text-tertiary">Manage workspace preferences.</p></div>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
                    <h2 className="text-sm font-semibold text-primary">General</h2>
                    <div className="mt-4 flex flex-col gap-4">
                        <Input label="Company Name" value={SETTINGS.companyName} size="sm" />
                        <Input label="Timezone" value={SETTINGS.timezone} size="sm" isDisabled />
                        <Input label="Currency" value={SETTINGS.currency} size="sm" isDisabled />
                        <Input label="Date Format" value={SETTINGS.dateFormat} size="sm" isDisabled />
                    </div>
                </div>
                <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
                    <h2 className="text-sm font-semibold text-primary">Notifications</h2>
                    <div className="mt-4 flex flex-col gap-4">
                        <Toggle label="Email notifications" hint="Receive alerts via email" isSelected={SETTINGS.notifications.email} size="sm" />
                        <Toggle label="SMS notifications" hint="Receive alerts via SMS" isSelected={SETTINGS.notifications.sms} size="sm" />
                        <Toggle label="Push notifications" hint="Browser push for urgent alerts" isSelected={SETTINGS.notifications.push} size="sm" />
                    </div>
                </div>
                <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs lg:col-span-2">
                    <h2 className="text-sm font-semibold text-primary">Team Members</h2>
                    <div className="mt-4">
                        <table className="w-full" data-mobile-compact>
                            <thead><tr className="border-b border-secondary">{["Name", "Role", "Email"].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-tertiary">{h}</th>)}</tr></thead>
                            <tbody>{SETTINGS.team.map((m, i) => (
                                <tr key={i} className="border-t border-secondary">
                                    <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar initials={m.name.split(" ").map(n => n[0]).join("")} size="sm" /><span className="text-sm font-medium text-primary">{m.name}</span></div></td>
                                    <td className="px-4 py-3"><Badge size="sm" color={m.role === "Admin" ? "brand" : "gray"}>{m.role}</Badge></td>
                                    <td className="px-4 py-3 text-sm text-tertiary">{m.email}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN ROUTER
// ═══════════════════════════════════════════════════════════════════════════

function ScreenContent({ screen, navigate }: { screen: Screen; navigate: (s: Screen) => void }) {
    switch (screen) {
        // Global
        case "search": return <SearchPage navigate={navigate} />;
        case "alerts": return <AlertsPage />;
        case "profile": return <ProfilePage />;
        // Sales
        case "lead-pipeline": return <LeadPipelinePage navigate={navigate} />;
        case "new-tenant": return <NewTenantPage navigate={navigate} />;
        case "tenant-detail": return <TenantDetailPage navigate={navigate} />;
        case "visit-scheduler": return <VisitSchedulerPage />;
        case "tenant-qualification": return <TenantQualificationPage />;
        case "room-browser": return <RoomBrowserPage navigate={navigate} />;
        case "tenant-matching": return <TenantMatchingPage />;
        case "contract-creation": return <ContractCreationPage />;
        case "gestation-tracker": return <GestationTrackerPage navigate={navigate} />;
        // PSM
        case "psm-dashboard": return <PSMDashboardPage navigate={navigate} />;
        case "property-detail": return <PropertyDetailPage navigate={navigate} />;
        case "room-detail": return <RoomDetailPage navigate={navigate} />;
        case "overhead-manager": return <OverheadManagerPage />;
        case "ticket-queue": return <TicketQueuePage navigate={navigate} />;
        case "ticket-detail": return <TicketDetailPage navigate={navigate} />;
        case "new-ticket": return <NewTicketPage navigate={navigate} />;
        case "move-in-checklist": return <MoveInChecklistPage />;
        case "move-out-fnf": return <MoveOutFnFPage />;
        case "room-transfer": return <RoomTransferPage />;
        case "contract-renewal": return <ContractRenewalPage />;
        case "inventory-tracker": return <InventoryTrackerPage navigate={navigate} />;
        case "item-detail": return <ItemDetailPage navigate={navigate} />;
        // Finance
        case "transaction-ledger": return <TransactionLedgerPage navigate={navigate} />;
        case "new-transaction": return <NewTransactionPage navigate={navigate} />;
        case "transaction-detail": return <TransactionDetailPage navigate={navigate} />;
        case "pending-auth": return <PendingAuthPage navigate={navigate} />;
        case "payment-link": return <PaymentLinkPage />;
        case "landlord-payout": return <LandlordPayoutPage />;
        case "portfolio-overview": return <PortfolioOverviewPage />;
        case "property-pnl": return <PropertyPnLPage />;
        case "contract-pnl": return <ContractPnLPage />;
        case "deposit-register": return <DepositRegisterPage />;
        case "overhead-payments": return <OverheadPaymentsPage />;
        // Admin
        case "merchant-list": return <MerchantListPage navigate={navigate} />;
        case "merchant-detail": return <MerchantDetailPage navigate={navigate} />;
        case "property-pipeline": return <PropertyPipelinePage navigate={navigate} />;
        case "property-onboarding": return <PropertyOnboardingPage navigate={navigate} />;
        case "merchant-contract": return <MerchantContractPage navigate={navigate} />;
        case "property-churn": return <PropertyChurnPage />;
        case "vendor-list": return <VendorListPage navigate={navigate} />;
        case "vendor-detail": return <VendorDetailPage navigate={navigate} />;
        case "fsin-catalogue": return <FSINCataloguePage navigate={navigate} />;
        case "user-management": return <UserManagementPage />;
        case "notification-log": return <NotificationLogPage />;
        case "system-settings": return <SystemSettingsPage />;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD SHELL
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultScreen(role: Role): Screen {
    switch (role) {
        case "Sales": return "lead-pipeline";
        case "PSM": return "psm-dashboard";
        case "Finance": return "transaction-ledger";
        case "Admin": return "merchant-list";
    }
}

function DashboardShell({ initialNav, initialMenuOpen }: { initialNav?: string; initialMenuOpen?: boolean }) {
    const [role, setRole] = useState<Role>("Sales");
    const [activeScreen, setActiveScreen] = useState<Screen>((initialNav as Screen) || getDefaultScreen("Sales"));
    const [mobileNavOpen, setMobileNavOpen] = useState(initialMenuOpen ?? false);
    const { theme, setTheme } = useTheme();

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
        setActiveScreen(getDefaultScreen(newRole));
    };

    const navigate = (screen: Screen) => {
        setActiveScreen(screen);
    };

    const handleMobileNav = (screen: Screen) => {
        setActiveScreen(screen);
        setMobileNavOpen(false);
    };

    const navHref = (nav: string) => `/tenant/dashboard?nav=${nav}`;

    const roleNav = ROLE_NAV[role];

    const renderSidebarContent = (isMobile: boolean) => {
        const onNav = isMobile ? handleMobileNav : navigate;
        return (
            <>
                {/* Logo */}
                <div className="flex items-center justify-between px-4 pb-1 pt-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-solid"><Home01 className="size-4 text-fg-white" /></div>
                        <span className="text-sm font-semibold text-primary">Flent</span>
                    </div>
                    {isMobile && (
                        <a href={navHref(activeScreen)} onClick={(e) => { e.preventDefault(); setMobileNavOpen(false); }} className="rounded-md p-1.5 text-fg-quaternary hover:bg-secondary"><XClose className="size-5" /></a>
                    )}
                </div>

                {/* Role Switcher */}
                <div className="px-3 pt-3">
                    <div className="flex gap-1 rounded-lg bg-secondary p-1">
                        {(["Sales", "PSM", "Finance", "Admin"] as Role[]).map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => handleRoleChange(r)}
                                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition duration-100 ease-linear ${role === r ? "bg-primary text-primary shadow-xs" : "text-tertiary hover:text-secondary"}`}
                            >{r}</button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                {!isMobile && <div className="px-3 pt-3"><Input placeholder="Search" icon={SearchLg} size="sm" /></div>}

                {/* Nav sections */}
                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-3 pb-2">
                    {roleNav.map(section => (
                        <div key={section.label}>
                            <p className="mt-4 mb-1.5 px-2.5 text-xs font-semibold text-quaternary">{section.label}</p>
                            {section.items.map(item => (
                                <NavItem
                                    key={item.key}
                                    icon={item.icon}
                                    label={item.label}
                                    badge={item.badge}
                                    active={activeScreen === item.key}
                                    onClick={() => onNav(item.key)}
                                    href={isMobile ? navHref(item.key) : undefined}
                                />
                            ))}
                        </div>
                    ))}

                    <p className="mt-5 mb-1.5 px-2.5 text-xs font-semibold text-quaternary">Global</p>
                    {GLOBAL_NAV.map(item => (
                        <NavItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            active={activeScreen === item.key}
                            onClick={() => onNav(item.key)}
                            href={isMobile ? navHref(item.key) : undefined}
                        />
                    ))}
                </nav>

                {/* Dark mode */}
                <div className="border-t border-secondary px-3 py-3">
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                        <Toggle label="Dark mode" size="sm" isSelected={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
                    </div>
                </div>

                {/* User footer */}
                <div className="border-t border-secondary px-3 py-3">
                    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
                        <Avatar initials="SJ" size="sm" />
                        <div className="flex-1 truncate">
                            <p className="truncate text-sm font-semibold text-primary">Srashti Jain</p>
                            <p className="truncate text-xs text-tertiary">srashti@flent.in</p>
                        </div>
                        <LogOut01 className="size-4 shrink-0 text-fg-quaternary" />
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="flex h-dvh overflow-hidden bg-primary">
            {/* Mobile nav overlay */}
            {mobileNavOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <a href={navHref(activeScreen)} className="absolute inset-0 bg-overlay/60" onClick={(e) => { e.preventDefault(); setMobileNavOpen(false); }} />
                    <aside className="relative z-10 flex w-[280px] flex-col bg-primary shadow-xl">
                        {renderSidebarContent(true)}
                    </aside>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden w-[240px] shrink-0 flex-col border-r border-secondary lg:flex">
                {renderSidebarContent(false)}
            </aside>

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center gap-3 border-b border-secondary px-4 py-3 lg:px-6">
                    <a href={`/tenant/dashboard?nav=${activeScreen}&menu=open`} onClick={(e) => { e.preventDefault(); setMobileNavOpen(true); }} className="rounded-md p-1.5 text-fg-quaternary hover:bg-secondary lg:hidden"><Menu01 className="size-5" /></a>
                    <nav className="flex items-center gap-1 text-sm">
                        <span className="hidden text-quaternary sm:inline">{role}</span>
                        <ChevronRight className="hidden size-4 text-fg-quaternary sm:block" />
                        <span className="font-medium text-primary">{SCREEN_LABELS[activeScreen]}</span>
                    </nav>
                </header>
                <main className="flex-1 overflow-y-auto bg-secondary p-4 sm:p-6 lg:p-8">
                    <ScreenContent screen={activeScreen} navigate={navigate} />
                </main>
            </div>
        </div>
    );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export const TenantFlow = ({ initialNav, initialMenuOpen }: { initialNav?: string; initialMenuOpen?: boolean }) => {
    return <DashboardShell initialNav={initialNav} initialMenuOpen={initialMenuOpen} />;
};
