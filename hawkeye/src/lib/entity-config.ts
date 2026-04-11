import type { FC } from "react";
import {
  Building05,
  Users01,
  Building01,
  File06,
  Ticket01,
  Truck01,
  CreditCard02,
  Box,
  LayoutGrid01,
  Key01,
  Tool02,
  Zap,
  Activity,
  Lightning01,
  Globe01,
  Settings01,
  Target04,
  CheckDone01,
  FileCheck01,
  Award01,
  Star01,
  Home01,
  Phone,
  Briefcase01,
  CreditCard01,
  Tag01,
  Users02,
  Package,
  Sliders01,
  Hash01,
  LayersTwo01,
  Receipt,
} from "@untitledui/icons";
import type { ViewType } from "@/components/views/view-switcher";

export interface ChildObjectConfig {
  label: string;
  objectName: string;
  icon: FC<{ className?: string }>;
}

export interface EntityConfig {
  slug: string;
  objectName: string;
  label: string;
  labelSingular: string;
  icon: FC<{ className?: string }>;
  children: ChildObjectConfig[];
  defaultView: ViewType;
  kanbanField?: string;
  calendarField?: string;
}

export const ENTITIES: EntityConfig[] = [
  {
    slug: "properties",
    objectName: "property",
    label: "Properties",
    labelSingular: "Property",
    icon: Building05,
    defaultView: "table",
    children: [
      { label: "Rooms", objectName: "room", icon: LayoutGrid01 },
      { label: "Room Availability", objectName: "roomAvailability", icon: Key01 },
      { label: "Overheads", objectName: "overhead", icon: Receipt },
      { label: "Electricity", objectName: "overheadElectricity", icon: Zap },
      { label: "Water", objectName: "overheadWater", icon: Activity },
      { label: "Gas", objectName: "overheadGas", icon: Lightning01 },
      { label: "WiFi", objectName: "overheadWifi", icon: Globe01 },
      { label: "Pipeline", objectName: "propertyLeadStage", icon: Target04 },
      { label: "Active", objectName: "propertyActive", icon: CheckDone01 },
      { label: "Churned", objectName: "propertyChurned", icon: Activity },
    ],
  },
  {
    slug: "tenants",
    objectName: "tenant",
    label: "Tenants",
    labelSingular: "Tenant",
    icon: Users01,
    defaultView: "table",
    children: [
      { label: "Requirements", objectName: "tenantRequirement", icon: FileCheck01 },
      { label: "Qualification", objectName: "tenantQualification", icon: Award01 },
      { label: "Contract Details", objectName: "tenantContractDetail", icon: File06 },
      { label: "Satisfaction", objectName: "tenantSatisfaction", icon: Star01 },
      { label: "Visits", objectName: "tenantVisitSummary", icon: Home01 },
      { label: "Attribution", objectName: "tenantAttribution", icon: Target04 },
      { label: "Tickets", objectName: "tenantTicketDetail", icon: Ticket01 },
    ],
  },
  {
    slug: "merchants",
    objectName: "merchant",
    label: "Merchants",
    labelSingular: "Merchant",
    icon: Building01,
    defaultView: "table",
    children: [
      { label: "POC", objectName: "merchantPoc", icon: Phone },
      { label: "Landlord", objectName: "merchantLandlord", icon: Home01 },
      { label: "Contracts", objectName: "merchantContractDetail", icon: File06 },
      { label: "Management", objectName: "merchantManagement", icon: Settings01 },
      { label: "Broker", objectName: "merchantBroker", icon: Briefcase01 },
    ],
  },
  {
    slug: "contracts",
    objectName: "contract",
    label: "Contracts",
    labelSingular: "Contract",
    icon: File06,
    defaultView: "table",
    calendarField: "lockInEndDate",
    children: [],
  },
  {
    slug: "tickets",
    objectName: "ticket",
    label: "Tickets",
    labelSingular: "Ticket",
    icon: Ticket01,
    defaultView: "kanban",
    kanbanField: "ticketCategory",
    children: [
      { label: "Tenant Details", objectName: "tenantTicketDetail", icon: Users01 },
      { label: "Vendor Details", objectName: "vendorTicketDetail", icon: Tool02 },
    ],
  },
  {
    slug: "vendors",
    objectName: "vendor",
    label: "Vendors",
    labelSingular: "Vendor",
    icon: Truck01,
    defaultView: "table",
    children: [
      { label: "Contacts", objectName: "vendorContact", icon: Phone },
      { label: "Commercial", objectName: "vendorCommercial", icon: CreditCard01 },
      { label: "Billing", objectName: "vendorBilling", icon: Receipt },
      { label: "Capability", objectName: "vendorCapability", icon: Tool02 },
    ],
  },
  {
    slug: "transactions",
    objectName: "transaction",
    label: "Transactions",
    labelSingular: "Transaction",
    icon: CreditCard02,
    defaultView: "table",
    kanbanField: "status",
    children: [
      { label: "Payments", objectName: "transactionPayment", icon: CreditCard01 },
      { label: "Links", objectName: "transactionLink", icon: Hash01 },
      { label: "Line Items", objectName: "transactionLineItem", icon: LayersTwo01 },
      { label: "Purchase Orders", objectName: "transactionPurchaseOrder", icon: FileCheck01 },
      { label: "Parties", objectName: "transactionParty", icon: Users02 },
      { label: "Classification", objectName: "transactionClassification", icon: Tag01 },
    ],
  },
  {
    slug: "inventory",
    objectName: "item",
    label: "Inventory",
    labelSingular: "Item",
    icon: Box,
    defaultView: "table",
    children: [
      { label: "FSIN", objectName: "fsin", icon: Package },
      { label: "FSIN Spec", objectName: "fsinSpecification", icon: Sliders01 },
      { label: "Item State", objectName: "itemState", icon: Box },
      { label: "Transaction Links", objectName: "itemTransactionLink", icon: Hash01 },
    ],
  },
];

// Lookup: slug -> EntityConfig
export const ENTITY_BY_SLUG: Record<string, EntityConfig> = {};
for (const entity of ENTITIES) {
  ENTITY_BY_SLUG[entity.slug] = entity;
}

// Lookup: objectName -> EntityConfig (for reverse mapping)
export const ENTITY_BY_OBJECT_NAME: Record<string, EntityConfig> = {};
for (const entity of ENTITIES) {
  ENTITY_BY_OBJECT_NAME[entity.objectName] = entity;
}

// All object names that belong to an entity (core + children)
export const ALL_ENTITY_OBJECT_NAMES = new Set<string>();
for (const entity of ENTITIES) {
  ALL_ENTITY_OBJECT_NAMES.add(entity.objectName);
  for (const child of entity.children) {
    ALL_ENTITY_OBJECT_NAMES.add(child.objectName);
  }
}

// Given an objectSlug (from URL), resolve the entity config
// First try as a slug (e.g., "properties"), then as an objectName (e.g., "property")
export function resolveEntity(objectSlug: string): EntityConfig | null {
  return ENTITY_BY_SLUG[objectSlug] ?? ENTITY_BY_OBJECT_NAME[objectSlug] ?? null;
}
