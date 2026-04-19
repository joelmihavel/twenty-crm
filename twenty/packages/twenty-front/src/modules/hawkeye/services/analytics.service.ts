// ─────────────────────────────────────────────────────────────────────────────
// BACKEND HANDOFF INSTRUCTIONS
//
// Replace each function body below with a real API call.
// Signatures must NOT change.
// Remove simulateLatency() when switching to live data.
// All analytics endpoints should be under: ${BASE_URL}/analytics/
// ─────────────────────────────────────────────────────────────────────────────

import {
  type LeadSourceData,
  type FunnelStageData,
  type MonthlyConversionData,
  type StageBreakdownData,
  type VisitConversionData,
  type MonthlyCollectionData,
  type CollectionStatusData,
  type OverdueAgingData,
  type LandlordPayoutData,
  type NpsDataPoint,
  type MonthlyTicketData,
  type RevenueCOGSData,
  type TicketCategoryData,
  type RentTrajectoryData,
  type OccupancyRateData,
  type RepairCostData,
  type ResolutionTimeData,
  type CategoryData,
  type UnitStateData,
  type ProcurementData,
  type BoardStatusData,
  type SlaBreachData,
  type RentRollEntry,
  type DepositEntry,
  type RentCollectionEntry,
  type PropertyPnlEntry,
  type PaymentDeadlineEntry,
} from '../types/analytics.types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// ── Demand Dashboard ──────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/analytics/lead-sources?month=${month}`)
export async function getLeadSources(): Promise<LeadSourceData[]> {
  await delay();
  return [
    { channel: 'Google Ads', count: 18, percentage: 38 },
    { channel: 'WhatsApp Organic', count: 11, percentage: 23 },
    { channel: 'Housing.com', count: 8, percentage: 17 },
    { channel: 'Referral', count: 5, percentage: 10 },
    { channel: 'Direct Call', count: 3, percentage: 6 },
    { channel: 'Walk-in', count: 3, percentage: 6 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/demand-funnel`)
export async function getDemandFunnel(): Promise<FunnelStageData[]> {
  await delay();
  return [
    { stage: 'New Inquiry', count: 48, fill: '#3B82F6' },
    { stage: 'Visit Scheduled', count: 31, fill: '#3B82F6' },
    { stage: 'Visit Done', count: 24, fill: '#3B82F6' },
    { stage: 'Negotiation', count: 14, fill: '#3B82F6' },
    { stage: 'Converted', count: 9, fill: '#10B981' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/conversion-trend?months=6`)
export async function getConversionTrend(): Promise<MonthlyConversionData[]> {
  await delay();
  return [
    { month: 'Nov', conversions: 7 },
    { month: 'Dec', conversions: 5 },
    { month: 'Jan', conversions: 11 },
    { month: 'Feb', conversions: 8 },
    { month: 'Mar', conversions: 9 },
    { month: 'Apr', conversions: 4 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/pipeline-stage-breakdown`)
export async function getPipelineBreakdown(): Promise<StageBreakdownData[]> {
  await delay();
  return [
    { stage: 'New Inquiry', count: 12, color: '#EAB308' },
    { stage: 'Visit Scheduled', count: 8, color: '#3B82F6' },
    { stage: 'Visit Done', count: 6, color: '#0EA5E9' },
    { stage: 'Negotiation', count: 4, color: '#F97316' },
    { stage: 'Converted', count: 3, color: '#A855F7' },
    { stage: 'Gestation', count: 2, color: '#A855F7' },
    { stage: 'Moved In', count: 14, color: '#10B981' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/visit-conversion?months=6`)
export async function getVisitConversionData(): Promise<VisitConversionData[]> {
  await delay();
  return [
    { month: 'Nov', visits: 14, conversions: 7, rate: 50 },
    { month: 'Dec', visits: 10, conversions: 5, rate: 50 },
    { month: 'Jan', visits: 18, conversions: 11, rate: 61 },
    { month: 'Feb', visits: 13, conversions: 8, rate: 62 },
    { month: 'Mar', visits: 16, conversions: 9, rate: 56 },
    { month: 'Apr', visits: 9, conversions: 4, rate: 44 },
  ];
}

// ── Rent Dashboard ────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/analytics/collection-trend?months=6`)
export async function getCollectionTrend(): Promise<MonthlyCollectionData[]> {
  await delay();
  return [
    { month: 'Nov', collected: 4250000, target: 4500000 },
    { month: 'Dec', collected: 4180000, target: 4500000 },
    { month: 'Jan', collected: 4620000, target: 4800000 },
    { month: 'Feb', collected: 4390000, target: 4800000 },
    { month: 'Mar', collected: 4810000, target: 4800000 },
    { month: 'Apr', collected: 3720000, target: 4800000 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/collection-status`)
export async function getCollectionStatus(): Promise<CollectionStatusData[]> {
  await delay();
  return [
    { status: 'Paid', count: 38, amount: 3420000 },
    { status: 'Overdue', count: 12, amount: 357000 },
    { status: 'Upcoming', count: 8, amount: 320000 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/overdue-aging`)
export async function getOverdueAging(): Promise<OverdueAgingData[]> {
  await delay();
  return [
    { bucket: '1–5 days', count: 6, totalAmount: 165000, color: '#EAB308' },
    { bucket: '6–10 days', count: 3, totalAmount: 88000, color: '#F97316' },
    { bucket: '11–15 days', count: 2, totalAmount: 64000, color: '#EF4444' },
    { bucket: '15+ days', count: 1, totalAmount: 40000, color: '#991B1B' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/landlord-payout-by-cluster`)
export async function getLandlordPayoutByCluster(): Promise<LandlordPayoutData[]> {
  await delay();
  return [
    { cluster: 'HSR Layout', paid: 1250000, pending: 180000, overdue: 45000 },
    { cluster: 'Koramangala', paid: 980000, pending: 120000, overdue: 30000 },
    { cluster: 'Bellandur', paid: 640000, pending: 90000, overdue: 0 },
    { cluster: 'Indiranagar', paid: 520000, pending: 60000, overdue: 25000 },
  ];
}

// ── Tenant Detail ─────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}/analytics/nps-trend`)
export async function getTenantNpsTrend(tenantId: string): Promise<NpsDataPoint[]> {
  await delay();
  const _id = tenantId;
  return [
    { date: '2024-09-15', score: 7, category: 'Passive' },
    { date: '2024-11-20', score: 8, category: 'Passive' },
    { date: '2025-01-10', score: 9, category: 'Promoter' },
    { date: '2025-03-05', score: 8, category: 'Passive' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}/analytics/ticket-volume?months=6`)
export async function getTenantTicketVolume(tenantId: string): Promise<MonthlyTicketData[]> {
  await delay();
  const _id = tenantId;
  return [
    { month: 'Nov', count: 1 },
    { month: 'Dec', count: 0 },
    { month: 'Jan', count: 2 },
    { month: 'Feb', count: 1 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 1 },
  ];
}

// ── PID Detail ────────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/analytics/revenue-cogs?months=6`)
export async function getPidRevenueCogs(pidId: string): Promise<RevenueCOGSData[]> {
  await delay();
  const _id = pidId;
  return [
    { month: 'Nov', revenue: 285000, cogs: 195000, margin: 90000 },
    { month: 'Dec', revenue: 285000, cogs: 198000, margin: 87000 },
    { month: 'Jan', revenue: 310000, cogs: 201000, margin: 109000 },
    { month: 'Feb', revenue: 310000, cogs: 205000, margin: 105000 },
    { month: 'Mar', revenue: 310000, cogs: 210000, margin: 100000 },
    { month: 'Apr', revenue: 240000, cogs: 210000, margin: 30000 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/analytics/ticket-categories`)
export async function getPidTicketCategories(pidId: string): Promise<TicketCategoryData[]> {
  await delay();
  const _id = pidId;
  return [
    { category: 'Plumbing', count: 5 },
    { category: 'Electrical', count: 3 },
    { category: 'Appliance', count: 4 },
    { category: 'Carpentry', count: 2 },
    { category: 'Other', count: 1 },
  ];
}

// ── RID Detail ────────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/analytics/rent-trajectory`)
export async function getRidRentTrajectory(ridId: string): Promise<RentTrajectoryData[]> {
  await delay();
  const _id = ridId;
  return [
    { contractStart: '2023-06-01', rent: 22000, tenantName: 'Arjun S.', tenantId: 'T-001', duration: 8 },
    { contractStart: '2024-02-15', rent: 24000, tenantName: 'Priya M.', tenantId: 'T-002', duration: 6 },
    { contractStart: '2024-09-01', rent: 26000, tenantName: 'Rahul K.', tenantId: 'T-003', duration: 7 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/analytics/occupancy-rate`)
export async function getRidOccupancyRate(ridId: string): Promise<OccupancyRateData> {
  await delay();
  const _id = ridId;
  return { rate: 82, occupiedMonths: 18, vacantMonths: 3, maintenanceMonths: 1 };
}

// ── Item Detail ───────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/items/${id}/analytics/repair-cost`)
export async function getItemRepairCost(itemId: string): Promise<RepairCostData[]> {
  await delay();
  const _id = itemId;
  return [
    { date: '2024-03-10', incident: 'Fan motor repair', cost: 800, cumulative: 800, size: 'small' },
    { date: '2024-07-22', incident: 'Compressor fix', cost: 4500, cumulative: 5300, size: 'medium' },
    { date: '2024-11-05', incident: 'Gas refill', cost: 1200, cumulative: 6500, size: 'medium' },
    { date: '2025-02-18', incident: 'PCB replacement', cost: 6200, cumulative: 12700, size: 'large' },
  ];
}

// ── Vendor Detail ─────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/ticket-volume?months=6`)
export async function getVendorTicketVolume(vendorId: string): Promise<MonthlyTicketData[]> {
  await delay();
  const _id = vendorId;
  return [
    { month: 'Nov', count: 3 },
    { month: 'Dec', count: 2 },
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 4 },
    { month: 'Mar', count: 3 },
    { month: 'Apr', count: 2 },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/resolution-time`)
export async function getVendorResolutionTime(vendorId: string): Promise<ResolutionTimeData[]> {
  await delay();
  const _id = vendorId;
  return [
    { bucket: '< 24h', count: 5, color: '#10B981' },
    { bucket: '24–48h', count: 4, color: '#0EA5E9' },
    { bucket: '2–5 days', count: 3, color: '#F97316' },
    { bucket: '5+ days', count: 1, color: '#EF4444' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/category-breakdown`)
export async function getVendorCategoryBreakdown(vendorId: string): Promise<CategoryData[]> {
  await delay();
  const _id = vendorId;
  return [
    { category: 'Plumbing', count: 5 },
    { category: 'Electrical', count: 4 },
    { category: 'Appliance', count: 3 },
    { category: 'Carpentry', count: 2 },
    { category: 'Other', count: 1 },
  ];
}

// ── FSIN Detail ───────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/analytics/unit-states`)
export async function getFsinUnitStates(fsinId: string): Promise<UnitStateData[]> {
  await delay();
  const _id = fsinId;
  return [
    { state: 'PIB', count: 12, color: '#A855F7' },
    { state: 'WIB', count: 3, color: '#EAB308' },
    { state: 'WOB', count: 2, color: '#EAB308' },
    { state: 'WORK', count: 4, color: '#EC4899' },
    { state: 'POB', count: 1, color: '#14B8A6' },
    { state: 'DEAD', count: 2, color: '#6B7280' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/analytics/procurement-history`)
export async function getFsinProcurementHistory(fsinId: string): Promise<ProcurementData[]> {
  await delay();
  const _id = fsinId;
  return [
    { month: 'Sep 24', units: 5, cumulative: 5 },
    { month: 'Oct 24', units: 3, cumulative: 8 },
    { month: 'Nov 24', units: 0, cumulative: 8 },
    { month: 'Dec 24', units: 4, cumulative: 12 },
    { month: 'Jan 25', units: 6, cumulative: 18 },
    { month: 'Feb 25', units: 2, cumulative: 20 },
    { month: 'Mar 25', units: 4, cumulative: 24 },
  ];
}

// ── Board ─────────────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/analytics/board/ticket-status`)
export async function getBoardTicketStatus(): Promise<BoardStatusData[]> {
  await delay();
  return [
    { status: 'New', count: 4, color: '#3B82F6' },
    { status: 'W.Customer', count: 3, color: '#0EA5E9' },
    { status: 'W.Vendor', count: 2, color: '#F97316' },
    { status: 'Blocked', count: 1, color: '#EF4444' },
    { status: 'W.Pay', count: 2, color: '#EAB308' },
    { status: 'Ready', count: 1, color: '#14B8A6' },
    { status: 'Closed', count: 5, color: '#6B7280' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/board/sla-breach-rate`)
export async function getBoardSlaBreachRate(): Promise<SlaBreachData> {
  await delay();
  return { rate: 23, breached: 3, total: 13 };
}

// ── Finance Views ────────────────────────────────────────────────

// MOCK — replace with: fetch(`${BASE_URL}/analytics/rent-roll`)
export async function getRentRoll(): Promise<RentRollEntry[]> {
  await delay();
  return [
    { pid: 'PID1', rid: '09BR1', tenantName: 'Rahul Nene', tenantId: 'TNT-001', monthlyLicenseFee: 15000, maintenanceFee: 2000, furnishingFee: 5000, convenienceFee: 500, gst: 2700, totalRent: 25200, contractEnd: '2025-11-30', status: 'Active' },
    { pid: 'PID2', rid: '09BR5', tenantName: 'Abhinav Garg', tenantId: 'TNT-002', monthlyLicenseFee: 20000, maintenanceFee: 3000, furnishingFee: 4000, convenienceFee: 500, gst: 3300, totalRent: 30800, contractEnd: '2025-10-31', status: 'Active' },
    { pid: 'PID1', rid: '09BR2', tenantName: 'Priya Mehta', tenantId: 'TNT-003', monthlyLicenseFee: 14000, maintenanceFee: 2000, furnishingFee: 3500, convenienceFee: 500, gst: 2400, totalRent: 22400, contractEnd: '2025-06-15', status: 'Expiring' },
    { pid: 'PID3', rid: '18BR1', tenantName: 'Suresh Kumar', tenantId: 'TNT-004', monthlyLicenseFee: 18000, maintenanceFee: 2500, furnishingFee: 4500, convenienceFee: 500, gst: 3060, totalRent: 28560, contractEnd: '2025-09-30', status: 'Active' },
    { pid: 'PID2', rid: '09BR6', tenantName: 'Anita Reddy', tenantId: 'TNT-005', monthlyLicenseFee: 22000, maintenanceFee: 3000, furnishingFee: 5000, convenienceFee: 500, gst: 3660, totalRent: 34160, contractEnd: '2025-04-30', status: 'Expired' },
    { pid: 'PID1', rid: '09BR3', tenantName: 'Vikram Singh', tenantId: 'TNT-006', monthlyLicenseFee: 16000, maintenanceFee: 2000, furnishingFee: 4000, convenienceFee: 500, gst: 2700, totalRent: 25200, contractEnd: '2026-01-31', status: 'Active' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/deposit-tracker`)
export async function getDepositTracker(): Promise<DepositEntry[]> {
  await delay();
  return [
    { contractId: 'CNT-T-2025-001', tenantName: 'Rahul Nene', tenantId: 'TNT-001', pid: 'PID1', rid: '09BR1', securityDeposit: 30000, cautionDeposit: 30000, totalDeposit: 60000, depositStatus: 'Paid', fmrStatus: 'Paid', contractEnd: '2025-11-30' },
    { contractId: 'CNT-T-2025-002', tenantName: 'Abhinav Garg', tenantId: 'TNT-002', pid: 'PID2', rid: '09BR5', securityDeposit: 40000, cautionDeposit: 40000, totalDeposit: 80000, depositStatus: 'Paid', fmrStatus: 'Paid', contractEnd: '2025-10-31' },
    { contractId: 'CNT-T-2025-003', tenantName: 'Priya Mehta', tenantId: 'TNT-003', pid: 'PID1', rid: '09BR2', securityDeposit: 28000, cautionDeposit: 28000, totalDeposit: 56000, depositStatus: 'Partial', fmrStatus: 'Paid', contractEnd: '2025-06-15' },
    { contractId: 'CNT-T-2025-004', tenantName: 'Suresh Kumar', tenantId: 'TNT-004', pid: 'PID3', rid: '18BR1', securityDeposit: 36000, cautionDeposit: 36000, totalDeposit: 72000, depositStatus: 'Paid', fmrStatus: 'Paid', contractEnd: '2025-09-30' },
    { contractId: 'CNT-T-2025-005', tenantName: 'Anita Reddy', tenantId: 'TNT-005', pid: 'PID2', rid: '09BR6', securityDeposit: 44000, cautionDeposit: 44000, totalDeposit: 88000, depositStatus: 'Refund Due', fmrStatus: 'Paid', contractEnd: '2025-04-30' },
    { contractId: 'CNT-T-2025-006', tenantName: 'Vikram Singh', tenantId: 'TNT-006', pid: 'PID1', rid: '09BR3', securityDeposit: 32000, cautionDeposit: 0, totalDeposit: 32000, depositStatus: 'Pending', fmrStatus: 'Pending', contractEnd: '2026-01-31' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/rent-collection`)
export async function getRentCollection(): Promise<RentCollectionEntry[]> {
  await delay();
  return [
    { tenantName: 'Rahul Nene', tenantId: 'TNT-001', pid: 'PID1', rid: '09BR1', expectedRent: 25200, collectedAmount: 25200, outstanding: 0, dueDate: '2025-04-05', status: 'Paid' },
    { tenantName: 'Abhinav Garg', tenantId: 'TNT-002', pid: 'PID2', rid: '09BR5', expectedRent: 30800, collectedAmount: 30800, outstanding: 0, dueDate: '2025-04-05', status: 'Paid' },
    { tenantName: 'Priya Mehta', tenantId: 'TNT-003', pid: 'PID1', rid: '09BR2', expectedRent: 22400, collectedAmount: 14000, outstanding: 8400, dueDate: '2025-04-05', status: 'Partial' },
    { tenantName: 'Suresh Kumar', tenantId: 'TNT-004', pid: 'PID3', rid: '18BR1', expectedRent: 28560, collectedAmount: 0, outstanding: 28560, dueDate: '2025-04-05', status: 'Overdue' },
    { tenantName: 'Vikram Singh', tenantId: 'TNT-006', pid: 'PID1', rid: '09BR3', expectedRent: 25200, collectedAmount: 0, outstanding: 25200, dueDate: '2025-04-20', status: 'Upcoming' },
    { tenantName: 'Deepa Nair', tenantId: 'TNT-007', pid: 'PID3', rid: '18BR2', expectedRent: 19800, collectedAmount: 19800, outstanding: 0, dueDate: '2025-04-05', status: 'Paid' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/property-pnl`)
export async function getPropertyPnl(): Promise<PropertyPnlEntry[]> {
  await delay();
  return [
    { pid: 'PID1', address: '301, Sobha Dream Acres, HSR Layout', cluster: 'HSR', tenantRevenue: 72800, merchantRent: 45000, overheadsCost: 5500, netMargin: 22300, marginPercent: 30.6, occupancy: '3/4' },
    { pid: 'PID2', address: '502, Prestige Lakeside Habitat, Bellandur', cluster: 'BLD', tenantRevenue: 64960, merchantRent: 38000, overheadsCost: 6200, netMargin: 20760, marginPercent: 31.9, occupancy: '2/3' },
    { pid: 'PID3', address: '204, Brigade Gateway, Rajajinagar', cluster: 'MGR', tenantRevenue: 48360, merchantRent: 32000, overheadsCost: 4800, netMargin: 11560, marginPercent: 23.9, occupancy: '2/2' },
  ];
}

// MOCK — replace with: fetch(`${BASE_URL}/analytics/payment-deadlines`)
export async function getPaymentDeadlines(): Promise<PaymentDeadlineEntry[]> {
  await delay();
  return [
    { entityType: 'Tenant Rent', entityId: 'TNT-004', entityName: 'Suresh Kumar', pid: 'PID3', amount: 28560, dueDate: '2025-04-05', dayOfMonth: '5th', status: 'Overdue' },
    { entityType: 'Merchant Rent', entityId: 'PID1', entityName: 'Sobha Dream Acres', pid: 'PID1', amount: 45000, dueDate: '2025-04-10', dayOfMonth: '10th', status: 'Upcoming' },
    { entityType: 'Overhead', entityId: 'OH-001', entityName: 'Maintenance — PID1', pid: 'PID1', amount: 2000, dueDate: '2025-04-03', dayOfMonth: '3rd', status: 'Due Today' },
    { entityType: 'Tenant Rent', entityId: 'TNT-006', entityName: 'Vikram Singh', pid: 'PID1', amount: 25200, dueDate: '2025-04-20', dayOfMonth: '20th', status: 'Upcoming' },
    { entityType: 'Merchant Rent', entityId: 'PID2', entityName: 'Prestige Lakeside', pid: 'PID2', amount: 38000, dueDate: '2025-04-15', dayOfMonth: '15th', status: 'Upcoming' },
    { entityType: 'Overhead', entityId: 'OH-003', entityName: 'Electricity — PID2', pid: 'PID2', amount: 3200, dueDate: '2025-04-01', dayOfMonth: '1st', status: 'Overdue' },
    { entityType: 'Tenant Rent', entityId: 'TNT-003', entityName: 'Priya Mehta', pid: 'PID1', amount: 8400, dueDate: '2025-04-05', dayOfMonth: '5th', status: 'Overdue' },
    { entityType: 'Merchant Rent', entityId: 'PID3', entityName: 'Brigade Gateway', pid: 'PID3', amount: 32000, dueDate: '2025-04-25', dayOfMonth: '25th', status: 'Upcoming' },
  ];
}
