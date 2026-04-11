import {
  Users01,
  Building05,
  Building01,
  Target04,
  CheckDone01,
  File06,
  BarChartSquare02,
  Star01,
  Cube01,
  Ticket01,
  Truck01,
  CreditCard01,
  Tool02,
  LayoutGrid01,
  Box,
  Home01,
  Key01,
  Zap,
  Package,
  Tag01,
  Phone,
  Briefcase01,
  Settings01,
  Mail01,
  FileCheck01,
  Award01,
  Activity,
  Globe01,
  Sliders01,
  Lightning01,
  Shield01,
  Hash01,
  LayersTwo01,
} from "@untitledui/icons";
import type { FC } from "react";
import type { ObjectMetadata } from "./types";

// Comprehensive icon map for all Hawkeye CRM object types
export const OBJECT_ICON_MAP: Record<string, FC<{ className?: string }>> = {
  // Core Entities
  property: Building05,
  room: LayoutGrid01,
  tenant: Users01,
  merchant: Building01,
  contract: File06,
  ticket: Ticket01,
  vendor: Truck01,
  item: Box,

  // Property Operations (Overheads)
  overhead: Tool02,
  overheadElectricity: Zap,
  overheadGas: Lightning01,
  overheadWater: Activity,
  overheadWaterPurifier: Shield01,
  overheadWiFi: Globe01,
  overheadDg: Settings01,
  overheadHelper: Users01,
  overheadMaintenance: Tool02,

  // Tenant Lifecycle
  tenantRequirement: FileCheck01,
  tenantQualification: Award01,
  tenantContractDetail: File06,
  tenantSatisfaction: Star01,
  tenantVisitSummary: Home01,
  tenantAttribution: Target04,
  tenantTicketDetail: Ticket01,

  // Room Details
  roomAvailability: Key01,
  roomCommercial: CreditCard01,
  roomFurnishing: Package,
  roomSpecification: Sliders01,

  // Merchant/Landlord
  merchantPoc: Phone,
  merchantLandlord: Building01,
  merchantContractDetail: File06,
  merchantManagement: Briefcase01,
  merchantBroker: Users01,

  // Financial/Transactions
  transaction: CreditCard01,
  transactionPayment: CreditCard01,
  transactionLink: Hash01,
  transactionLineItem: LayersTwo01,
  transactionPurchaseOrder: FileCheck01,
  transactionParty: Users01,
  transactionClassification: Tag01,
  itemTransactionLink: Hash01,

  // Vendor Management
  vendorContact: Phone,
  vendorCommercial: CreditCard01,
  vendorBilling: Mail01,
  vendorCapability: Award01,
  vendorTicketDetail: Ticket01,

  // Pipeline
  propertyLeadStage: Target04,
  propertyActive: CheckDone01,
  propertyChurned: Activity,

  // Inventory
  fsin: Package,
  fsinSpecification: Sliders01,
  itemState: Box,

  // Twenty defaults (kept for compatibility)
  person: Users01,
  company: Building05,
  opportunity: Target04,
  task: CheckDone01,
  note: File06,
  view: BarChartSquare02,
  favorite: Star01,
};

export function getIconForObject(obj: ObjectMetadata): FC<{ className?: string }> {
  return OBJECT_ICON_MAP[obj.nameSingular] ?? Cube01;
}

export { Cube01 };
